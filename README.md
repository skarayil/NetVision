<div align="center">

# 🌐 NetVision — Kurumsal Ağ İzleme Platformu

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=20&pause=1000&color=06B6D4&center=true&vCenter=true&width=750&lines=C%2B%2B+Backend+Daemon+%2B+Vanilla+JS+Frontend;Gerçek+Zamanlı+Paket+Analizi+%26+Anomali+Tespiti;WebSocket+%7C+GeoIP+%7C+IDS%2FIPS+%7C+i18n" alt="Typing SVG" />

<br/>

[![C++](https://img.shields.io/badge/C%2B%2B-17-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)](https://isocpp.org/)
[![HTML5](https://img.shields.io/badge/HTML5-Vanilla_JS-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![WebSocket](https://img.shields.io/badge/WebSocket-RFC_6455-4B5563?style=for-the-badge&logo=websocket&logoColor=white)](https://datatracker.ietf.org/doc/html/rfc6455)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Ready-222222?style=for-the-badge&logo=githubpages&logoColor=white)](https://pages.github.com/)
[![License](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](./LICENSE)

<br/>

> **Yüksek performanslı C++ daemon ile Vanilla JS arayüzünü birleştiren kurumsal ağ izleme platformu.**
> Gerçek zamanlı paket yakalama, anomali tespiti, GeoIP eşleme ve çok dilli arayüz desteğiyle
> ağınızı tek ekrandan izleyin.

<br/>

### 🌐 [Canlı Demo → NetVision](https://skarayil.github.io/NetVision/)

<br/>

[✨ Özellikler](#-özellikler) • [🏗️ Mimari](#️-mimari) • [⚡ WebSocket Protokolü](#-websocket-protokolü) • [🚀 Kurulum](#-kurulum) • [📁 Proje Yapısı](#-proje-yapısı)

</div>

---

## ✨ Özellikler

### 🔍 C++ Paket İnceleme Motoru
- **Yüksek Hızlı Yakalama:** Düşük bellek ayak iziyle maksimum performans sağlayan C++ çekirdeği
- **PacketParser:** TCP, UDP, ICMP, DNS ve HTTPS protokollerini otomatik ayırt eder
- **Anomali Tespiti:** Port tarama, SSH brute-force ve şüpheli Tor çıkış noktası trafiğini gerçek zamanlı saptar
- **BPF Filtre Desteği:** `ip and not port 8085` gibi özel Berkeley Packet Filter ifadeleri enjekte edilebilir

### 🌍 GeoIP Lokasyon Takibi
- Bağlantıların coğrafi kaynağını ülke ve şehir bazında eşler
- Dahili `GeoIPLite` motoru; IP adreslerini ülke, şehir, enlem ve boylam bilgisiyle zenginleştirir
- Dünya haritası üzerinde branch lokasyonlarını ve VPN tünellerini görselleştirir

### 🛡️ Güvenlik Merkezi (IDS/IPS)
- Canlı saldırı günlükleri ve tehdit zaman damgaları
- CVE tablosu ile açık güvenlik açıklarını takip eder (Kritik / Yüksek / Orta / Düşük)
- Risk skoru çubuğu, güvenlik puanı **94/100** seviyesini gerçek zamanlı günceller
- Tehdit anında kırmızı glow animasyonu ile görsel uyarı tetiklenir

### 📊 Gerçek Zamanlı Dashboard
- **KPI Kartları:** Toplam paket, bant genişliği (Mbps), aktif cihaz ve düşen paket sayaçları
- **Trafik Grafiği:** Gelen/giden bant genişliği akışını 20 noktalı canlı çizgi grafiğiyle gösterir
- **Protokol Dağılımı:** HTTPS, TCP, UDP, DNS ve ICMP isabet sayılarını bar grafiğiyle listeler
- **Sistem Sağlığı:** CPU, RAM, Disk dairesel gauge'ları; fan hızı, sıcaklık ve güç kaynağı sensörleri

### 🗺️ Ağ Haritası (Canvas Tabanlı)
- **İnteraktif Topoloji:** Düğümleri sürükle-bırak ile yeniden konumlandır; çift tıkla detay panelini aç
- **Paket Animasyonu:** Bağlantı hatları üzerinde gerçek zamanlı akan veri noktaları
- **Otomatik Keşif:** Subnet tarayarak yeni SNMP düğümlerini topolojiye ekler
- **Wi-Fi Isı Haritası:** Ofis kat planı üzerinde sinyal gücü gradyanını görselleştirir
- **Dünya Haritası:** SF, Dublin, İstanbul ve Tokyo branch lokasyonlarını pulse animasyonuyla işaretler

### 📡 İzleme Araçları
- **ICMP Ping & TCP Port Monitörü:** Hedef IP ekle, gecikme/kayıp/jitter ve port durumunu anlık izle
- **SNMP Arayüz Tablosu:** WAN, LAN uplink, VLAN ve IPsec tünel arayüzlerinin bant genişliği
- **NetFlow / sFlow / IPFIX Toplayıcı:** Kaynak/hedef IP, port, protokol, byte sayısı ve QoS sınıfı

### 🤖 Yapay Zeka Asistanı
- Gecikme analizi, tehdit sorguları ve kapasite tahmini için Türkçe/İngilizce yanıt üretir
- **Prediktif Bakım Paneli:** Disk doluluk tahmini, uplink bottleneck uyarısı, SLA ihlal riski hesaplar

### 📈 Raporlama & SLA
- PDF, Excel ve CSV formatlarında rapor dışa aktarımı (progress bar animasyonlu)
- SLA uyum özeti: ISP uptime, Wi-Fi erişilebilirlik, VPN tüneli ve gecikme hedefleri
- Haftalık otomatik rapor zamanlama konfigürasyonu

### 🌐 Çok Dilli Destek (i18n)
- **İngilizce** ve **Türkçe** yerelleştirme; tüm navigasyon, etiket ve mesajlar anlık değişir
- Yeni dil eklemek için `translations` objesine yeni anahtar seti yeterlidir

### 🎨 Tema & UX
- **Koyu / Açık tema** geçişi; tüm Chart.js grafikleri renk şemasını otomatik günceller
- Glassmorphism panel tasarımı ve ambient gradient arka plan efektleri
- Alt playback çubuğu ile veri akışını duraklat / devam ettir

---

## 🏗️ Mimari

```
┌─────────────────────────────────────────────────────────┐
│                  Web Arayüzü (Tarayıcı)                 │
│  index.html  ──  style.css  ──  app.js                  │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │Dashboard │ │ Network  │ │Security  │ │    AI     │  │
│  │  Charts  │ │   Map    │ │  Center  │ │ Assistant │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│                       │                                 │
│              WebSocket ws://localhost:8085               │
│              (veya Simülasyon Modu)                     │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              C++ NetVision Daemon                        │
│                                                         │
│  ┌─────────────────┐    ┌────────────────────────────┐  │
│  │  captureThread  │    │  webSocketServerThread     │  │
│  │  (Paket Okuma)  │    │  (RFC 6455 Handshake)      │  │
│  └────────┬────────┘    └───────────────┬────────────┘  │
│           │                             │               │
│  ┌────────▼────────┐    ┌───────────────▼────────────┐  │
│  │  PacketParser   │    │  clientBroadcasterThread   │  │
│  │  + Anomali Tes. │    │  (JSON → WS Frame / 1s)    │  │
│  └────────┬────────┘    └────────────────────────────┘  │
│           │                                             │
│  ┌────────▼────────┐                                    │
│  │   GeoIPLite     │                                    │
│  │  (IP → Lokasyon)│                                    │
│  └─────────────────┘                                    │
└─────────────────────────────────────────────────────────┘
```

### Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Backend Daemon** | C++17, POSIX Sockets, std::thread, std::mutex |
| **WebSocket Sunucu** | Sıfır bağımlılık; SHA-1 + Base64 ile RFC 6455 uyumlu el sıkışma |
| **Paket Analizi** | PacketParser (C++) — protokol ayrımı ve anomali kuralları |
| **GeoIP** | GeoIPLite (C++) — dahili IP → lokasyon önbelleği |
| **Frontend** | Vanilla HTML5 / CSS3 / JavaScript (ES6+) |
| **Grafikler** | Chart.js — çizgi, bar ve halka grafikleri |
| **Ağ Topolojisi** | HTML5 Canvas 2D API — özel render döngüsü |
| **İkonlar** | Font Awesome 6 |
| **Yazı Tipleri** | Google Fonts — Outfit, Fira Code |
| **Build Araçları** | Make + g++ (daemon); GitHub Pages (frontend) |

---

## ⚡ WebSocket Protokolü

NetVision daemon, herhangi bir harici kütüphane kullanmadan sıfırdan uygulanmış RFC 6455 uyumlu bir WebSocket sunucusu çalıştırır.

### El Sıkışma (Handshake)

```
İstemci → Sunucu (HTTP Upgrade İsteği):
  GET / HTTP/1.1
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Key: <base64 anahtar>

Sunucu → İstemci (101 Switching Protocols):
  HTTP/1.1 101 Switching Protocols
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Accept: <SHA-1(anahtar + GUID) | base64>
```

`Sec-WebSocket-Accept` değeri aşağıdaki formülle hesaplanır:

```
Base64( SHA-1( clientKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11" ) )
```

Tüm kriptografik işlemler `NetworkAnalyzer.cpp` içindeki `Crypt::sha1()` ve `Crypt::base64_encode()` fonksiyonlarıyla uygulanır.

### Veri Çerçevesi (WebSocket Frame)

Daemon, telemetri verisini standart **Text Frame** olarak gönderir:

```
Byte 0: 0x81  →  FIN=1, Opcode=0x1 (Text)
Byte 1: <payload uzunluğu>
  < 126      → tek byte uzunluk
  126–65535  → 0x7E + 2 byte uzunluk (big-endian)
Byte N+: JSON payload (UTF-8)
```

### JSON Telemetri Yükü

Daemon her **1 saniyede** aşağıdaki yapıyı tüm bağlı istemcilere yayınlar:

```json
{
  "totalPackets": 148320,
  "droppedPackets": 3,
  "activeConnections": 182,
  "currentBandwidthMbps": 47.35,
  "systemStatus": "RUNNING",
  "cpuUsage": 18.4,
  "ramUsage": 44.1,
  "diskUsage": 28.4,
  "fanSpeedRpm": 2400,
  "temperatureC": 39.2,
  "powerSupplyStatus": "OK",
  "latencyMs": 14.7,
  "packetLossPct": 0.02,
  "jitterMs": 1.3,
  "securityScore": 94,
  "threats": [
    "Port Scan Detected from IP 185.220.101.5"
  ],
  "netFlow": [
    { "src": "192.168.1.15", "dst": "8.8.8.8",        "proto": "UDP", "bytes": 1240, "port": 53  },
    { "src": "192.168.1.10", "dst": "104.21.23.4",    "proto": "TCP", "bytes": 98420, "port": 443 },
    { "src": "192.168.10.42","dst": "185.220.101.5",  "proto": "TCP", "bytes": 4800, "port": 22  }
  ]
}
```

### Bağlantı Yönetimi

- Sunucu, her yeni istemciyi ayrı bir `detach` thread'de kabul eder; ana sunucu thread'i bloklanmaz
- `SO_RCVTIMEO: 1s` ile `accept()` çağrısı döngüsel olarak `isRunning_` bayrağını kontrol eder
- Kopuk istemciler `send()` hatası yakalanarak `clientSockets_` listesinden temiz şekilde kaldırılır
- Frontend bağlantı kuramadığında otomatik olarak **Simülasyon Moduna** geçer

---

## 🚀 Kurulum

### Gereksinimler

| Araç | Versiyon |
|------|---------|
| g++ | C++17 destekleyen herhangi bir sürüm |
| make | GNU Make |
| Modern tarayıcı | Chrome, Firefox, Edge (Canvas + WebSocket) |

---

### 1 — Repoyu Klonla

```bash
git clone https://github.com/your-username/netvision.git
cd netvision
```

---

### 2 — C++ Daemon'ı Derle

```bash
make
```

Derleme çıktısı `netvision_daemon` binary'si olarak proje kök dizinine yerleşir.

Temizlemek için:

```bash
make clean
```

---

### 3 — Daemon'ı Çalıştır

Paket yakalama için root yetkisi gerekir:

```bash
sudo ./netvision_daemon
```

Özel parametrelerle çalıştırma:

```bash
# Arayüz, port ve BPF filtresi belirterek
sudo ./netvision_daemon -i eth0 -p 8085 -f "ip and not port 8085"
```

| Parametre | Kısa | Varsayılan | Açıklama |
|-----------|------|-----------|----------|
| `--interface` | `-i` | `en0` | Dinlenecek ağ arayüzü |
| `--port` | `-p` | `8080` | WebSocket sunucu portu |
| `--filter` | `-f` | `ip` | BPF filtre ifadesi |
| `--help` | `-h` | — | Yardım mesajını göster |

---

### 4 — Web Arayüzünü Aç

#### Yerel Geliştirme

```bash
# Herhangi bir statik dosya sunucusuyla aç
npx serve .
# veya doğrudan tarayıcıda
open index.html
```

#### GitHub Pages

Repoyu GitHub'a push'la → **Settings → Pages → Branch: main** seç → Deploy.

> Frontend, C++ daemon olmadan **Simülasyon Modunda** tam işlevsel çalışır.
> GitHub Pages deployment için ek araç gerekmez.

---

### 5 — Frontend'i Daemon'a Bağla

1. Tarayıcıda **Settings** sekmesine git
2. *Daemon Connection Mode* alanını **"Live WebSocket Daemon"** olarak değiştir
3. **Save & Apply Config** butonuna bas
4. **Start Capture** ile izlemeyi başlat

Daemon bağlantısı başarılı olursa üst çubukta **"Live Daemon Connected"** rozeti görünür.

---

## 📁 Proje Yapısı

```
netvision/
│
├── src/                        ← C++ kaynak dosyaları
│   ├── main.cpp                   Daemon giriş noktası, sinyal yönetimi
│   ├── NetworkAnalyzer.cpp        WebSocket sunucu, yayıncı ve yakalama thread'leri
│   ├── PacketParser.cpp           Protokol ayrımı ve anomali kuralları
│   └── GeoIPLite.cpp              IP → coğrafi konum eşleme
│
├── include/                    ← C++ başlık dosyaları
│   ├── NetworkAnalyzer.hpp
│   ├── PacketParser.hpp
│   └── GeoIPLite.hpp
│
├── build/                      ← Derleme artefaktları (make ile oluşur)
│
├── index.html                  ← SPA şablonu, tüm görünümler burada
├── style.css                   ← Koyu/açık tema, glassmorphism, animasyonlar
├── app.js                      ← Uygulama mantığı; i18n, WebSocket, Canvas, Chart.js
├── Makefile                    ← C++ derleme kuralları
└── README.md
```

---

## 🖥️ Daemon Mimarisi — Thread Modeli

```
main()
  └── NetworkAnalyzer::startCapture()
        ├── captureThread()           → Paket okuma döngüsü (5ms aralık)
        │     └── processPacket()     → İstatistik güncelleme + anomali kontrolü
        │
        ├── webSocketServerThread()   → accept() döngüsü (SO_RCVTIMEO: 1s)
        │     └── handleWebSocketHandshake() [detach]
        │           └── RFC 6455 el sıkışması → clientSockets_ listesine ekle
        │
        └── clientBroadcasterThread() → 1s aralıkla JSON yayını
              └── broadcastMessage()  → WS Text Frame → tüm aktif istemciler
```

---

## 📄 Lisans

Bu proje [MIT Lisansı](./LICENSE) altında dağıtılmaktadır.

---

<div align="center">

**NetVision — C++ Daemon + Vanilla JS ile Kurumsal Ağ İzleme**

*WebSocket · GeoIP · IDS/IPS · Canvas Topoloji · i18n*

### 👩‍💻 Created by Sude Naz Karayıldırım

[![GitHub](https://img.shields.io/badge/GitHub-skarayil-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/skarayil)
[![42 Profile](https://img.shields.io/badge/42%20Profile-skarayil-black?style=flat-square&logo=42&logoColor=white)](https://profile.intra.42.fr/users/skarayil)

**⭐ Beğendiyseniz repo'ya star vermeyi unutmayın!**

</div
