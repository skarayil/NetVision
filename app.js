// NetVision i18n Definitions
const translations = {
    en: {
        nav_dashboard: "Dashboard",
        nav_map: "Network Map",
        nav_monitoring: "Monitoring",
        nav_security: "Security Center",
        nav_analytics: "Analytics",
        nav_reports: "Reports",
        nav_ai: "AI Assistant",
        nav_users: "Users",
        nav_settings: "Settings",
        btn_start: "Start Capture",
        btn_stop: "Stop Capture",
        engine_running: "Engine Running",
        engine_stopped: "Engine Stopped",
        stat_packets: "Captured Packets",
        stat_bandwidth: "Bandwidth (Mbps)",
        stat_active: "Active Devices",
        stat_dropped: "Dropped (Anomalies)",
        panel_top_ips: "Top Active IPs",
        panel_tls: "TLS Domains",
        panel_bandwidth_chart: "Traffic & Bandwidth Analysis",
        export_title: "Generate Network Analytics Report",
        export_desc: "Download captured packets and statistical metrics for offline verification and executive reviews.",
        btn_export_pcap: "Export as PDF Report",
        btn_export_csv: "Export Metrics as Excel",
        btn_export_json: "Export Flows as CSV",
        settings_title: "Daemon Configuration",
        settings_desc: "Configure the high-performance C++ backend daemon connection parameters.",
        lbl_interface: "Network Interface",
        lbl_bpf: "BPF Sniffer Filter",
        lbl_loglevel: "Daemon Log Level",
        btn_save: "Save & Apply Config",
        pb_live: "LIVE STREAM"
    },
    tr: {
        nav_dashboard: "Gösterge Paneli",
        nav_map: "Ağ Haritası",
        nav_monitoring: "İzleme Ekranı",
        nav_security: "Güvenlik Merkezi",
        nav_analytics: "Analizler",
        nav_reports: "Raporlar",
        nav_ai: "Yapay Zeka",
        nav_users: "Kullanıcılar",
        nav_settings: "Ayarlar",
        btn_start: "İzlemeyi Başlat",
        btn_stop: "İzlemeyi Durdur",
        engine_running: "Motor Aktif",
        engine_stopped: "Motor Durdu",
        stat_packets: "İncelenen Paket",
        stat_bandwidth: "Bant Genişliği (Mbps)",
        stat_active: "Aktif Cihazlar",
        stat_dropped: "Düşen Paketler",
        panel_top_ips: "En Aktif IP Adresleri",
        panel_tls: "TLS Domain Adları",
        panel_bandwidth_chart: "Trafik ve Bant Genişliği Analizi",
        export_title: "Ağ Analiz Raporu Oluştur",
        export_desc: "Çevrimdışı doğrulama ve yönetici incelemeleri için yakalanan paketleri ve istatistiksel metrikleri indirin.",
        btn_export_pcap: "PDF Raporu Olarak Aktar",
        btn_export_csv: "Metrikleri Excel'e Aktar",
        btn_export_json: "Akışları CSV'ye Aktar",
        settings_title: "Daemon Yapılandırması",
        settings_desc: "Yüksek performanslı C++ backend servis bağlantı parametrelerini yapılandırın.",
        lbl_interface: "Ağ Arayüzü",
        lbl_bpf: "BPF Filtresi",
        lbl_loglevel: "Günlük Seviyesi",
        btn_save: "Kaydet ve Uygula",
        pb_live: "CANLI YAYIN"
    }
};

// Global App State
let currentLang = 'en';
let activeTheme = 'dark';
let isEngineRunning = false;
let updateInterval = null;
let currentMode = 'sim'; // 'sim' (Simulation) or 'live' (WebSocket connected to C++ daemon)
let wsSocket = null;

// Telemetry Stats Structure
let stats = {
    packets: 0,
    bandwidth: 0,
    activeIps: 0,
    dropped: 0,
    cpu: 12.5,
    ram: 42.3,
    disk: 28.4,
    fan: 2400,
    temp: 38.5,
    power: "OK",
    latency: 14.2,
    loss: 0.02,
    jitter: 1.1,
    security: 94
};

// Alert and Threat Log History
let securityAlerts = [
    { time: "18:35:12", type: "Unauthorized SSL/TLS renegotiation from 192.168.10.42", src: "IPS Engine" },
    { time: "18:31:04", type: "Tor exit node routing flagged host 185.220.101.5", src: "Threat Intel" }
];

let pingTargets = [
    { target: "8.8.8.8 (Google DNS)", rtt: "12ms", loss: "0%", jitter: "1.1ms", ports: "53/UDP UP" },
    { target: "10.0.0.1 (Gateway)", rtt: "1ms", loss: "0%", jitter: "0.2ms", ports: "80,443,22 UP" },
    { target: "185.220.101.5 (Tor Host)", rtt: "84ms", loss: "2%", jitter: "5.4ms", ports: "22,23 FILT" }
];

// SPA Navigation Views switching
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.getAttribute('data-view');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const viewTitle = document.getElementById('view-title');
            viewTitle.setAttribute('data-i18n', item.getAttribute('data-i18n'));
            applyTranslations(); 

            document.querySelectorAll('.view').forEach(view => {
                view.classList.add('hidden');
                view.classList.remove('active');
            });
            
            const targetView = document.getElementById(`view-${viewId}`);
            targetView.classList.remove('hidden');
            targetView.classList.add('active');

            // Trigger canvas or chart size updates on visibility change
            if (viewId === 'map') {
                setTimeout(resizeTopologyCanvas, 50);
            }
        });
    });

    // Subviews within map view (Topology, Heatmap, World Branch Map)
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            subTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const subviewId = btn.getAttribute('data-subview');
            document.querySelectorAll('.sub-view-content').forEach(sv => {
                sv.classList.add('hidden');
                sv.classList.remove('active');
            });
            document.getElementById(`subview-${subviewId}`).classList.remove('hidden');
            document.getElementById(`subview-${subviewId}`).classList.add('active');

            if (subviewId === 'wifi') {
                startWifiHeatmapAnimation();
            }
        });
    });
}

// i18n Translation handler
function setupLanguage() {
    const langSelect = document.getElementById('language-selector');
    langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        applyTranslations();
        updateEngineStatusText();
    });
}

function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });
}

// Light & Dark theme toggle
function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.addEventListener('click', () => {
        activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', activeTheme);
        toggleBtn.innerHTML = activeTheme === 'dark' 
            ? '<i class="fa-solid fa-moon"></i>' 
            : '<i class="fa-solid fa-sun"></i>';
        
        logToTerminal("INFO", `Switched system interface theme to: ${activeTheme.toUpperCase()}`);
        
        // Refresh charts style colors
        updateChartColors();
    });
}

// Dynamic System / Audit logging to simulated POSIX console
function logToTerminal(level, message) {
    const time = new Date().toISOString().split('T')[1].slice(0,-1);
    let levelClass = "log-info";
    if (level === "WARN") levelClass = "log-warn";
    if (level === "ERROR") levelClass = "log-err";
    
    // Write to daemon logs terminal in User tab
    const logsContainer = document.getElementById('audit-logs-container');
    if (logsContainer) {
        const div = document.createElement('div');
        div.className = "log-line";
        div.innerHTML = `<span class="log-time">[${time}]</span> <span class="${levelClass}">[${level}]</span> ${message}`;
        logsContainer.appendChild(div);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }
}

// Engine Sniffer Controls
function setupEngine() {
    const btnToggleEngine = document.getElementById('toggle-engine-btn');
    btnToggleEngine.addEventListener('click', () => {
        isEngineRunning = !isEngineRunning;
        
        const statusDot = document.getElementById('engine-status-dot');
        if (isEngineRunning) {
            btnToggleEngine.classList.add('running');
            statusDot.classList.add('running');
            startObservabilityLoop();
            logToTerminal("INFO", "NetVision Core packet collection active on interface " + document.getElementById('settings-interface-input').value);
        } else {
            btnToggleEngine.classList.remove('running');
            statusDot.classList.remove('running');
            stopObservabilityLoop();
            logToTerminal("WARN", "Packet sniffing core paused. Telemetry frozen.");
        }
        updateEngineStatusText();
    });
}

function updateEngineStatusText() {
    const btnToggleEngine = document.getElementById('toggle-engine-btn');
    const statusText = document.getElementById('engine-status-text');
    
    btnToggleEngine.setAttribute('data-i18n', isEngineRunning ? 'btn_stop' : 'btn_start');
    statusText.innerText = isEngineRunning 
        ? translations[currentLang]['engine_running'] 
        : translations[currentLang]['engine_stopped'];
    applyTranslations();
}

// Observability Core Telemetry Engine
function startObservabilityLoop() {
    if (currentMode === 'live') {
        // Live Mode: Initiate WebSocket Connection to C++ Backend
        connectWebSocket();
    } else {
        // Simulation Mode: Run local javascript updates for static deployment (GitHub Pages)
        runSimulationLoop();
    }
}

function stopObservabilityLoop() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    if (wsSocket) {
        wsSocket.close();
        wsSocket = null;
    }
}

function runSimulationLoop() {
    updateInterval = setInterval(() => {
        // Random drift generation resembling real packets
        stats.packets += Math.floor(Math.random() * 45) + 12;
        stats.bandwidth = (Math.random() * 30 + 35).toFixed(1);
        stats.activeIps = Math.floor(Math.random() * 10) + 175;
        
        stats.cpu = (Math.random() * 15 + 10).toFixed(1);
        stats.ram = (Math.random() * 3 + 42).toFixed(1);
        stats.temp = (Math.random() * 2 + 37).toFixed(1);
        stats.latency = (Math.random() * 8 + 10).toFixed(2);
        stats.jitter = (Math.random() * 0.5 + 0.8).toFixed(2);

        // Random threat drop simulation
        if (Math.random() > 0.94) {
            stats.dropped += 1;
            stats.security -= 1;
            triggerSecurityAnomaly();
        }

        updateDashboardUI();
        updateCharts();
        updateFlowTable();
    }, 1000);
}

// WebSocket Live Client Connection logic to C++
function connectWebSocket() {
    const wsUrl = "ws://127.0.0.1:8085";
    logToTerminal("INFO", `Attempting WebSocket connection to daemon at: ${wsUrl}`);
    
    wsSocket = new WebSocket(wsUrl);

    wsSocket.onopen = () => {
        logToTerminal("INFO", "Connected successfully to NetVision C++ Daemon (WebSocket UP).");
        document.getElementById('connection-mode-badge').className = "connection-status badge-connected";
        document.getElementById('connection-mode-text').innerText = "Live Daemon Connected";
        currentMode = 'live';
    };

    wsSocket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            // Map C++ JSON packet fields directly to telemetry
            stats.packets = data.totalPackets;
            stats.dropped = data.droppedPackets;
            stats.activeIps = data.activeConnections;
            stats.bandwidth = data.currentBandwidthMbps;
            stats.cpu = data.cpuUsage;
            stats.ram = data.ramUsage;
            stats.disk = data.diskUsage;
            stats.fan = data.fanSpeedRpm;
            stats.temp = data.temperatureC;
            stats.power = data.powerSupplyStatus;
            stats.latency = data.latencyMs;
            stats.loss = data.packetLossPct;
            stats.jitter = data.jitterMs;
            stats.security = data.securityScore;

            if (data.threats && data.threats.length > 0) {
                data.threats.forEach(t => {
                    // Check if already in array
                    if (!securityAlerts.some(a => a.type === t)) {
                        securityAlerts.unshift({
                            time: new Date().toLocaleTimeString(),
                            type: t,
                            src: "C++ Intrusion Detection Engine"
                        });
                        if (securityAlerts.length > 30) securityAlerts.pop();
                        renderSecurityIDS();
                    }
                });
            }

            updateDashboardUI();
            updateCharts();
            
            // Populate Flows from C++
            if (data.netFlow) {
                renderFlowTable(data.netFlow);
            }
        } catch (e) {
            console.error("Error parsing WebSocket metrics payload: ", e);
        }
    };

    wsSocket.onerror = (err) => {
        logToTerminal("ERROR", "WebSocket connection failed. Falling back to local offline simulation mode.");
        fallbackToSimulationMode();
    };

    wsSocket.onclose = () => {
        logToTerminal("WARN", "WebSocket session closed by host. Reverting status to Simulated.");
        fallbackToSimulationMode();
    };
}

function fallbackToSimulationMode() {
    document.getElementById('connection-mode-badge').className = "connection-status badge-info";
    document.getElementById('connection-mode-text').innerText = "Simulation Mode";
    currentMode = 'sim';
    document.getElementById('settings-daemon-mode-select').value = "sim";
    
    // Switch to local simulation intervals
    if (isEngineRunning) {
        stopObservabilityLoop();
        isEngineRunning = true;
        startObservabilityLoop();
    }
}

// UI Elements updates
function updateDashboardUI() {
    // KPI Values
    document.getElementById('val-packets').innerText = stats.packets.toLocaleString();
    document.getElementById('val-bandwidth').innerText = parseFloat(stats.bandwidth).toFixed(1);
    document.getElementById('val-active-ips').innerText = stats.activeIps;
    document.getElementById('val-dropped').innerText = stats.dropped;

    // dropped cards background glow warning if security score is low
    const droppedCard = document.getElementById('kpi-dropped-card');
    const droppedTrend = document.getElementById('kpi-dropped-trend');
    if (stats.security < 80) {
        droppedCard.style.border = "1px solid rgba(244, 63, 94, 0.4)";
        droppedTrend.innerHTML = `<i class="fa-solid fa-shield-virus"></i> High threat score!`;
        droppedTrend.className = "stat-trend text-red";
    } else {
        droppedCard.style.border = "";
        droppedTrend.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Threat score: normal`;
        droppedTrend.className = "stat-trend text-green";
    }

    // Health Gauges
    updateCircularGauge('gauge-cpu', stats.cpu);
    updateCircularGauge('gauge-ram', stats.ram);
    updateCircularGauge('gauge-disk', stats.disk);

    // Sensor lists
    document.getElementById('val-sensor-fan').innerText = `${stats.fan} RPM`;
    document.getElementById('val-sensor-temp').innerText = `${parseFloat(stats.temp).toFixed(1)} °C`;
    
    const powerText = document.getElementById('val-sensor-power');
    if (stats.power === "OK") {
        powerText.innerText = "OK (Active Redundant)";
        powerText.className = "sensor-value text-green";
    } else {
        powerText.innerText = stats.power;
        powerText.className = "sensor-value text-red";
    }
}

function updateCircularGauge(id, percent) {
    const textNode = document.getElementById(`${id}-val`);
    const circleNode = document.getElementById(`${id}-fill`);
    
    if (textNode) textNode.innerText = `${Math.round(percent)}%`;
    if (circleNode) {
        // Circumference is 251. stroke-dashoffset = circumference - (percent / 100 * circumference)
        const offset = 251 - (percent / 100 * 251);
        circleNode.style.strokeDashoffset = offset;
    }
}

// Tables rendering
function updateFlowTable() {
    const localIps = ['192.168.1.15', '192.168.1.10', '192.168.10.42', '172.16.0.4'];
    const destinations = ['8.8.8.8', '104.21.23.4', '185.220.101.5', 'api.cloudflare.com'];
    const protocols = ['TCP', 'UDP', 'ICMP', 'HTTPS'];
    
    // Build simulated flow array
    let mockFlows = [];
    for (let i = 0; i < 5; ++i) {
        mockFlows.push({
            src: localIps[Math.floor(Math.random() * localIps.length)],
            dst: destinations[Math.floor(Math.random() * destinations.length)],
            proto: protocols[Math.floor(Math.random() * protocols.length)],
            bytes: Math.floor(Math.random() * 85000) + 1200,
            port: [80, 443, 53, 22][Math.floor(Math.random() * 4)]
        });
    }
    renderFlowTable(mockFlows);
}

function renderFlowTable(flows) {
    const tbody = document.querySelector('#flow-collector-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    flows.forEach(flow => {
        let qosClass = "Best Effort";
        if (flow.port === 53 || flow.proto === 'ICMP') qosClass = "Network Control";
        if (flow.bytes > 50000) qosClass = "Bulk Data";
        
        tbody.innerHTML += `
            <tr>
                <td>${flow.src}</td>
                <td>${Math.floor(Math.random() * 5000) + 49152}</td>
                <td>${flow.dst}</td>
                <td><span class="badge badge-info">${flow.port}</span></td>
                <td><span class="font-mono">${flow.proto}</span></td>
                <td>${flow.bytes.toLocaleString()} B</td>
                <td>${qosClass}</td>
            </tr>
        `;
    });
}

function triggerSecurityAnomaly() {
    const alertTypes = [
        "Potential DDoS Syn Flood on Core Port 80",
        "Brute Force Attempt detected on Gateway 22",
        "Anomalous packet sizes scan on segment VLAN100"
    ];
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const time = new Date().toLocaleTimeString();

    securityAlerts.unshift({ time, type, src: "AI Anomaly Detection" });
    if (securityAlerts.length > 15) securityAlerts.pop();

    renderSecurityIDS();

    // Trigger visual notification glow red
    const alertGlow = document.getElementById('alert-glow');
    alertGlow.classList.add('active');
    setTimeout(() => alertGlow.classList.remove('active'), 1000);
}

function renderSecurityIDS() {
    const container = document.getElementById('security-ids-logs');
    if (!container) return;

    container.innerHTML = securityAlerts.map(a => `
        <div class="alert-item ${a.src.includes('Intel') || a.src.includes('AI') ? 'alert-info' : ''}">
            <div class="alert-title">${a.type}</div>
            <div class="alert-time">${a.time} - Source: ${a.src}</div>
        </div>
    `).join('');
}

// Chart.js Graphs Setup
let charts = {};

function initCharts() {
    // 1. Dashboard Traffic line chart
    const trafficCtx = document.getElementById('dashboard-traffic-chart').getContext('2d');
    charts.traffic = new Chart(trafficCtx, {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                label: 'Inbound (Mbps)',
                data: Array(20).fill(0),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                fill: true,
                tension: 0.3
            }, {
                label: 'Outbound (Mbps)',
                data: Array(20).fill(0),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(255, 255, 255, 0.03)' } }
            }
        }
    });

    // 2. Dashboard Protocol Breakdown doughnut
    const protocolCtx = document.getElementById('dashboard-protocol-chart').getContext('2d');
    charts.protocol = new Chart(protocolCtx, {
        type: 'bar',
        data: {
            labels: ['HTTPS', 'TCP', 'UDP', 'DNS', 'ICMP'],
            datasets: [{
                label: 'Packet Hits',
                data: [1420, 842, 630, 280, 142],
                backgroundColor: ['#06b6d4', '#3b82f6', '#8b5cf6', '#fbbf24', '#f43f5e']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(255, 255, 255, 0.03)' } }
            }
        }
    });

    // 3. Analytics Capacity Forecast Chart
    const forecastCtx = document.getElementById('analytics-forecast-chart').getContext('2d');
    charts.forecast = new Chart(forecastCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon (Forecast)', 'Tue (Forecast)'],
            datasets: [{
                label: 'Usage Bandwidth (Avg Mbps)',
                data: [42, 45, 52, 48, 55, 30, 28, 48, 51],
                borderColor: '#8b5cf6',
                borderDash: [5, 5],
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });

    // 4. Analytics Latency Histogram Chart
    const latencyCtx = document.getElementById('analytics-latency-chart').getContext('2d');
    charts.latency = new Chart(latencyCtx, {
        type: 'bar',
        data: {
            labels: ['0-5ms', '5-10ms', '10-20ms', '20-50ms', '50ms+'],
            datasets: [{
                label: 'Frequency (Packets)',
                data: [2500, 18420, 1420, 82, 14],
                backgroundColor: 'rgba(6, 182, 212, 0.7)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateCharts() {
    if (!charts.traffic) return;

    // Traffic update
    const trafficData1 = charts.traffic.data.datasets[0].data;
    const trafficData2 = charts.traffic.data.datasets[1].data;
    
    trafficData1.shift();
    trafficData1.push(parseFloat(stats.bandwidth));
    trafficData2.shift();
    trafficData2.push(parseFloat(stats.bandwidth * 0.42)); // outbound ratio
    
    charts.traffic.update('none');

    // Protocol frequency shifts
    const protocolData = charts.protocol.data.datasets[0].data;
    protocolData[0] += Math.floor(Math.random() * 8);
    protocolData[1] += Math.floor(Math.random() * 5);
    protocolData[2] += Math.floor(Math.random() * 4);
    charts.protocol.update('none');
}

function updateChartColors() {
    // Toggles lines colors between modes
    const isDark = activeTheme === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.06)';
    const textColor = isDark ? '#94a3b8' : '#475569';

    Object.values(charts).forEach(chart => {
        if (chart.options.scales) {
            if (chart.options.scales.x) {
                chart.options.scales.x.ticks.color = textColor;
            }
            if (chart.options.scales.y) {
                chart.options.scales.y.ticks.color = textColor;
                chart.options.scales.y.grid.color = gridColor;
            }
        }
        chart.update();
    });
}

// Canvas-Based Network Topology Engine (Interactive)
let topoCanvas = null;
let topoCtx = null;
let topoNodes = [];
let topoLinks = [];
let animFrameId = null;
let draggedNode = null;
let hoveredNode = null;

function initTopology() {
    topoCanvas = document.getElementById('network-topology-canvas');
    if (!topoCanvas) return;
    topoCtx = topoCanvas.getContext('2d');

    // Set coordinates scale
    resizeTopologyCanvas();

    // Define core platform nodes
    topoNodes = [
        { id: 1, name: "Gateway_Router", type: "router", ip: "10.0.0.1", x: 150, y: 200, radius: 24, load: "12% / 32%", status: "Active" },
        { id: 2, name: "HQ_Firewall", type: "firewall", ip: "10.0.0.2", x: 280, y: 200, radius: 22, load: "28% / 12%", status: "Active" },
        { id: 3, name: "Core_Switch", type: "switch", ip: "10.0.0.5", x: 420, y: 200, radius: 20, load: "4% / 44%", status: "Active" },
        { id: 4, name: "DB_Server_01", type: "server", ip: "10.0.10.12", x: 580, y: 100, radius: 22, load: "18% / 68%", status: "Active" },
        { id: 5, name: "Web_Server_02", type: "server", ip: "10.0.10.14", x: 580, y: 200, radius: 22, load: "42% / 81%", status: "Active" },
        { id: 6, name: "Wi-Fi_AP_HQ", type: "wifi", ip: "10.0.20.100", x: 520, y: 320, radius: 20, load: "14% / 22%", status: "Active" },
        { id: 7, name: "Developer_PC", type: "client", ip: "10.0.20.15", x: 680, y: 300, radius: 18, load: "8% / 15%", status: "Active" },
        { id: 8, name: "IP_Phone_Desk", type: "client", ip: "10.0.20.24", x: 680, y: 380, radius: 16, load: "1% / 2%", status: "Active" }
    ];

    // Connect nodes with links
    topoLinks = [
        { source: 1, target: 2, bandwidth: "1.0 Gbps", packets: [] },
        { source: 2, target: 3, bandwidth: "10 Gbps", packets: [] },
        { source: 3, target: 4, bandwidth: "10 Gbps", packets: [] },
        { source: 3, target: 5, bandwidth: "10 Gbps", packets: [] },
        { source: 3, target: 6, bandwidth: "1.0 Gbps", packets: [] },
        { source: 6, target: 7, bandwidth: "300 Mbps", packets: [] },
        { source: 6, target: 8, bandwidth: "100 Mbps", packets: [] }
    ];

    // Event listeners
    topoCanvas.addEventListener('mousedown', onTopoMouseDown);
    topoCanvas.addEventListener('mousemove', onTopoMouseMove);
    topoCanvas.addEventListener('mouseup', onTopoMouseUp);
    topoCanvas.addEventListener('dblclick', onTopoDblClick);

    // Start rendering frame
    requestAnimationFrame(renderTopologyLoop);
}

function resizeTopologyCanvas() {
    if (!topoCanvas) return;
    const rect = topoCanvas.parentElement.getBoundingClientRect();
    topoCanvas.width = rect.width;
    topoCanvas.height = rect.height;
}

window.resetTopoZoom = function() {
    initTopology();
    logToTerminal("INFO", "Topology visualizer layout recalibrated.");
};

window.triggerAutoDiscovery = function() {
    logToTerminal("INFO", "Auto Discovery scanner active. Inspecting subnet 10.0.0.0/24...");
    setTimeout(() => {
        // Add a new discovered node
        const newId = topoNodes.length + 1;
        const newNode = {
            id: newId,
            name: "Prnt_Office_HQ",
            type: "client",
            ip: "10.0.20.80",
            x: 420 + (Math.random() * 80 - 40),
            y: 350 + (Math.random() * 50),
            radius: 18,
            load: "1% / 5%",
            status: "Active"
        };
        topoNodes.push(newNode);
        topoLinks.push({ source: 3, target: newId, bandwidth: "100 Mbps", packets: [] });
        logToTerminal("INFO", "Auto Discovery found new SNMP Node: Network Printer [10.0.20.80]. Connected.");
    }, 1500);
};

function renderTopologyLoop() {
    if (!topoCanvas || document.getElementById('view-map').classList.contains('hidden')) {
        animFrameId = requestAnimationFrame(renderTopologyLoop);
        return;
    }

    topoCtx.clearRect(0, 0, topoCanvas.width, topoCanvas.height);

    const isLight = activeTheme === 'light';
    const linkColor = isLight ? '#cbd5e1' : '#1e293b';
    const textColor = isLight ? '#0f172a' : '#ffffff';

    // 1. Draw Links
    topoLinks.forEach(link => {
        const sourceNode = topoNodes.find(n => n.id === link.source);
        const targetNode = topoNodes.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return;

        topoCtx.beginPath();
        topoCtx.moveTo(sourceNode.x, sourceNode.y);
        topoCtx.lineTo(targetNode.x, targetNode.y);
        topoCtx.strokeStyle = linkColor;
        topoCtx.lineWidth = 2;
        topoCtx.stroke();

        // Animate packets flowing along links
        if (isEngineRunning && Math.random() > 0.96) {
            link.packets.push({ progress: 0, speed: 0.01 + Math.random() * 0.01 });
        }

        // Render traveling packet dots
        link.packets.forEach((pkt, idx) => {
            pkt.progress += pkt.speed;
            if (pkt.progress >= 1) {
                link.packets.splice(idx, 1);
                return;
            }

            const px = sourceNode.x + (targetNode.x - sourceNode.x) * pkt.progress;
            const py = sourceNode.y + (targetNode.y - sourceNode.y) * pkt.progress;

            topoCtx.beginPath();
            topoCtx.arc(px, py, 4, 0, 2 * Math.PI);
            topoCtx.fillStyle = '#06b6d4';
            topoCtx.shadowColor = '#06b6d4';
            topoCtx.shadowBlur = 8;
            topoCtx.fill();
            topoCtx.shadowBlur = 0; // reset shadow
        });
    });

    // 2. Draw Nodes
    topoNodes.forEach(node => {
        // Node circle glow mapping
        topoCtx.beginPath();
        topoCtx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        
        let color = '#3b82f6'; // Switch default
        if (node.type === 'router') color = '#06b6d4';
        if (node.type === 'firewall') color = '#f43f5e';
        if (node.type === 'server') color = '#8b5cf6';
        if (node.type === 'wifi') color = '#fbbf24';

        topoCtx.fillStyle = color;
        topoCtx.fill();

        // Circle Border
        topoCtx.beginPath();
        topoCtx.arc(node.x, node.y, node.radius + 4, 0, 2 * Math.PI);
        topoCtx.strokeStyle = hoveredNode === node ? '#ffffff' : 'rgba(255,255,255,0.06)';
        topoCtx.lineWidth = 2;
        topoCtx.stroke();

        // Node name and label
        topoCtx.fillStyle = textColor;
        topoCtx.font = "bold 11px Outfit";
        topoCtx.textAlign = "center";
        topoCtx.fillText(node.name, node.x, node.y - node.radius - 8);

        topoCtx.fillStyle = isLight ? '#64748b' : '#94a3b8';
        topoCtx.font = "9px Fira Code";
        topoCtx.fillText(node.ip, node.x, node.y + node.radius + 14);
    });

    animFrameId = requestAnimationFrame(renderTopologyLoop);
}

// Drag & Drop Nodes Interactive
function onTopoMouseDown(e) {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    // Check if clicked a node
    topoNodes.forEach(node => {
        const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
        if (dist <= node.radius + 4) {
            draggedNode = node;
            topoCanvas.style.cursor = 'grabbing';
        }
    });
}

function onTopoMouseMove(e) {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    if (draggedNode) {
        draggedNode.x = mouseX;
        draggedNode.y = mouseY;
    } else {
        // Check hover
        hoveredNode = null;
        topoCanvas.style.cursor = 'default';
        topoNodes.forEach(node => {
            const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
            if (dist <= node.radius + 4) {
                hoveredNode = node;
                topoCanvas.style.cursor = 'grab';
            }
        });
    }
}

function onTopoMouseUp() {
    draggedNode = null;
    topoCanvas.style.cursor = hoveredNode ? 'grab' : 'default';
}

function onTopoDblClick(e) {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    topoNodes.forEach(node => {
        const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
        if (dist <= node.radius + 4) {
            openNodeDetails(node);
        }
    });
}

function openNodeDetails(node) {
    const detailsPanel = document.getElementById('node-details-card');
    document.getElementById('node-name').innerText = node.name;
    document.getElementById('node-type').innerText = node.type.toUpperCase();
    document.getElementById('node-ip').innerText = node.ip;
    document.getElementById('node-load').innerText = node.load;
    document.getElementById('node-ping').innerText = `${stats.latency}ms / 0%`;

    detailsPanel.classList.remove('hidden');
    logToTerminal("INFO", `Inspected node properties: ${node.name} (${node.ip})`);
}

window.closeNodeDetails = function() {
    document.getElementById('node-details-card').classList.add('hidden');
};

// Canvas-Based Wi-Fi Floorplan signal coverage animation
let wifiCanvas = null;
let wifiCtx = null;
let wifiWaves = 0;
let wifiAnimInterval = null;

function startWifiHeatmapAnimation() {
    wifiCanvas = document.getElementById('wifi-heatmap-canvas');
    if (!wifiCanvas) return;
    wifiCtx = wifiCanvas.getContext('2d');
    wifiCanvas.width = wifiCanvas.parentElement.clientWidth;
    wifiCanvas.height = wifiCanvas.parentElement.clientHeight;

    if (wifiAnimInterval) clearInterval(wifiAnimInterval);

    wifiAnimInterval = setInterval(() => {
        wifiWaves += 0.05;
        drawWifiHeatmap();
    }, 50);
}

function drawWifiHeatmap() {
    if (!wifiCanvas) return;
    wifiCtx.clearRect(0, 0, wifiCanvas.width, wifiCanvas.height);

    // Define 2 office access points
    const aps = [
        { x: 180, y: 150, radius: 180, strength: -40 },
        { x: 480, y: 250, radius: 240, strength: -35 }
    ];

    // Draw radiation waves
    aps.forEach(ap => {
        const waveRadius = (wifiWaves * 40) % ap.radius;
        
        // draw glowing heat gradient
        let gradient = wifiCtx.createRadialGradient(ap.x, ap.y, 10, ap.x, ap.y, ap.radius);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
        gradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.15)');
        gradient.addColorStop(1, 'rgba(244, 63, 94, 0)');

        wifiCtx.beginPath();
        wifiCtx.arc(ap.x, ap.y, ap.radius, 0, 2*Math.PI);
        wifiCtx.fillStyle = gradient;
        wifiCtx.fill();

        // draw pulsing boundary lines
        wifiCtx.beginPath();
        wifiCtx.arc(ap.x, ap.y, waveRadius, 0, 2*Math.PI);
        wifiCtx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
        wifiCtx.lineWidth = 1;
        wifiCtx.stroke();
    });

    // Draw AP symbols
    aps.forEach(ap => {
        wifiCtx.beginPath();
        wifiCtx.arc(ap.x, ap.y, 8, 0, 2*Math.PI);
        wifiCtx.fillStyle = '#06b6d4';
        wifiCtx.fill();

        wifiCtx.fillStyle = '#ffffff';
        wifiCtx.font = "bold 9px Outfit";
        wifiCtx.fillText("AP-HQ", ap.x - 14, ap.y - 12);
    });
}

// Monitoring module Ping utilities
window.addNewPingTarget = function() {
    const input = document.getElementById('monitoring-ip-input');
    const targetIp = input.value.trim();
    if (!targetIp) return alert("Please specify target IP address.");

    const newTarget = {
        target: targetIp,
        rtt: "Checking...",
        loss: "0%",
        jitter: "0.0ms",
        ports: "Analyzing..."
    };

    pingTargets.push(newTarget);
    renderPingTargetsTable();
    input.value = '';
    
    logToTerminal("INFO", `Injected new ICMP monitoring target: ${targetIp}`);
    
    // Simulate resolution
    setTimeout(() => {
        newTarget.rtt = `${Math.floor(Math.random()*15)+5}ms`;
        newTarget.jitter = `${(Math.random()*2).toFixed(1)}ms`;
        newTarget.ports = "80,443 UP";
        renderPingTargetsTable();
    }, 1500);
};

window.deletePingTarget = function(idx) {
    pingTargets.splice(idx, 1);
    renderPingTargetsTable();
};

function renderPingTargetsTable() {
    const tbody = document.querySelector('#ping-monitoring-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    pingTargets.forEach((t, idx) => {
        tbody.innerHTML += `
            <tr>
                <td class="font-mono">${t.target}</td>
                <td>${t.rtt}</td>
                <td>${t.loss}</td>
                <td>${t.jitter}</td>
                <td><span class="badge ${t.ports.includes('UP') ? 'badge-success' : 'badge-danger'}">${t.ports}</span></td>
                <td><button class="btn-delete" onclick="deletePingTarget(${idx})">Delete</button></td>
            </tr>
        `;
    });
}

// AI Chatbot Assistant Core Logic
const aiResponses = {
    latency: {
        en: "AI Diagnostics Engine:\n- Observed latency spikes on local WAN tunnel due to high encryption overhead.\n- Jitter remains low. Risk level: Minimal.\n- Recommended Action: Implement QoS shaping on Bulk TCP connections or adjust IPsec MTU values to prevent fragmentations.",
        tr: "Yapay Zeka Teşhis Motoru:\n- Yerel WAN tünelinde yüksek şifreleme yükü nedeniyle anlık gecikme artışları gözlemlendi.\n- Seğirme (jitter) düşük seyrediyor. Risk Seviyesi: Düşük.\n- Önerilen Eylem: Toplu TCP bağlantılarında QoS şekillendirme uygulayın veya tünel parçalanmasını önlemek için IPsec MTU değerini ayarlayın."
    },
    threat: {
        en: "AI Security Intelligence Feed:\n- Detected 2 active Port Scan alerts from Tor endpoint IP 185.220.101.5 on port 22 & 23.\n- IDS automatic rule isolated host 192.168.10.42 to sandbox network.\n- No data leakage flagged. Security Score recalibrated to 94%.",
        tr: "Yapay Zeka Güvenlik İstihbaratı:\n- Tor çıkış noktası olan 185.220.101.5 IP adresinden 22 ve 23. portlara 2 adet aktif Port Tarama uyarısı alındı.\n- IDS kural motoru 192.168.10.42 nolu istemciyi karantinaya aldı.\n- Herhangi bir veri sızıntısı tespiti yok. Güvenlik skoru %94 olarak güncellendi."
    },
    forecast: {
        en: "AI Capacity Forecast Engine:\n- Estimated peak traffic load next Monday at 14:00 will reach 78.4 Mbps (68% capacity limits).\n- Hard drive space in Core Server 01 will hit critical capacity in 42 days.\n- Predictive Maintenance schedule populated in analytics dashboard.",
        tr: "Yapay Zeka Kapasite Planlama:\n- Önümüzdeki Pazartesi günü saat 14:00'te pik trafik yükünün 78.4 Mbps'ye (%68 sınır) ulaşacağı öngörülüyor.\n- Ana Sunucu 01 disk doluluk oranı 42 gün içinde kritik sınıra ulaşacaktır.\n- Analitik paneline tahmine dayalı bakım görevi atanmıştır."
    },
    fallback: {
        en: "NetVision Agent: I can perform diagnostics on latency, query security threats, and predict traffic capacity. Try typing 'latency', 'threats', or 'capacity'.",
        tr: "NetVision Temsilcisi: Gecikme, güvenlik tehditleri ve trafik tahmini konularında analiz yapabilirim. Lütfen 'gecikme', 'güvenlik' veya 'kapasite' yazarak deneyin."
    }
};

window.handleAiInputKey = function(event) {
    if (event.key === 'Enter') {
        submitAiQuery();
    }
};

window.submitAiQuery = function() {
    const input = document.getElementById('ai-input');
    const query = input.value.trim().toLowerCase();
    if (!query) return;

    // Render User Message
    const chatBox = document.getElementById('ai-chat-box');
    chatBox.innerHTML += `
        <div class="chat-msg user">
            <div class="msg-avatar"><i class="fa-solid fa-user"></i></div>
            <div class="msg-text">${input.value}</div>
        </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;
    input.value = '';

    // Choose AI translation path
    let responseText = "";
    if (query.includes('latency') || query.includes('gecikme') || query.includes('yavaş')) {
        responseText = aiResponses.latency[currentLang];
    } else if (query.includes('threat') || query.includes('port') || query.includes('güvenlik') || query.includes('tehdit')) {
        responseText = aiResponses.threat[currentLang];
    } else if (query.includes('capacity') || query.includes('forecast') || query.includes('tahmin') || query.includes('kapasite')) {
        responseText = aiResponses.forecast[currentLang];
    } else {
        responseText = aiResponses.fallback[currentLang];
    }

    // AI typing delay simulation
    setTimeout(() => {
        chatBox.innerHTML += `
            <div class="chat-msg system">
                <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="msg-text">${responseText.replace(/\n/g, '<br>')}</div>
            </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 600);
};

// Exporter Module Logic
window.triggerReportExport = function(type) {
    const progress = document.getElementById('export-progress');
    const fill = document.getElementById('export-fill');
    const status = document.getElementById('export-status');
    const btns = document.querySelectorAll('.export-btn');

    btns.forEach(b => b.disabled = true);
    progress.classList.remove('hidden');
    fill.style.width = '0%';
    status.innerText = `Assembling ${type} data metrics...`;

    let percentage = 0;
    const interval = setInterval(() => {
        percentage += Math.floor(Math.random() * 25) + 10;
        if (percentage >= 100) {
            percentage = 100;
            clearInterval(interval);
            status.innerText = `Report download complete! NetVision_${type}_Report.zip saved.`;
            setTimeout(() => {
                progress.classList.add('hidden');
                btns.forEach(b => b.disabled = false);
            }, 3000);
            logToTerminal("INFO", `Export manager successfully generated report: ${type}`);
        }
        fill.style.width = percentage + '%';
        if (percentage < 100) status.innerText = `Compiling Report... ${percentage}%`;
    }, 400);
};

// Settings configurations save
window.saveDaemonSettings = function() {
    const modeSelect = document.getElementById('settings-daemon-mode-select');
    const targetMode = modeSelect.value;
    const ifaceVal = document.getElementById('settings-interface-input').value;
    const bpfVal = document.getElementById('settings-bpf-input').value;

    currentMode = targetMode;

    logToTerminal("INFO", `Applying configuration: Sniffer Interface=${ifaceVal}, Mode=${targetMode.toUpperCase()}`);

    if (isEngineRunning) {
        // Restart backend triggers
        stopObservabilityLoop();
        isEngineRunning = true;
        startObservabilityLoop();
    } else {
        alert("Configuration updated. Start capture to activate.");
    }
};

// Playback slider details
function setupPlaybackBar() {
    const playBtn = document.getElementById('pb-play');
    playBtn.addEventListener('click', () => {
        const icon = playBtn.innerHTML;
        if (icon.includes('pause')) {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            if (isEngineRunning) {
                isEngineRunning = false;
                stopObservabilityLoop();
                logToTerminal("WARN", "Data stream paused from timeline control.");
            }
        } else {
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            if (!isEngineRunning) {
                isEngineRunning = true;
                startObservabilityLoop();
                logToTerminal("INFO", "Data stream resumed from timeline control.");
            }
        }
    });

    const timeStart = document.getElementById('time-start');
    const timeCurrent = document.getElementById('time-current');
    
    // Set baseline clock
    const now = new Date();
    timeStart.innerText = new Date(now - 10 * 60 * 1000).toLocaleTimeString(); // 10 minutes ago
    timeCurrent.innerText = "Live";
}

// Initialise Application
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupLanguage();
    setupThemeToggle();
    setupEngine();
    setupPlaybackBar();
    
    // Initialise modules
    initCharts();
    initTopology();
    renderSecurityIDS();
    renderPingTargetsTable();

    // Default clock loop
    setInterval(() => {
        const timeStr = new Date().toLocaleTimeString();
        const clockSpan = document.getElementById('clock-display');
        if (clockSpan) clockSpan.innerText = timeStr;
    }, 1000);

    // Initial translation apply
    applyTranslations();
    
    // Log system boot
    logToTerminal("INFO", "NetVision platform initialised. Monitoring suite online.");
    logToTerminal("INFO", "Static simulation engine ready. Toggle Live Daemon mode to connect local backend.");
});
