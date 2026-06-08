#include <iostream>
#include <string>
#include <csignal>
#include <thread>
#include <chrono>
#include "NetworkAnalyzer.hpp"

// Global pointer to allow signal handler to stop the analyzer
std::unique_ptr<NetVision::NetworkAnalyzer> g_analyzer = nullptr;

void signalHandler(int signum) {
    std::cout << "\n[INFO] Interrupt signal (" << signum << ") received. Shutting down daemon..." << std::endl;
    if (g_analyzer) {
        g_analyzer->stopCapture();
    }
}

int main(int argc, char* argv[]) {
    std::string interfaceOpt = "en0"; // macOS default, often en0
    int portOpt = 8080;
    std::string filterOpt = "ip";

    // Simple manual argument parsing
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if ((arg == "-i" || arg == "--interface") && i + 1 < argc) {
            interfaceOpt = argv[++i];
        } else if ((arg == "-p" || arg == "--port") && i + 1 < argc) {
            try {
                portOpt = std::stoi(argv[++i]);
            } catch (...) {
                std::cerr << "[ERROR] Invalid port specified, using default 8080" << std::endl;
            }
        } else if ((arg == "-f" || arg == "--filter") && i + 1 < argc) {
            filterOpt = argv[++i];
        } else if (arg == "-h" || arg == "--help") {
            std::cout << "NetVision Daemon Usage:\n"
                      << "  -i, --interface <name>   Network interface to monitor (default: en0)\n"
                      << "  -p, --port <port>        WebSocket server port (default: 8080)\n"
                      << "  -f, --filter <bpf>       BPF filter expression (default: ip)\n"
                      << "  -h, --help               Show this help message\n";
            return 0;
        }
    }

    // Register signal handlers
    std::signal(SIGINT, signalHandler);
    std::signal(SIGTERM, signalHandler);

    std::cout << "==================================================\n"
              << "          NETVISION DAEMON BOOTSTRAP              \n"
              << "==================================================\n"
              << "[INFO] Interface: " << interfaceOpt << "\n"
              << "[INFO] WS Port:    " << portOpt << "\n"
              << "[INFO] BPF Filter: \"" << filterOpt << "\"\n"
              << "==================================================" << std::endl;

    try {
        g_analyzer = std::make_unique<NetVision::NetworkAnalyzer>(interfaceOpt, portOpt);
        
        // Add default or parsed BPF rule
        g_analyzer->addCustomRule(filterOpt);

        // Start WebSocket Server inside the analyzer on portOpt
        // This spins off the background server and starts capturing
        if (g_analyzer->startCapture()) {
            std::cout << "[INFO] NetVision Daemon is running. Press Ctrl+C to exit." << std::endl;
            
            // Loop until signal handler turns isRunning_ off
            while (true) {
                auto stats = g_analyzer->getStats();
                if (stats.systemStatus == "STOPPED") {
                    break;
                }
                std::this_thread::sleep_for(std::chrono::milliseconds(500));
            }
        } else {
            std::cerr << "[ERROR] Failed to start NetVision capture engine." << std::endl;
            return 1;
        }
    } catch (const std::exception& e) {
        std::cerr << "[FATAL] Daemon encountered exception: " << e.what() << std::endl;
        return 1;
    }

    std::cout << "[INFO] NetVision Daemon terminated gracefully." << std::endl;
    return 0;
}
