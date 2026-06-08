// i18n Definitions
const translations = {
    en: {
        nav_dashboard: "Dashboard",
        nav_map: "Geo Map",
        nav_rules: "Rules",
        nav_export: "Export",
        nav_alerts: "Alerts",
        nav_logs: "System Logs",
        nav_arch: "Architecture",
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
        rules_add_title: "Add Custom Rule",
        rules_active_title: "Active Rules",
        lbl_rule_name: "Rule Name",
        lbl_rule_condition: "Condition (BPF syntax)",
        btn_add_rule: "Add Rule",
        export_title: "Export PCAP & Metrics",
        export_desc: "Download captured packets and statistical data for offline analysis.",
        btn_export_pcap: "Export as .PCAP",
        btn_export_csv: "Export Metrics (CSV)",
        btn_export_json: "Export Data (JSON)",
        arch_title: "System Architecture",
        arch_desc: "A high-level overview of the NetVision C++ components and data flow.",
        panel_alerts: "Security Alerts",
        settings_title: "Daemon Configuration",
        settings_desc: "Configure the C++ backend daemon parameters.",
        lbl_interface: "Network Interface",
        lbl_bpf: "BPF Filter",
        lbl_loglevel: "Log Level",
        btn_save: "Save Config",
        pb_live: "LIVE"
    },
    tr: {
        nav_dashboard: "Gösterge Paneli",
        nav_map: "Coğrafi Harita",
        nav_rules: "Kurallar",
        nav_export: "Dışa Aktar",
        nav_alerts: "Uyarılar",
        nav_logs: "Sistem Günlükleri",
        nav_arch: "Mimari",
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
        rules_add_title: "Özel Kural Ekle",
        rules_active_title: "Aktif Kurallar",
        lbl_rule_name: "Kural Adı",
        lbl_rule_condition: "Koşul (BPF sözdizimi)",
        btn_add_rule: "Kural Ekle",
        export_title: "PCAP & Metrikleri Dışa Aktar",
        export_desc: "Yakalanan paketleri ve istatistiksel verileri çevrimdışı analiz için indirin.",
        btn_export_pcap: ".PCAP Olarak Aktar",
        btn_export_csv: "Metrikleri Aktar (CSV)",
        btn_export_json: "Verileri Aktar (JSON)",
        arch_title: "Sistem Mimarisi",
        arch_desc: "NetVision C++ bileşenleri ve veri akışının genel bir görünümü.",
        panel_alerts: "Güvenlik Uyarıları",
        settings_title: "Daemon Konfigürasyonu",
        settings_desc: "C++ backend arka plan servisi (daemon) parametrelerini yapılandırın.",
        lbl_interface: "Ağ Arayüzü",
        lbl_bpf: "BPF Filtresi",
        lbl_loglevel: "Günlük Seviyesi",
        btn_save: "Ayarları Kaydet",
        pb_live: "CANLI"
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

// Init
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupLanguage();
    setupEngine();
    setupPlaybackBar();
    applyTranslations();
});

// Navigation
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
            if (el.getAttribute('data-view') === 'alerts') {
                const display = alerts.length > 0 ? 'inline-block' : 'none';
                el.innerHTML = translations[currentLang][key] + ` <span class="badge" id="alert-badge" style="display: ${display}">${alerts.length}</span>`;
            } else {
                el.innerText = translations[currentLang][key];
            }
        }
    });
}

// Engine Simulation
function setupEngine() {
    const btnToggleEngine = document.getElementById('toggle-engine-btn');
    btnToggleEngine.addEventListener('click', () => {
        isEngineRunning = !isEngineRunning;
        
        const statusDot = document.getElementById('engine-status-dot');
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
    const btnToggleEngine = document.getElementById('toggle-engine-btn');
    const statusText = document.getElementById('engine-status-text');
    
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
    const ips = ['192.168.1.10', '10.0.0.5', '172.16.0.4', '8.8.8.8', '1.1.1.1'];
    const tbodyIps = document.querySelector('#top-ips-table tbody');
    tbodyIps.innerHTML = '';
    ips.forEach(ip => {
        tbodyIps.innerHTML += `<tr><td>${ip}</td><td>${Math.floor(Math.random() * 50000) + 1000} B</td></tr>`;
    });

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
    
    const alertBadge = document.getElementById('alert-badge');
    if(alertBadge) {
        alertBadge.style.display = 'inline-block';
        alertBadge.innerText = alerts.length;
    }
    
    const alertGlow = document.getElementById('alert-glow');
    alertGlow.classList.add('active');
    setTimeout(() => alertGlow.classList.remove('active'), 1000);

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

// Rules Logic
window.addRule = function() {
    const name = document.getElementById('rule-name').value;
    const condition = document.getElementById('rule-condition').value;
    if (!name || !condition) return alert('Please fill in both fields.');
    
    const tbody = document.getElementById('rules-tbody');
    tbody.innerHTML += `
        <tr>
            <td>${name}</td>
            <td class="font-mono">${condition}</td>
            <td><button class="btn-delete" onclick="this.closest('tr').remove()">Delete</button></td>
        </tr>
    `;
    
    document.getElementById('rule-name').value = '';
    document.getElementById('rule-condition').value = '';
    logToTerminal("INFO", "Added new BPF rule: " + name);
}

// Export Logic
window.simulateExport = function(btn) {
    const progress = document.getElementById('export-progress');
    const fill = document.getElementById('export-fill');
    const status = document.getElementById('export-status');
    const btns = document.querySelectorAll('.export-btn');
    
    btns.forEach(b => b.disabled = true);
    progress.classList.remove('hidden');
    fill.style.width = '0%';
    status.innerText = 'Initializing export...';
    
    let pct = 0;
    const interval = setInterval(() => {
        pct += Math.floor(Math.random() * 20) + 10;
        if (pct >= 100) {
            pct = 100;
            clearInterval(interval);
            status.innerText = 'Export Complete! File saved to Downloads.';
            setTimeout(() => {
                progress.classList.add('hidden');
                btns.forEach(b => b.disabled = false);
            }, 3000);
            logToTerminal("INFO", "Export completed successfully.");
        }
        fill.style.width = pct + '%';
        if(pct < 100) status.innerText = `Exporting... ${pct}%`;
    }, 500);
}

// Playback Bar Logic
function setupPlaybackBar() {
    const playBtn = document.getElementById('pb-play');
    playBtn.addEventListener('click', () => {
        const icon = playBtn.innerText;
        playBtn.innerText = icon === '⏸' ? '▶' : '⏸';
    });
}
