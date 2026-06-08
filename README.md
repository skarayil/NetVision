# NetVision Pro - Network Monitor

NetVision Pro is a high-performance network monitoring and packet analysis tool, built with a robust **C++ backend daemon** and a dynamic, **colorful dark-theme web interface**.

## Features

- **C++ Packet Inspection**: Core networking engine written entirely in C++ for maximum performance and low memory overhead.
- **Real-Time Dashboard**: Beautiful UI built with Vanilla JS to visualize network traffic, bandwidth, and active connections instantly.
- **Geo-Location Mapping**: Integrated `GeoIPLite` logic to track the geographic origin of network connections.
- **Anomaly Detection**: Advanced C++ `PacketParser` identifies suspicious activities like port scans and excessive ICMP requests.
- **Multilingual Support (i18n)**: Fully supports English and Turkish (Türkçe) localizations out-of-the-box.
- **Zero-Dependency Web UI**: The frontend uses pure HTML, CSS, and JavaScript. No build tools required!

## Project Structure

The project is cleanly separated into the C++ daemon logic and the static web UI:

- `src/` and `include/`: Contains the C++ source code (`NetworkAnalyzer`, `PacketParser`, `GeoIPLite`) for the backend engine.
- `index.html`, `style.css`, `app.js`: The Vanilla JS frontend, perfectly tailored to run on any modern browser.

## How to Run the Frontend (GitHub Pages)

Because the UI is built with pure web technologies, it is fully compatible with GitHub Pages.
You don't need Node.js, npm, or any build tools to view the dashboard!

Simply open `index.html` in your web browser, or push the repository to GitHub and enable **GitHub Pages**. The dashboard will work instantly.

## Compiling the C++ Backend (Optional)

If you wish to run the actual C++ packet capture daemon locally (for real-world network interfaces):

1. Ensure you have `g++` and `make` installed.
2. Run the provided Makefile:
   ```bash
   make
   ```
3. Execute the binary as root (required for packet capture):
   ```bash
   sudo ./netvision_daemon
   ```

*Note: The web UI in this repository uses an interactive browser-based simulation to showcase the C++ engine's capabilities directly on GitHub Pages.*

## License
MIT License.
