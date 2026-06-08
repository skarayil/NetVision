// i18n Definitions
const translations = {
    en: {
        nav_dashboard: "Dashboard",
        nav_map: "Geo Map",
        nav_alerts: "Alerts",
        nav_logs: "System Logs",
        nav_settings: "Settings",
        btn_start: "Start Capture",
        btn_stop: "Stop Capture",
        engine_running: "Engine Running",
        engine_stopped: "Engine Stopped",
        stat_packets: "Captured Packets",
        stat_bandwidth: "Bandwidth (Mbps)",
        stat_active: "Active IPs",
        stat_dropped: "Dropped (Anomalies)",
        panel_top_ips: "Top Active IPs",
        panel_tls: "TLS Domains",
        map_placeholder: "Live Geo-Location Tracking Active...",
        map_desc: "C++ GeoIPLite database is simulating connections across the globe.",
        panel_alerts: "Security Alerts",
        settings_title: "Daemon Configuration",
        settings_desc: "Configure the C++ backend daemon parameters.",
        lbl_interface: "Network Interface",
        lbl_bpf: "BPF Filter",
        lbl_loglevel: "Log Level",
        btn_save: "Save Config"
    },
    tr: {
        nav_dashboard: "Gösterge Paneli",
        nav_map: "Coğrafi Harita",
        nav_alerts: "Uyarılar",
        nav_logs: "Sistem Günlükleri",
        nav_settings: "Ayarlar",
        btn_start: "İzlemeyi Başlat",
        btn_stop: "İzlemeyi Durdur",
        engine_running: "Motor Çalışıyor",
        engine_stopped: "Motor Durduruldu",
        stat_packets: "Yakalanan Paketler",
        stat_bandwidth: "Bant Genişliği (Mbps)",
        stat_active: "Aktif IP'ler",
        stat_dropped: "Düşen (Anomaliler)",
        panel_top_ips: "En Aktif IP'ler",
        panel_tls: "TLS Alan Adları",
        map_placeholder: "Canlı Coğrafi Konum Takibi Aktif...",
        map_desc: "C++ GeoIPLite veritabanı dünya genelindeki bağlantıları simüle ediyor.",
        panel_alerts: "Güvenlik Uyarıları",
        settings_title: "Daemon Konfigürasyonu",
        settings_desc: "C++ backend arka plan servisi (daemon) parametrelerini yapılandırın.",
        lbl_interface: "Ağ Arayüzü",
        lbl_bpf: "BPF Filtresi",
        lbl_loglevel: "Günlük Seviyesi",
        btn_save: "Ayarları Kaydet"
    }
};

// State
let currentLang = 'en';
let isEngineRunning = false;
let engineInterval = null;

let stats = {
    packets: 0,
    bandwidth: 0,
    activeIps: 0,
    dropped: 0
};

let alerts = [];

// DOM Elements
const viewTitle = document.getElementById('view-title');
const alertBadge = document.getElementById('alert-badge');
const alertGlow = document.getElementById('alert-glow');
const btnToggleEngine = document.getElementById('toggle-engine-btn');
const statusDot = document.getElementById('engine-status-dot');
const statusText = document.getElementById('engine-status-text');

// Init
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupLanguage();
    setupEngine();
    applyTranslations();
});

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.getAttribute('data-view');
            
            // Update active state in nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update view title
            viewTitle.setAttribute('data-i18n', item.getAttribute('data-i18n'));
            applyTranslations(); // re-translate title

            // Switch views
            document.querySelectorAll('.view').forEach(view => {
                view.classList.add('hidden');
                view.classList.remove('active');
            });
            document.getElementById(`view-${viewId}`).classList.remove('hidden');
            document.getElementById(`view-${viewId}`).classList.add('active');
        });
    });
}

// i18n
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
        if (translations[currentLang][key]) {
            // Keep child badges intact for nav items
            if (el.querySelector('.badge')) {
                const badge = el.querySelector('.badge').outerHTML;
                el.innerHTML = translations[currentLang][key] + " " + badge;
            } else {
                el.innerText = translations[currentLang][key];
            }
        }
    });
}

// Engine Simulation
function setupEngine() {
    btnToggleEngine.addEventListener('click', () => {
        isEngineRunning = !isEngineRunning;
        
        if (isEngineRunning) {
            btnToggleEngine.classList.add('running');
            statusDot.classList.add('running');
            startSimulation();
        } else {
            btnToggleEngine.classList.remove('running');
            statusDot.classList.remove('running');
            stopSimulation();
        }
        updateEngineStatusText();
    });
}

function updateEngineStatusText() {
    btnToggleEngine.setAttribute('data-i18n', isEngineRunning ? 'btn_stop' : 'btn_start');
    statusText.innerText = isEngineRunning 
        ? translations[currentLang]['engine_running'] 
        : translations[currentLang]['engine_stopped'];
    applyTranslations();
}

function startSimulation() {
    logToTerminal("INFO", "Initializing NetworkAnalyzer C++ Daemon...");
    logToTerminal("INFO", "Loaded GeoIPLite database.");
    logToTerminal("INFO", "Packet capture started on eth0");

    engineInterval = setInterval(() => {
        // Update stats
        stats.packets += Math.floor(Math.random() * 50) + 10;
        stats.bandwidth = (Math.random() * 100 + 20).toFixed(1);
        stats.activeIps = Math.floor(Math.random() * 300) + 100;
        
        if (Math.random() > 0.9) {
            stats.dropped += 1;
            triggerAlert();
        }

        updateDashboard();
        updateTables();
    }, 1000);
}

function stopSimulation() {
    clearInterval(engineInterval);
    logToTerminal("INFO", "Packet capture stopped.");
}

function updateDashboard() {
    document.getElementById('val-packets').innerText = stats.packets.toLocaleString();
    document.getElementById('val-bandwidth').innerText = stats.bandwidth;
    document.getElementById('val-active-ips').innerText = stats.activeIps;
    document.getElementById('val-dropped').innerText = stats.dropped;
}

function updateTables() {
    // Top IPs
    const ips = ['192.168.1.10', '10.0.0.5', '172.16.0.4', '8.8.8.8', '1.1.1.1'];
    const tbodyIps = document.querySelector('#top-ips-table tbody');
    tbodyIps.innerHTML = '';
    ips.forEach(ip => {
        tbodyIps.innerHTML += `<tr><td>${ip}</td><td>${Math.floor(Math.random() * 50000) + 1000} B</td></tr>`;
    });

    // TLS Domains
    const domains = ['github.com', 'google.com', 'api.cloudflare.com', 'aws.amazon.com'];
    const tbodyTls = document.querySelector('#tls-domains-table tbody');
    tbodyTls.innerHTML = '';
    domains.forEach(domain => {
        tbodyTls.innerHTML += `<tr><td>${domain}</td><td>${Math.floor(Math.random() * 500)}</td></tr>`;
    });
}

function triggerAlert() {
    const time = new Date().toLocaleTimeString();
    const alertTypes = ["Suspicious SSH Traffic Detected", "High Volume ICMP Echo Requests", "Potential Port Scan"];
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    alerts.unshift({ time, type });
    if (alerts.length > 50) alerts.pop();
    
    // Update Badge
    alertBadge.style.display = 'inline-block';
    alertBadge.innerText = alerts.length;
    
    // Trigger Glow
    alertGlow.classList.add('active');
    setTimeout(() => alertGlow.classList.remove('active'), 1000);

    // Update List
    const container = document.getElementById('alerts-container');
    container.innerHTML = alerts.map(a => `
        <div class="alert-item">
            <div class="alert-title">${a.type}</div>
            <div class="alert-time">${a.time} - Source: C++ PacketParser</div>
        </div>
    `).join('');
    
    logToTerminal("WARN", "Anomaly detected: " + type);
}

function logToTerminal(level, message) {
    const container = document.getElementById('logs-container');
    const time = new Date().toISOString().split('T')[1].slice(0,-1);
    let levelClass = "log-info";
    if (level === "WARN") levelClass = "log-warn";
    if (level === "ERROR") levelClass = "log-err";
    
    const div = document.createElement('div');
    div.className = "log-line";
    div.innerHTML = `<span class="log-time">[${time}]</span> <span class="${levelClass}">[${level}]</span> ${message}`;
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}
