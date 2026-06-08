#include "GeoIPLite.hpp"
#include <iostream>

namespace NetVision {

    GeoIPLite::GeoIPLite(const std::string& dbPath) : dbPath_(dbPath) {
        loadDatabase();
    }

    GeoIPLite::~GeoIPLite() {}

    bool GeoIPLite::loadDatabase() {
        std::cout << "[INFO] Loading GeoIP database from " << dbPath_ << std::endl;
        
        // Mock cache population
        cache_["104.21.23.4"] = {"United States", "San Francisco", 37.7749, -122.4194};
        cache_["142.250.181.206"] = {"United States", "Mountain View", 37.3861, -122.0839};
        cache_["93.184.216.34"] = {"Ireland", "Dublin", 53.3498, -6.2603};
        
        return true;
    }

    LocationData GeoIPLite::lookup(const std::string& ipAddress) const {
        auto it = cache_.find(ipAddress);
        if (it != cache_.end()) {
            return it->second;
        }
        
        // Return dummy data if not found
        return {"Unknown", "Unknown", 0.0, 0.0};
    }

} // namespace NetVision
