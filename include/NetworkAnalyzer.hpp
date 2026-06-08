#ifndef NETWORK_ANALYZER_HPP
#define NETWORK_ANALYZER_HPP

#include <string>
#include <vector>
#include <memory>
#include "PacketParser.hpp"
#include "GeoIPLite.hpp"

namespace NetVision {

    struct NetworkStats {
        uint64_t totalPackets;
        uint64_t droppedPackets;
        uint64_t activeConnections;
        double currentBandwidthMbps;
        std::string systemStatus;
    };

    class NetworkAnalyzer {
    public:
        NetworkAnalyzer(const std::string& interfaceName);
        ~NetworkAnalyzer();

        bool startCapture();
        void stopCapture();
        
        NetworkStats getStats() const;
        std::vector<std::string> getActiveThreats() const;
        
        void addCustomRule(const std::string& ruleDefinition);

    private:
        void captureThread();
        void processPacket(const std::vector<uint8_t>& rawData);

        std::string interfaceName_;
        bool isRunning_;
        NetworkStats currentStats_;
        
        std::unique_ptr<PacketParser> parser_;
        std::unique_ptr<GeoIPLite> geoIp_;
    };

} // namespace NetVision

#endif // NETWORK_ANALYZER_HPP
