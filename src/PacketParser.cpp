#include "PacketParser.hpp"
#include <random>

namespace NetVision {

    PacketParser::PacketParser() {
        // Initialization code
    }

    PacketParser::~PacketParser() {}

    PacketInfo PacketParser::parse(const std::vector<uint8_t>& rawData) {
        PacketInfo info;
        
        // Simulating packet header fields dynamically
        static const std::string localIps[] = {"192.168.1.10", "192.168.1.15", "192.168.10.42", "172.16.0.4"};
        static const std::string remoteIps[] = {"104.21.23.4", "8.8.8.8", "142.250.181.206", "185.220.101.5"};
        static const std::string protocols[] = {"TCP", "UDP", "ICMP", "DNS", "HTTPS"};

        // Simple random generator to simulate live flows
        int rnd = rand();
        
        info.sourceIp = localIps[rnd % 4];
        info.destIp = remoteIps[(rnd / 4) % 4];
        info.sourcePort = 1024 + (rnd % 60000);
        
        // Distribute protocols and ports
        int protoChoice = rnd % 5;
        info.protocol = protocols[protoChoice];
        if (info.protocol == "HTTPS") {
            info.destPort = 443;
            info.protocol = "TCP";
            info.isEncrypted = true;
        } else if (info.protocol == "DNS") {
            info.destPort = 53;
            info.protocol = "UDP";
            info.isEncrypted = false;
        } else if (info.protocol == "ICMP") {
            info.destPort = 0;
            info.sourcePort = 0;
            info.isEncrypted = false;
        } else {
            info.destPort = (rnd % 2 == 0) ? 80 : 22;
            info.isEncrypted = (info.destPort == 22);
        }

        info.payloadSize = static_cast<uint32_t>(rawData.size() + (rnd % 1500));
        
        return info;
    }

    bool PacketParser::detectAnomalies(const PacketInfo& packet) {
        // Simulated Intrusion Detection rules
        
        // 1. SSH Bruteforce / Attack Simulation on Port 22
        if (packet.destPort == 22 && packet.sourceIp == "192.168.10.42" && packet.payloadSize > 2000) {
            return true;
        }
        
        // 2. Suspicious Traffic from known malicious host
        if (packet.destIp == "185.220.101.5" && rand() % 20 == 0) {
            return true;
        }

        // 3. Port scan trigger (random simulation)
        if (packet.sourcePort > 60000 && packet.destPort == 23 && rand() % 50 == 0) {
            return true;
        }

        return false;
    }

} // namespace NetVision
