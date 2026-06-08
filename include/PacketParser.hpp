#ifndef PACKET_PARSER_HPP
#define PACKET_PARSER_HPP

#include <cstdint>
#include <vector>
#include <string>

namespace NetVision {

    struct PacketInfo {
        std::string sourceIp;
        std::string destIp;
        uint16_t sourcePort;
        uint16_t destPort;
        std::string protocol;
        uint32_t payloadSize;
        bool isEncrypted;
    };

    class PacketParser {
    public:
        PacketParser();
        ~PacketParser();

        PacketInfo parse(const std::vector<uint8_t>& rawData);
        bool detectAnomalies(const PacketInfo& packet);

    private:
        std::string extractIpAddress(const std::vector<uint8_t>& data, size_t offset);
        uint16_t extractPort(const std::vector<uint8_t>& data, size_t offset);
    };

} // namespace NetVision

#endif // PACKET_PARSER_HPP
