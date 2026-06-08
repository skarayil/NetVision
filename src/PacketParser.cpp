#include "PacketParser.hpp"

namespace NetVision {

    PacketParser::PacketParser() {
        // Initialization code
    }

    PacketParser::~PacketParser() {}

    PacketInfo PacketParser::parse(const std::vector<uint8_t>& rawData) {
        PacketInfo info;
        
        // Mock parsing logic
        if (rawData.size() >= 64) {
            info.sourceIp = "192.168.1.10";
            info.destIp = "104.21.23.4";
            info.sourcePort = 54321;
            info.destPort = 443;
            info.protocol = "TCP";
            info.payloadSize = 1024;
            info.isEncrypted = true;
        } else {
            info.sourceIp = "0.0.0.0";
            info.destIp = "0.0.0.0";
            info.sourcePort = 0;
            info.destPort = 0;
            info.protocol = "UNKNOWN";
            info.payloadSize = 0;
            info.isEncrypted = false;
        }
        
        return info;
    }

    bool PacketParser::detectAnomalies(const PacketInfo& packet) {
        // Simple mock anomaly detection
        if (packet.destPort == 22 && packet.payloadSize > 5000) {
            return true; // Suspicious SSH traffic
        }
        return false;
    }

} // namespace NetVision
