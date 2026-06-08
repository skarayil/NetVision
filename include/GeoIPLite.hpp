#ifndef GEOIP_LITE_HPP
#define GEOIP_LITE_HPP

#include <string>
#include <unordered_map>

namespace NetVision {

    struct LocationData {
        std::string country;
        std::string city;
        double latitude;
        double longitude;
    };

    class GeoIPLite {
    public:
        GeoIPLite(const std::string& dbPath);
        ~GeoIPLite();

        bool loadDatabase();
        LocationData lookup(const std::string& ipAddress) const;

    private:
        std::string dbPath_;
        std::unordered_map<std::string, LocationData> cache_;
    };

} // namespace NetVision

#endif // GEOIP_LITE_HPP
