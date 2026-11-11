# 🌊 YamunaPulse 

> **Continuous Spatiotemporal Satellite Water Quality & Anomaly Detection System**  
> 48 km multi-spectral Earth observation monitoring of the Yamuna River corridor from its Delhi entry at Palla to its exit at Asgarpur / Okhla.

[![Live Demo](https://img.shields.io/badge/Live_Demo-TryCloudflare-blue?style=for-the-badge&logo=cloudflare)](https://contain-taste-regulatory-insight.trycloudflare.com)
[![Author](https://img.shields.io/badge/Author-Parva_Sheth-amber?style=for-the-badge)](https://github.com/parvasheth)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Satellite](https://img.shields.io/badge/Earth_Observation-Sentinel--2_L2A-cyan?style=for-the-badge)](https://planetarycomputer.microsoft.com/)
[![Database](https://img.shields.io/badge/Storage-DuckDB-orange?style=for-the-badge)](https://duckdb.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-teal?style=for-the-badge)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61dafb?style=for-the-badge)](https://react.dev/)

---

## 🔗 Live Public Web Application
Experience the live application deployed and accessible over a secure HTTPS public tunnel:  
👉 **[https://contain-taste-regulatory-insight.trycloudflare.com](https://contain-taste-regulatory-insight.trycloudflare.com)**  
*(100% free, no login or credentials required — runs on desktop, tablet, and mobile).*

---

## 📸 Application Screenshots

### 1. Live River Map & Longitudinal Profile
*Split-screen view showing 18 monitoring stations, dynamic water quality choropleths, drain outfalls, and synchronized multi-year timelapse scrubber.*
![Live River Monitor](screenshots/01_monitor_view.png)

### 2. Pattern Discovery Matrix & Hands-on Column Tour
*2D multi-year heatmap matrices (`Node vs. Month`, `Node vs. Day-of-Week`, `Node vs. Nth-Weekday`) with automated scanning, layman ratings mode, and drain reach filtering.*
![Pattern Discovery Matrix](screenshots/02_pattern_matrix.png)

### 3. Share & Instant Cloud Publishing Modal
*Instant zero-credential public links, real-time DuckDB visitor counter, and author attribution.*
![Share Modal](screenshots/07_share_modal.png)

### 4. Continuous Satellite Ingestion & 5-Day Orbit Sync
*Automated daemon polling Microsoft Planetary Computer STAC for new Sentinel-2A/2B passes.*
![Sync Modal](screenshots/06_sync_modal.png)

### 5. Field Guide & Layman Glossary
*In-app education explaining satellite spectral indices, river hydrodynamics, and drain pollution sources.*
![Field Guide](screenshots/05_glossary_modal.png)

### 6. 100% Mobile Responsive Experience
*Full mobile optimization with thumb-friendly bottom navigation, responsive Map vs Profile view toggling, and horizontal swipeable matrix grids.*
| Mobile River Map | Mobile Longitudinal Profile |
|:---:|:---:|
| ![Mobile Map](screenshots/mobile_01_monitor_map.png) | ![Mobile Profile](screenshots/mobile_02_monitor_profile.png) |

---

## 🌟 Key Features

1. **Zero-Cost Multi-Spectral STAC Ingestion**:
   - Queries Microsoft Planetary Computer STAC for Copernicus **Sentinel-2 L2A** (`sentinel-2-l2a`) imagery without paid API keys.
   - Leverages Cloud-Optimized GeoTIFF (COG) HTTP range requests via `rasterio` to sample 150m × 150m node bounding boxes in seconds without downloading whole gigabyte scenes.
   - SCL (Scene Classification Layer) cloud/shadow masking with >20% rejection.
   - Dynamic water channel segmentation where $\text{NDWI} > 0.15$.

2. **The 4 Core Spectral Indices**:
   - **NDTI (Normalized Difference Turbidity Index)**: $\frac{B04 - B03}{B04 + B03}$ — Pinpoints suspended solids, silt, and untreated municipal sewage.
   - **NDCI (Normalized Difference Chlorophyll Index)**: $\frac{B05 - B04}{B05 + B04}$ — Quantifies eutrophication, algal scum, and rotting organic matter using Red-Edge Band 5.
   - **DOM Ratio (Dissolved Organic Matter / Dye Ratio)**: $\frac{B03}{B02}$ — Detects synthetic textile dyes, industrial surfactants, and toxic foam precursors.
   - **NDWI (Normalized Difference Water Index)**: $\frac{B03 - B08}{B03 + B08}$ — Identifies surface water boundary vs dry sandy shoals.

3. **Statistical Anomaly & Cyclical Detection Engine**:
   - **Cyclical Industrial Discharges**: Groups multi-year observations by `day_of_week` and `nth_weekday_of_month` (e.g., *2nd Friday*, *4th Friday*). Applies non-parametric Kruskal-Wallis $H$-tests ($p < 0.005$) and Z-scores to expose clandestine bi-weekly industrial tank dumping schedules.
   - **Longitudinal Spatial Breakpoints**: Changepoint detection identifies a $+533\%$ step-jump turbidity spike at the Najafgarh Drain outfall (km 16.5).
   - **Seasonal Comparator**: Longitudinal baseline comparisons across Pre-Monsoon, Monsoon, Post-Monsoon, and Winter.

4. **Interactive Geospatial Portal**:
   - Interactive map featuring **Esri World Imagery** satellite photography and **Esri Dark Canvas** with live basemap switching (100% free, zero API keys).
   - Synchronized timelapse scrubber with Play/Pause, 1x–10x playback speeds, and historical quick jumps (e.g., Chhath Puja foam events, monsoon dilution).
   - Layman Mode toggle that translates raw spectral decimals into intuitive qualitative ratings (*Clean*, *Fair*, *Murky*, *Extreme Sewage*).
   - DuckDB-backed live visitor counter with thread-safe concurrency.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Ingestion ["Continuous Satellite Ingestion"]
        S2A["Sentinel-2A (ESA)"]
        S2B["Sentinel-2B (ESA)"]
        PC["Microsoft Planetary Computer STAC API"]
        Sched["Autonomous Ingestion Daemon\n(Polls every 6 hrs for 5-day passes)"]
        S2A --> PC
        S2B --> PC
        PC --> Sched
    end

    subgraph Spectral ["Spectral Processing Pipeline"]
        SCL["SCL Cloud & Shadow Masking (>20% rejection)"]
        NDWI["Dynamic Water Segmentation (NDWI > 0.15)"]
        Indices["Spectral Indices: NDTI, NDCI, DOM_Ratio"]
        Sched --> SCL --> NDWI --> Indices
    end

    subgraph Storage ["Analytical Storage Layer"]
        DuckDB[("Local DuckDB Engine\n428 Passes | 7,704 Observations\nVisitor Analytics")]
        Indices --> DuckDB
    end

    subgraph Analytics ["Spatiotemporal Analytics Engine"]
        Seasonal["Seasonal Comparative Engine"]
        Cyclical["Cyclical Nth-Weekday Engine\n(Kruskal-Wallis p < 0.005, Z-scores)"]
        Breakpoint["Longitudinal Changepoint Detection\n(+533% step at Najafgarh km 16.5)"]
        Insights["Automated Intelligence Feed"]
        DuckDB --> Seasonal
        DuckDB --> Cyclical
        DuckDB --> Breakpoint
        DuckDB --> Insights
    end

    subgraph Portal ["Unified Web Application (FastAPI + React 19)"]
        API["FastAPI Backend (port 8000)"]
        ReactApp["React 19 + Leaflet + Recharts SPA"]
        Tunnel["Cloudflare Quick Tunnel (Public HTTPS)"]
        Analytics --> API
        API --> ReactApp
        ReactApp --> Tunnel
    end
```

---

## 🗺️ The 18 Monitoring Stations (Delhi Yamuna: 48.0 km)

| # | Station Name | River KM | Key Inflow / Feature | Impact Tier |
|:---:|---|:---:|---|:---:|
| **1** | Palla Entry Point | 0.0 km | NCT Delhi Entry (Freshwater baseline) | Baseline |
| **2** | Jagatpur Reach | 8.5 km | Upper Rural Floodplain | Low |
| **3** | Wazirabad Barrage Upstream | 13.5 km | Raw Water Abstraction Point | Low |
| **4** | Wazirabad Barrage Downstream | 14.5 km | Pondage Spill / Cutoff point | Moderate |
| **5** | Najafgarh Drain Outfall | 16.5 km | **Najafgarh Drain** (~60% of total sewage) | **Critical** |
| **6** | ISBT Kashmere Gate | 19.5 km | Mori Gate Drain | High |
| **7** | Old Railway Bridge (Loha Pul) | 21.5 km | Bela Road Drain | High |
| **8** | Geeta Colony / Shantivan | 23.5 km | Civil Lines Drain | High |
| **9** | ITO Barrage Upstream | 25.5 km | Drain No. 12 | High |
| **10** | Delhi Gate Drain Outfall | 26.5 km | **Delhi Gate Drain** | **Critical** |
| **11** | Barapullah / Nizamuddin Reach | 30.5 km | **Barapullah Drain** | **Critical** |
| **12** | DND Flyway Reach | 32.5 km | Sen Nursing Home Drain | High |
| **13** | Okhla Barrage Upstream | 36.0 km | Maharani Bagh Drain | High |
| **14** | Kalindi Kunj / Bird Sanctuary | 38.0 km | Kalkaji Drain / Toxic Froth Zone | High |
| **15** | Okhla Barrage Downstream | 40.0 km | **Shahdara Drain Outfall** | **Critical** |
| **16** | Jaitpur Reach | 42.5 km | Tehkhand Drain | High |
| **17** | Madanpur Khadar | 45.0 km | Tughlakabad Drain | High |
| **18** | Shahdara Confluence & Asgarpur | 48.0 km | NCT Delhi Exit Border | **Critical** |

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm

### 1. Clone & Set Up Backend
```bash
git clone https://github.com/parvasheth/YamunaPulse.git
cd YamunaPulse

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 2. Set Up Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Run Application
FastAPI serves the complete unified full-stack application (both API and React frontend) on a single port:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Open **`http://127.0.0.1:8000/`** in your browser!

### 4. Launch Instant Public Shareable Tunnel
To share a live link with anyone on the internet without configuring ports or routers:
```bash
# Windows:
.\share.bat
# or PowerShell:
.\share.ps1
```
This generates a live HTTPS link (`https://<subdomain>.trycloudflare.com`) with zero configuration!

---

## 🧪 Testing & Verification

Run the Python pipeline test suite:
```bash
pytest -v tests/test_pipeline.py
```
*(All 11 tests pass: validating geospatial bounding boxes, zero-division safety, seasonal grouping, Kruskal-Wallis anomaly calculations, and API endpoints).*

Run headless browser automated UI verification:
```bash
cd frontend
node verify_frontend.mjs
```

---

## 👤 Author
**Parva Sheth**  
- Email: [parvasheth@gmail.com](mailto:parvasheth@gmail.com)  
- GitHub: [@parvasheth](https://github.com/parvasheth)

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
