#ifndef NETWORK_ANALYZER_HPP
#define NETWORK_ANALYZER_HPP

#include <string>
#include <vector>
#include <memory>
#include <thread>
#include <mutex>
#include "PacketParser.hpp"
#include "GeoIPLite.hpp"

namespace NetVision {

    struct NetworkStats {
        uint64_t totalPackets;
        uint64_t droppedPackets;
        uint64_t activeConnections;
        double currentBandwidthMbps;
        std::string systemStatus;
        
        // Extended health and telemetry metrics
        double cpuUsage;
        double ramUsage;
        double diskUsage;
        int fanSpeedRpm;
        double temperatureC;
        std::string powerSupplyStatus;
        
        double latencyMs;
        double packetLossPct;
        double jitterMs;
        int securityScore;
    };

    class NetworkAnalyzer {
    public:
        NetworkAnalyzer(const std::string& interfaceName, int wsPort = 8080);
        ~NetworkAnalyzer();

        bool startCapture();
        void stopCapture();
        
        NetworkStats getStats() const;
        std::vector<std::string> getActiveThreats() const;
        
        void addCustomRule(const std::string& ruleDefinition);

    private:
        void captureThread();
        void webSocketServerThread();
        void clientBroadcasterThread();
        void processPacket(const std::vector<uint8_t>& rawData);
        void handleWebSocketHandshake(int clientSocket);
        void broadcastMessage(const std::string& payload);

        std::string interfaceName_;
        int wsPort_;
        bool isRunning_;
        NetworkStats currentStats_;
        mutable std::mutex statsMutex_;
        
        std::unique_ptr<PacketParser> parser_;
        std::unique_ptr<GeoIPLite> geoIp_;

        // Threads
        std::thread captureThreadObj_;
        std::thread serverThreadObj_;
        std::thread broadcastThreadObj_;

        // Sockets
        int serverSocketFd_;
        std::vector<int> clientSockets_;
        std::mutex clientsMutex_;
    };

} // namespace NetVision

#endif // NETWORK_ANALYZER_HPP
