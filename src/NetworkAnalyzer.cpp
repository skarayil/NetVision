#include "NetworkAnalyzer.hpp"
#include <iostream>
#include <thread>
#include <chrono>

namespace NetVision {

    NetworkAnalyzer::NetworkAnalyzer(const std::string& interfaceName)
        : interfaceName_(interfaceName), isRunning_(false) {
        currentStats_ = {0, 0, 0, 0.0, "INITIALIZING"};
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
        
        std::cout << "[INFO] Starting packet capture on interface: " << interfaceName_ << std::endl;
        
        // Simulating a detached capture thread
        std::thread([this]() { this->captureThread(); }).detach();
        return true;
    }

    void NetworkAnalyzer::stopCapture() {
        isRunning_ = false;
        currentStats_.systemStatus = "STOPPED";
        std::cout << "[INFO] Stopped packet capture." << std::endl;
    }

    NetworkStats NetworkAnalyzer::getStats() const {
        return currentStats_;
    }

    std::vector<std::string> NetworkAnalyzer::getActiveThreats() const {
        // Mock threat detection
        return {"Suspicious Port Scan Detected", "High volume of ICMP echo requests"};
    }

    void NetworkAnalyzer::addCustomRule(const std::string& ruleDefinition) {
        std::cout << "[INFO] Rule added: " << ruleDefinition << std::endl;
    }

    void NetworkAnalyzer::captureThread() {
        while (isRunning_) {
            // Simulate packet reception
            std::vector<uint8_t> dummyPacket(64, 0x00); 
            processPacket(dummyPacket);
            
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
        }
    }

    void NetworkAnalyzer::processPacket(const std::vector<uint8_t>& rawData) {
        currentStats_.totalPackets++;
        
        PacketInfo info = parser_->parse(rawData);
        
        if (parser_->detectAnomalies(info)) {
            currentStats_.droppedPackets++;
        } else {
            currentStats_.activeConnections = 142; // Simulated
            currentStats_.currentBandwidthMbps = 45.2; // Simulated
        }
    }

} // namespace NetVision
