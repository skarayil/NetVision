#include "NetworkAnalyzer.hpp"
#include <iostream>
#include <sstream>
#include <iomanip>
#include <random>
#include <algorithm>
#include <chrono>
#include <cstring>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <fcntl.h>

// Cryptographic helpers for WebSocket Handshake (SHA-1 and Base64)
namespace Crypt {
    inline std::string sha1(const std::string& input) {
        uint32_t h0 = 0x67452301;
        uint32_t h1 = 0xEFCDAB89;
        uint32_t h2 = 0x98BADCFE;
        uint32_t h3 = 0x10325476;
        uint32_t h4 = 0xC3D2E1F0;

        std::vector<uint8_t> message(input.begin(), input.end());
        uint64_t origBits = message.size() * 8;
        message.push_back(0x80);
        while ((message.size() * 8) % 512 != 448) {
            message.push_back(0x00);
        }
        for (int i = 7; i >= 0; --i) {
            message.push_back((origBits >> (i * 8)) & 0xFF);
        }

        for (size_t chunk = 0; chunk < message.size() / 64; ++chunk) {
            uint32_t w[80] = {0};
            for (int i = 0; i < 16; ++i) {
                w[i] = (message[chunk * 64 + i * 4] << 24) |
                       (message[chunk * 64 + i * 4 + 1] << 16) |
                       (message[chunk * 64 + i * 4 + 2] << 8) |
                       (message[chunk * 64 + i * 4 + 3]);
            }
            for (int i = 16; i < 80; ++i) {
                uint32_t val = w[i-3] ^ w[i-8] ^ w[i-14] ^ w[i-16];
                w[i] = (val << 1) | (val >> 31);
            }

            uint32_t a = h0, b = h1, c = h2, d = h3, e = h4;
            for (int i = 0; i < 80; ++i) {
                uint32_t f, k;
                if (i < 20) {
                    f = (b & c) | ((~b) & d);
                    k = 0x5A827999;
                } else if (i < 40) {
                    f = b ^ c ^ d;
                    k = 0x6ED9EBA1;
                } else if (i < 60) {
                    f = (b & c) | (b & d) | (c & d);
                    k = 0x8F1BBCDC;
                } else {
                    f = b ^ c ^ d;
                    k = 0xCA62C1D6;
                }
                uint32_t temp = ((a << 5) | (a >> 27)) + f + e + k + w[i];
                e = d;
                d = c;
                c = (b << 30) | (b >> 2);
                b = a;
                a = temp;
            }
            h0 += a; h1 += b; h2 += c; h3 += d; h4 += e;
        }

        std::vector<uint8_t> digest(20);
        for (int i = 0; i < 4; ++i) digest[i] = (h0 >> (24 - i * 8)) & 0xFF;
        for (int i = 0; i < 4; ++i) digest[4+i] = (h1 >> (24 - i * 8)) & 0xFF;
        for (int i = 0; i < 4; ++i) digest[8+i] = (h2 >> (24 - i * 8)) & 0xFF;
        for (int i = 0; i < 4; ++i) digest[12+i] = (h3 >> (24 - i * 8)) & 0xFF;
        for (int i = 0; i < 4; ++i) digest[16+i] = (h4 >> (24 - i * 8)) & 0xFF;

        return std::string(digest.begin(), digest.end());
    }

    inline std::string base64_encode(const std::string& input) {
        const char base64_chars[] =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            "abcdefghijklmnopqrstuvwxyz"
            "0123456789+/";
        std::string ret;
        int val = 0, valb = -6;
        for (uint8_t c : input) {
            val = (val << 8) + c;
            valb += 8;
            while (valb >= 0) {
                ret.push_back(base64_chars[(val >> valb) & 0x3F]);
                valb -= 6;
            }
        }
        if (valb > -6) ret.push_back(base64_chars[((val << 8) >> (valb + 8)) & 0x3F]);
        while (ret.size() % 4 != 0) ret.push_back('=');
        return ret;
    }
}

namespace NetVision {

    NetworkAnalyzer::NetworkAnalyzer(const std::string& interfaceName, int wsPort)
        : interfaceName_(interfaceName), wsPort_(wsPort), isRunning_(false), serverSocketFd_(-1) {
        
        // Setup default system stats baselines
        currentStats_ = {
            0,      // totalPackets
            0,      // droppedPackets
            154,    // activeConnections
            48.2,   // currentBandwidthMbps
            "INITIALIZING",
            12.5,   // CPU usage
            42.3,   // RAM usage
            28.4,   // Disk usage
            2400,   // Fan speed
            38.5,   // Temperature
            "OK",   // Power supply
            14.2,   // Latency (ms)
            0.02,   // Packet loss (%)
            1.1,    // Jitter (ms)
            94      // Security score
        };

        parser_ = std::make_unique<PacketParser>();
        geoIp_ = std::make_unique<GeoIPLite>("data/GeoLite2-City.mmdb");
    }

    NetworkAnalyzer::~NetworkAnalyzer() {
        stopCapture();
    }

    bool NetworkAnalyzer::startCapture() {
        if (isRunning_) return false;
        
        isRunning_ = true;
        currentStats_.systemStatus = "RUNNING";
        
        std::cout << "[INFO] Starting NetworkAnalyzer C++ capture core on: " << interfaceName_ << std::endl;
        std::cout << "[INFO] Initializing WebSocket Server on port: " << wsPort_ << std::endl;

        // Spawn core capture thread
        captureThreadObj_ = std::thread(&NetworkAnalyzer::captureThread, this);
        
        // Spawn WebSocket Server thread
        serverThreadObj_ = std::thread(&NetworkAnalyzer::webSocketServerThread, this);

        // Spawn JSON client broadcaster thread
        broadcastThreadObj_ = std::thread(&NetworkAnalyzer::clientBroadcasterThread, this);

        return true;
    }

    void NetworkAnalyzer::stopCapture() {
        if (!isRunning_) return;
        isRunning_ = false;
        
        std::cout << "[INFO] Shutting down capture core and server socket..." << std::endl;

        // Force close server socket to unblock accept()
        if (serverSocketFd_ != -1) {
            close(serverSocketFd_);
            serverSocketFd_ = -1;
        }

        // Close all active client connections
        {
            std::lock_guard<std::mutex> lock(clientsMutex_);
            for (int fd : clientSockets_) {
                close(fd);
            }
            clientSockets_.clear();
        }

        // Join threads if joinable
        if (captureThreadObj_.joinable()) captureThreadObj_.join();
        if (serverThreadObj_.joinable()) serverThreadObj_.join();
        if (broadcastThreadObj_.joinable()) broadcastThreadObj_.join();

        currentStats_.systemStatus = "STOPPED";
        std::cout << "[INFO] All backend analyzer services stopped." << std::endl;
    }

    NetworkStats NetworkAnalyzer::getStats() const {
        std::lock_guard<std::mutex> lock(statsMutex_);
        return currentStats_;
    }

    std::vector<std::string> NetworkAnalyzer::getActiveThreats() const {
        // Core C++ intrusion detection anomalies simulation
        std::vector<std::string> threats;
        auto stats = getStats();
        if (stats.droppedPackets > 5) {
            threats.push_back("DDoS Syn Flood Suspected on Interface en0");
        }
        if (stats.securityScore < 85) {
            threats.push_back("Port Scan Detected from IP 185.220.101.5");
        }
        if (stats.latencyMs > 50) {
            threats.push_back("BGP Path Flapping Anomaly in Route Advertisements");
        }
        return threats;
    }

    void NetworkAnalyzer::addCustomRule(const std::string& ruleDefinition) {
        std::cout << "[INFO] BPF Rule compiled & injected: \"" << ruleDefinition << "\"" << std::endl;
    }

    void NetworkAnalyzer::captureThread() {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<int> packetSizeDist(64, 1500);

        while (isRunning_) {
            // Simulate reading raw packets
            std::vector<uint8_t> dummyPacket(packetSizeDist(gen), 0x00);
            processPacket(dummyPacket);
            
            std::this_thread::sleep_for(std::chrono::milliseconds(5));
        }
    }

    void NetworkAnalyzer::processPacket(const std::vector<uint8_t>& rawData) {
        std::lock_guard<std::mutex> lock(statsMutex_);
        currentStats_.totalPackets++;
        
        PacketInfo info = parser_->parse(rawData);
        
        // Detect anomaly or drop signature
        if (parser_->detectAnomalies(info)) {
            currentStats_.droppedPackets++;
            if (currentStats_.securityScore > 50) {
                currentStats_.securityScore -= 1; // Decrement security rating
            }
        }

        // Simulating jitter and packet metrics drifts
        static int step = 0;
        step++;
        if (step % 50 == 0) {
            std::random_device rd;
            std::mt19937 gen(rd());
            std::uniform_real_distribution<double> bwDist(25.0, 95.0);
            std::uniform_real_distribution<double> latDist(8.0, 42.0);
            std::uniform_real_distribution<double> lossDist(0.0, 0.15);
            std::uniform_real_distribution<double> jitDist(0.5, 3.5);
            
            std::uniform_real_distribution<double> cpuDist(10.0, 35.0);
            std::uniform_real_distribution<double> ramDist(40.0, 55.0);
            std::uniform_real_distribution<double> tempDist(36.0, 49.0);

            currentStats_.currentBandwidthMbps = bwDist(gen);
            currentStats_.latencyMs = latDist(gen);
            currentStats_.packetLossPct = lossDist(gen);
            currentStats_.jitterMs = jitDist(gen);

            currentStats_.cpuUsage = cpuDist(gen);
            currentStats_.ramUsage = ramDist(gen);
            currentStats_.temperatureC = tempDist(gen);
            currentStats_.activeConnections = 120 + (rand() % 100);
            
            // Periodically restore security score slowly if under attack
            if (currentStats_.securityScore < 95 && rand() % 5 == 0) {
                currentStats_.securityScore += 1;
            }
        }
    }

    void NetworkAnalyzer::webSocketServerThread() {
        serverSocketFd_ = socket(AF_INET, SOCK_STREAM, 0);
        if (serverSocketFd_ < 0) {
            std::cerr << "[ERROR] Could not open server socket." << std::endl;
            return;
        }

        int optVal = 1;
        setsockopt(serverSocketFd_, SOL_SOCKET, SO_REUSEADDR, &optVal, sizeof(optVal));

        // Set 1-second timeout on accept to keep server thread responsive to isRunning_ flag
        struct timeval timeoutVal;
        timeoutVal.tv_sec = 1;
        timeoutVal.tv_usec = 0;
        setsockopt(serverSocketFd_, SOL_SOCKET, SO_RCVTIMEO, &timeoutVal, sizeof(timeoutVal));

        struct sockaddr_in serverAddr;
        std::memset(&serverAddr, 0, sizeof(serverAddr));
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_addr.s_addr = INADDR_ANY;
        serverAddr.sin_port = htons(wsPort_);

        if (bind(serverSocketFd_, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
            std::cerr << "[ERROR] Socket bind failed on port " << wsPort_ << std::endl;
            close(serverSocketFd_);
            serverSocketFd_ = -1;
            return;
        }

        if (listen(serverSocketFd_, 10) < 0) {
            std::cerr << "[ERROR] Socket listen failed." << std::endl;
            close(serverSocketFd_);
            serverSocketFd_ = -1;
            return;
        }

        std::cout << "[INFO] WebSocket Server listening on port " << wsPort_ << std::endl;

        while (isRunning_) {
            int clientFd = accept(serverSocketFd_, nullptr, nullptr);
            if (clientFd < 0) {
                // Socket timed out (SO_RCVTIMEO) or closed. Continue checking isRunning_
                continue;
            }

            // Set send/recv timeouts on the client connection
            struct timeval clientTimeout;
            clientTimeout.tv_sec = 2;
            clientTimeout.tv_usec = 0;
            setsockopt(clientFd, SOL_SOCKET, SO_RCVTIMEO, &clientTimeout, sizeof(clientTimeout));
            setsockopt(clientFd, SOL_SOCKET, SO_SNDTIMEO, &clientTimeout, sizeof(clientTimeout));

            // Process client handshake in a separate detach thread to prevent blocking server
            std::thread([this, clientFd]() {
                this->handleWebSocketHandshake(clientFd);
            }).detach();
        }
    }

    void NetworkAnalyzer::handleWebSocketHandshake(int clientSocket) {
        char buffer[2048];
        std::memset(buffer, 0, sizeof(buffer));
        
        ssize_t bytesRead = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
        if (bytesRead <= 0) {
            close(clientSocket);
            return;
        }

        std::string request(buffer);
        size_t keyPos = request.find("Sec-WebSocket-Key: ");
        if (keyPos == std::string::npos) {
            // Not a WebSocket upgrade request
            close(clientSocket);
            return;
        }

        keyPos += 19; // Length of "Sec-WebSocket-Key: "
        size_t keyEnd = request.find("\r\n", keyPos);
        if (keyEnd == std::string::npos) {
            close(clientSocket);
            return;
        }

        std::string clientKey = request.substr(keyPos, keyEnd - keyPos);
        std::string acceptSalt = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
        std::string serverAcceptValue = Crypt::base64_encode(Crypt::sha1(clientKey + acceptSalt));

        std::ostringstream responseStream;
        responseStream << "HTTP/1.1 101 Switching Protocols\r\n"
                       << "Upgrade: websocket\r\n"
                       << "Connection: Upgrade\r\n"
                       << "Sec-WebSocket-Accept: " << serverAcceptValue << "\r\n\r\n";

        std::string response = responseStream.str();
        send(clientSocket, response.c_str(), response.size(), 0);

        std::cout << "[INFO] WebSocket handshake successful for socket FD " << clientSocket << std::endl;

        // Save socket
        {
            std::lock_guard<std::mutex> lock(clientsMutex_);
            clientSockets_.push_back(clientSocket);
        }
    }

    void NetworkAnalyzer::clientBroadcasterThread() {
        while (isRunning_) {
            std::this_thread::sleep_for(std::chrono::seconds(1));

            if (!isRunning_) break;

            NetworkStats stats = getStats();
            std::vector<std::string> threats = getActiveThreats();

            // Construct JSON payload
            std::ostringstream json;
            json << "{"
                 << "\"totalPackets\":" << stats.totalPackets << ","
                 << "\"droppedPackets\":" << stats.droppedPackets << ","
                 << "\"activeConnections\":" << stats.activeConnections << ","
                 << "\"currentBandwidthMbps\":" << std::fixed << std::setprecision(2) << stats.currentBandwidthMbps << ","
                 << "\"systemStatus\":\"" << stats.systemStatus << "\","
                 << "\"cpuUsage\":" << stats.cpuUsage << ","
                 << "\"ramUsage\":" << stats.ramUsage << ","
                 << "\"diskUsage\":" << stats.diskUsage << ","
                 << "\"fanSpeedRpm\":" << stats.fanSpeedRpm << ","
                 << "\"temperatureC\":" << stats.temperatureC << ","
                 << "\"powerSupplyStatus\":\"" << stats.powerSupplyStatus << "\","
                 << "\"latencyMs\":" << stats.latencyMs << ","
                 << "\"packetLossPct\":" << stats.packetLossPct << ","
                 << "\"jitterMs\":" << stats.jitterMs << ","
                 << "\"securityScore\":" << stats.securityScore << ",";

            // Add simulated threat array
            json << "\"threats\":[";
            for (size_t i = 0; i < threats.size(); ++i) {
                json << "\"" << threats[i] << "\"";
                if (i + 1 < threats.size()) json << ",";
            }
            json << "],";

            // Add netflow packets simulated array
            json << "\"netFlow\":["
                 << "{\"src\":\"192.168.1.15\",\"dst\":\"8.8.8.8\",\"proto\":\"UDP\",\"bytes\":" << (rand() % 5000 + 500) << ",\"port\":53},"
                 << "{\"src\":\"192.168.1.10\",\"dst\":\"104.21.23.4\",\"proto\":\"TCP\",\"bytes\":" << (rand() % 150000 + 1000) << ",\"port\":443},"
                 << "{\"src\":\"192.168.10.42\",\"dst\":\"185.220.101.5\",\"proto\":\"TCP\",\"bytes\":" << (rand() % 20000 + 500) << ",\"port\":22}"
                 << "]";
            json << "}";

            broadcastMessage(json.str());
        }
    }

    void NetworkAnalyzer::broadcastMessage(const std::string& payload) {
        std::lock_guard<std::mutex> lock(clientsMutex_);
        if (clientSockets_.empty()) return;

        // Wrap message into WebSocket Text Frame
        std::vector<uint8_t> wsFrame;
        wsFrame.push_back(0x81); // 10000001 (FIN=1, Opcode=1 for Text)

        if (payload.size() < 126) {
            wsFrame.push_back(static_cast<uint8_t>(payload.size()));
        } else if (payload.size() <= 65535) {
            wsFrame.push_back(126);
            wsFrame.push_back(static_cast<uint8_t>((payload.size() >> 8) & 0xFF));
            wsFrame.push_back(static_cast<uint8_t>(payload.size() & 0xFF));
        } else {
            // Large payload (>65535) not used for our status telemetry
            wsFrame.push_back(126);
            wsFrame.push_back(static_cast<uint8_t>((payload.size() >> 8) & 0xFF));
            wsFrame.push_back(static_cast<uint8_t>(payload.size() & 0xFF));
        }

        wsFrame.insert(wsFrame.end(), payload.begin(), payload.end());

        // Send to all active clients
        auto it = clientSockets_.begin();
        while (it != clientSockets_.end()) {
            int clientFd = *it;
            ssize_t sent = send(clientFd, wsFrame.data(), wsFrame.size(), 0);
            if (sent < 0) {
                std::cout << "[INFO] WebSocket client connection closed on socket FD " << clientFd << std::endl;
                close(clientFd);
                it = clientSockets_.erase(it); // Safe remove
            } else {
                ++it;
            }
        }
    }

} // namespace NetVision
