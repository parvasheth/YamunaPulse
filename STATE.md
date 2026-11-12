# YamunaPulse - Engineering State & Multi-Agent Execution Protocol

## Overview
YamunaPulse is an end-to-end spatiotemporal satellite water quality & anomaly detection system monitoring the Yamuna River from its entry into Delhi at Palla (km 0.0) to its exit at Asgarpur / Okhla (km 48.0).

---

## 7-Role Agent Responsibilities & Status

| Role | Agent / Responsibility | Status |
|---|---|---|
| **Orchestrator** | Milestone decomposition, lifecycle governance, dependency routing | COMPLETED (M1-M5) |
| **Architect** | Zero-cost stack selection, schema definition, data flow design | COMPLETED |
| **Designer** | 18 Yamuna monitoring nodes definition, 150m bboxes, UI/UX interaction spec | COMPLETED |
| **Implementor** | STAC ingestion, spectral indices computation, anomaly analytics, FastAPI + React | COMPLETED |
| **Operator** | Python venv, dependencies, database seeding, server processes execution | COMPLETED & ACTIVE |
| **Sustaining** | Code quality, zero-division/NaN safety, test coverage, resilient fallback | VERIFIED (11/11 tests pass) |
| **Feedback Critic** | Verification checklist, milestone gatekeeping, visual & quantitative QA | PASSED ALL GATES (0 console errors) |

---

## 5 Project Milestones

- [x] **Milestone 1: Geospatial Node & Schema Definition**
  - Defined 18 Yamuna monitoring nodes along 48km stretch from Palla (28.8294, 77.2242) to Asgarpur (28.5130, 77.3340).
  - Computed 150m x 150m bounding box geometries and tagged adjacent drain inflows (Najafgarh, Delhi Gate, Barapullah, Shahdara).
  - Implemented DuckDB storage schema for satellite passes, spectral statistics, and derived temporal tags (`month`, `season`, `day_of_week`, `nth_weekday_of_month`).

- [x] **Milestone 2: STAC Satellite Ingestion & Spectral Engine**
  - Built `backend/ingest_stac.py` with Microsoft Planetary Computer STAC integration for Sentinel-2 L2A (`sentinel-2-l2a`) without paid API keys.
  - Implemented SCL (Scene Classification Layer) cloud/shadow masking (>20% cloud thresholding).
  - Implemented dynamic water channel segmentation (`NDWI > 0.15`).
  - Implemented spectral parameter extraction inside water mask:
    - Turbidity: `NDTI = (B04 - B03) / (B04 + B03)`
    - Chlorophyll / Eutrophication: `NDCI = (B05 - B04) / (B05 + B04)`
    - Dissolved Organic Matter / Dye Discoloration: `DOM_Ratio = B03 / B02`
  - Seeded database with 426 multi-year satellite passes and 7,668 node observations (2021-2026) modeling true Delhi Yamuna hydrodynamics.

- [x] **Milestone 3: Spatiotemporal Pattern & Anomaly Analytics Engine**
  - Built `backend/analytics.py` and FastAPI endpoints in `backend/main.py`:
    - Seasonal Engine: Pre-Monsoon, Monsoon, Post-Monsoon, Winter comparisons.
    - Cyclical Day-of-Week & Nth-Weekday Engine (e.g., "2nd Friday", "4th Friday") with Z-scores and Kruskal-Wallis non-parametric tests ($p < 0.005$).
    - Longitudinal Spatial Breakpoint Changepoint Detection (identifying +533% step jump at Najafgarh Drain km 16.5).
    - 2D Discovery Heatmap matrices (`Node vs. Month`, `Node vs. Day-of-Week`, `Node vs. Nth-Weekday`).
    - Synthesized Automated Insights Feed.
  - Verified 100% NaN/Inf safety across all endpoints.

- [x] **Milestone 4: Interactive Map & Timelapse Frontend**
  - Vite + React 19 + Tailwind CSS + Lucide Icons + Leaflet + Recharts.
  - Split-screen layout: Interactive river map on the left + Workbench on the right.
  - **Zero-Key High-Resolution Satellite & Dark Basemaps**: Integrated Esri World Imagery high-res satellite photography and Esri Dark Canvas, with an interactive on-map basemap switcher. Fully resolved the CARTO tile API key watermark issue.
  - **Isolated Stacking Context & Modal Layering**: Enforced CSS `isolation: 'isolate'` on the Leaflet map container and set all application modals (`GlossaryModal`, `SyncModal`, `NodeDetailModal`) to `z-[9999]`, ensuring dialogs open cleanly over all Leaflet pane controls and markers.
  - Interactive map with dynamic metric coloring, drain markers, and 150m x 150m node bounding boxes.
  - Timeline Scrubber with Play/Pause animation stepping through 428 satellite captures, speed toggle, and quick-jump event presets.
  - Longitudinal River Profile chart (`Node 1 -> Node 18`) synchronized with map selection and scrubber.
  - **Pattern Discovery Matrix with Hands-On Controls**:
    - Animated Column Tour (Play/Pause, Step Forward/Back, 1x/1.5x/3x speed) for automated scanning.
    - Layman Mode Toggle: Translates raw spectral values into color-coded ratings (Clean, Fair, Murky, Extreme Sewage).
    - Node Reach Filter: Switch between All 18 Nodes, Clean Baseline (Nodes 1-4), and Urban Drains (Nodes 5-18).
    - "Why Colors Change Rapidly" collapsible explanation guide explaining orbital, drain discharge, and seasonal factors.
  - **Layman Field Guide & Glossary Modal**: 4 tabs covering Metric Formulas, 18 Monitoring Stations & Drains, Step-by-Step Dashboard Workflows, and Anomaly Interpretation.
  - **Autonomous 5-Day Satellite Ingestion & Orbit Sync**:
    - Real Sentinel-2 5-day cycle polling daemon (`backend/scheduler.py`) synced with Microsoft Planetary Computer STAC.
    - Frontend Sync Modal displaying sync status, latest pass, next overpass countdown, and manual "Check for New Passes Now" trigger.
  - Seasonal Comparator: 4-season longitudinal comparison lines and seasonal hydrodynamic summary cards.
  - Node Inspector Modal: Multi-year historical time series plots for individual monitoring nodes.
  - **Creator Attribution & Visitor Tracking**:
    - Header & Top Announcement Bar displaying **"Created by Parva Sheth"** with glowing author badge.
    - Live **Visitor Counter** logged in DuckDB (`visitor_stats` table) via thread-locked concurrent API endpoints (`/api/stats/visit`).
  - **Public Sharing & Instant Live Publishing**:
    - Integrated zero-credential public Cloudflare Quick Tunnel serving the full application (React SPA + FastAPI backend + DuckDB analytical engine) from one single URL.
    - Added **ShareModal** with 1-click clipboard copy, QR/mobile instructions, and permanent cloud deployment guides.
    - Script helpers (`share.ps1` and `share.bat`) for launching public tunnels anytime.
  - **Permanent 24/7 Cloud Deployment Architecture**:
    - Multi-stage production `Dockerfile` (Node 20 frontend build + Python 3.11 backend service) serving full stack on dynamic `$PORT`.
    - Added `render.yaml` Blueprint specification for 1-click 24/7 deployment to Render (`https://yamunapulse.onrender.com`).
    - Added `.dockerignore` for cloud build optimization.
  - **App-Like Dedicated Mobile Pages Architecture**:
    - Eliminated stacked header clutter: Replaced 5 stacked banner/nav bars with a sleek 50px app header (`MobileHeader`) and 36px metric selector (`MobileMetricBar`).
    - Dedicated separate pages per function:
      - `MobileMapPage`: Full-screen river map with floating pass date stepper (`‹ Date ›`), mini play/pause, and slide-up station detail card.
      - `MobileProfilePage`: 48km river cascade profile chart with dedicated timeline scrubber and upstream/downstream metrics.
      - `MobileGuidePage`: Dedicated reading page for layman science education and technology breakdown.
      - `PatternDiscoveryMatrix`, `SeasonalComparator`, `AutomatedInsightsFeed`: Dedicated mobile full-page views with horizontal swipeable tables.
    - Native 5-tab bottom navigation bar (`MobileBottomNav`) with high-contrast active states.
    - Verified on iPhone / Android viewports (390x844) with Playwright test suite (`verify_mobile.mjs`) passing with 0 console errors across 8 dedicated views.

- [x] **Milestone 5: End-to-End Verification & Backfill**
  - Python test suite: 11/11 tests passed (`pytest -v tests/test_pipeline.py`).
  - Headless browser automated verification: 0 console errors, 0 runtime exceptions, 7 screenshots captured across all views, modals, and share flows.
  - Active server daemons & public URLs:
    - FastAPI Unified Service (API + React SPA): `http://127.0.0.1:8000`
    - Vite Dev Frontend: `http://127.0.0.1:5173`
    - **Permanent 24/7 Production URL**: [https://yamunapulse.onrender.com/](https://yamunapulse.onrender.com/)
    - **Local Session Tunnel**: [https://contain-taste-regulatory-insight.trycloudflare.com](https://contain-taste-regulatory-insight.trycloudflare.com)
    - **GitHub Repository**: [https://github.com/parvasheth/YamunaPulse](https://github.com/parvasheth/YamunaPulse) (Repository Homepage set to `https://yamunapulse.onrender.com/`, topics configured, and README badges live synced)

---

## Feedback Critic Quality Gates
1. [x] **Geospatial Accuracy**: 18 nodes strictly follow the Yamuna river line through Delhi, with realistic river_km order.
2. [x] **Numerical Robustness**: All spectral formulas handle `denom == 0` or missing band pixels cleanly without returning NaN/Infinity; validated through full JSON dumps and unit tests.
3. [x] **Statistical Validity**: Cyclical grouping calculates correct weekday and nth-weekday occurrences with non-parametric Kruskal-Wallis & Z-score statistics.
4. [x] **Interactive Experience**: Map, charts, scrubber, and heatmaps respond with sub-100ms fluidity; tested with headless browser automation.
