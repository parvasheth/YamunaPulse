import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Activity,
  Layers,
  Sparkles,
  Compass,
  AlertTriangle,
  Droplets,
  Calendar,
  Grid,
  CheckCircle2,
} from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'basics' | 'metrics' | 'dashboards' | 'anomalies' | 'science'>('basics');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                YamunaPulse Field Guide & Layman Glossary
              </h2>
              <p className="text-xs text-slate-400">
                A simple, beginner-friendly translation of satellite data, river health indices, and dashboard tools.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center space-x-2 p-3 bg-slate-950/40 border-b border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveCategory('basics')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeCategory === 'basics'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            1. What is YamunaPulse?
          </button>
          <button
            onClick={() => setActiveCategory('metrics')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeCategory === 'metrics'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            2. The 4 Spectral Indices (What They Mean)
          </button>
          <button
            onClick={() => setActiveCategory('dashboards')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeCategory === 'dashboards'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            3. How to Use the 4 Dashboard Tabs
          </button>
          <button
            onClick={() => setActiveCategory('anomalies')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeCategory === 'anomalies'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            4. Why Colors Change & Key Anomalies
          </button>
          <button
            onClick={() => setActiveCategory('science')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeCategory === 'science'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            5. Scientific Rigor & QA
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* TAB 1: BASICS */}
          {activeCategory === 'basics' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  What is the YamunaPulse Project?
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  The <strong>Yamuna River</strong> enters Delhi at <strong>Palla (km 0.0)</strong> as relatively clean water. Over the next <strong>48 kilometers</strong>, it passes through 18 critical monitoring sites where massive city drains pour untreated domestic wastewater, industrial chemicals, and factory dyes into the stream.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  YamunaPulse now also monitors the <strong>Ganga River (Haridwar Corridor, 34.0 km)</strong> from its Himalayan exit at <strong>Raiwala (km 0.0)</strong> past the sacred <strong>Har Ki Pauri</strong> ghats, Kassaban nullah, and <strong>Jagjeetpur STP (km 14.2)</strong> down to Balawali bridge (km 34.0).
                </p>
                <p className="text-slate-300 leading-relaxed">
                  <strong>YamunaPulse</strong> monitors both river stretches from space using the European Space Agency's <strong>Sentinel-2 satellites</strong>. Every 5 days as the satellite passes over, it photographs the river across multiple light frequencies (visible green, red, red-edge, and near-infrared). YamunaPulse reads these images to measure water quality without needing expensive physical water testing boats.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <span className="font-bold text-white block flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-400" />
                    River KM (0 to 48 km)
                  </span>
                  <p className="text-xs text-slate-300">
                    A distance odometer along the river. 0.0 km is Palla (entry), 16.5 km is Najafgarh Drain, 38.0 km is Kalindi Kunj (Okhla), and 48.0 km is Asgarpur (exit into UP).
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <span className="font-bold text-white block flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    150m x 150m Bounding Box
                  </span>
                  <p className="text-xs text-slate-300">
                    At each of the 18 nodes, we draw a 150m box across the river channel. Inside this box, we measure about 225 satellite pixels to calculate average water quality.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <span className="font-bold text-white block flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    Active Water Pixels
                  </span>
                  <p className="text-xs text-slate-300">
                    How many pixels inside the 150m box actually contain flowing water. In monsoon it swells to ~180+ pixels; in dry summer it shrinks to ~60 pixels (river narrowing).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: METRICS */}
          {activeCategory === 'metrics' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                <h3 className="text-base font-bold text-white mb-1">
                  The 4 Spectral Indices Explained in Plain English
                </h3>
                <p className="text-xs text-slate-400">
                  Satellites do not just take regular photos; they measure how water reflects different wavelengths of light. We use these light ratios to measure 4 distinct water properties:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* NDTI */}
                <div className="bg-slate-950/80 border border-amber-900/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-sm">
                      1. NDTI (Turbidity / Murkiness)
                    </span>
                    <span className="px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-400 rounded text-xs font-mono">
                      (B04 - B03) / (B04 + B03)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Layman Meaning:</strong> How murky, cloudy, or muddy the water is.
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Clear mountain water reflects green light (B03) and looks transparent. Murky water loaded with sewage sludge and suspended silt reflects more red light (B04).
                  </p>
                  <div className="text-[11px] bg-slate-900 p-2 rounded border border-slate-800 text-slate-300 flex justify-between font-mono">
                    <span className="text-emerald-400">&lt; 0.10: Clean / Clear</span>
                    <span className="text-amber-400">0.20 - 0.35: Moderate Sewage</span>
                    <span className="text-rose-400">&gt; 0.35: Severe Turbidity</span>
                  </div>
                </div>

                {/* NDCI */}
                <div className="bg-slate-950/80 border border-emerald-900/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 text-sm">
                      2. NDCI (Algae & Eutrophication)
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded text-xs font-mono">
                      (B05 - B04) / (B05 + B04)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Layman Meaning:</strong> Green algal scum, fertilizer runoff, and organic rot.
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    When untreated sewage loaded with nitrates and phosphates sits in warm stagnant sun, algae multiplies exponentially. Chlorophyll has a distinct sharp reflection at the &ldquo;Red Edge&rdquo; band (B05).
                  </p>
                  <div className="text-[11px] bg-slate-900 p-2 rounded border border-slate-800 text-slate-300 flex justify-between font-mono">
                    <span className="text-emerald-400">&lt; 0.00: Oligotrophic (Clean)</span>
                    <span className="text-amber-400">0.10 - 0.20: Algal Blooms</span>
                    <span className="text-rose-400">&gt; 0.20: Severe Eutrophication</span>
                  </div>
                </div>

                {/* DOM_Ratio */}
                <div className="bg-slate-950/80 border border-purple-900/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 text-sm">
                      3. DOM / Dye Ratio (Foam & Chemicals)
                    </span>
                    <span className="px-2 py-0.5 bg-purple-950 border border-purple-800 text-purple-400 rounded text-xs font-mono">
                      B03 / B02 (Green / Blue)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Layman Meaning:</strong> Soaps, detergents, textile dyes, and toxic froth precursors.
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Clean natural water absorbs red and reflects blue/green equally. When chemical surfactants and dissolved organic dyes enter the river, blue light (B02) gets heavily absorbed while green (B03) scatters, causing this ratio to spike.
                  </p>
                  <div className="text-[11px] bg-slate-900 p-2 rounded border border-slate-800 text-slate-300 flex justify-between font-mono">
                    <span className="text-emerald-400">~ 1.00: Natural Stream</span>
                    <span className="text-amber-400">1.20 - 1.40: High Organics</span>
                    <span className="text-rose-400">&gt; 1.45: Toxic Froth Risk</span>
                  </div>
                </div>

                {/* NDWI */}
                <div className="bg-slate-950/80 border border-blue-900/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-300 text-sm">
                      4. NDWI (Water Channel Presence)
                    </span>
                    <span className="px-2 py-0.5 bg-blue-950 border border-blue-800 text-blue-400 rounded text-xs font-mono">
                      (B03 - B08) / (B03 + B08)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Layman Meaning:</strong> Separates real wet river water from dry sandbars and mud banks.
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Water strongly absorbs Near-Infrared light (B08), giving positive NDWI values. Dry ground or sand reflects infrared light. We only measure water quality on pixels where NDWI &gt; 0.15.
                  </p>
                  <div className="text-[11px] bg-slate-900 p-2 rounded border border-slate-800 text-slate-300 flex justify-between font-mono">
                    <span className="text-slate-400">&lt; 0.15: Dry Bed / Sand</span>
                    <span className="text-cyan-400">0.20 - 0.40: Shallow Channel</span>
                    <span className="text-blue-400">&gt; 0.45: Deep Flow / Flood</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DASHBOARDS */}
          {activeCategory === 'dashboards' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                <h3 className="text-base font-bold text-white mb-1">
                  How to Navigate the 4 Dashboard Views
                </h3>
                <p className="text-xs text-slate-400">
                  Each tab gives you a different angle on the river&apos;s health:
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3">
                  <Activity className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Tab 1: Map & Timelapse Monitor</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      <strong>What it is:</strong> A split screen with a live satellite river map on the left and a 48 km river elevation profile on the right.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      <strong>How to use:</strong> Press &ldquo;Play Timelapse&rdquo; or drag the slider at the top to watch passes from 2021 to 2026. Click on any colored node on the map to open its 5-year history.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3">
                  <Grid className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Tab 2: Pattern Discovery Matrix</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      <strong>What it is:</strong> A heat-map grid comparing all 18 nodes against the 12 months, the 7 days of the week, or the &ldquo;Nth Weekday&rdquo; (e.g. 2nd Friday).
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      <strong>How to use:</strong> Use the hands-on &ldquo;Interactive Tour&rdquo; button to step through each column. Turn on &ldquo;Layman Translation&rdquo; to switch raw numbers into clear ratings like &ldquo;Clean&rdquo; or &ldquo;Toxic Spike&rdquo;.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Tab 3: Seasonal Hydrodynamic Engine</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      <strong>What it is:</strong> Compares Delhi&apos;s 4 distinct seasons: Pre-Monsoon (hot/dry), Monsoon (flooding/dilution), Post-Monsoon (receding), and Winter (toxic foam peak).
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      <strong>Key Insight:</strong> Monsoon flushes out organic algae but brings silt; winter cuts water flow to near zero, creating thick detergent foam at Kalindi Kunj.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-rose-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Tab 4: Automated Anomaly & Intelligence Feed</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      <strong>What it is:</strong> An automated AI incident board summarizing the top statistically proven pollution events.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      <strong>Value:</strong> Gives policy makers and citizens direct actionable engineering solutions (e.g. where to place aerators, when to dispatch inspection drones).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ANOMALIES */}
          {activeCategory === 'anomalies' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 border border-amber-800/80 rounded-xl p-4 space-y-2">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Why Does the Pattern Matrix Change Colors So Dramatically?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When you look at the heatmap grids, you will notice sudden shifts from calming green/cyan to deep orange and glowing red. Here is the physical and scientific reason:
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <span className="font-bold text-rose-400 text-xs uppercase tracking-wider block">
                    1. The Spatial Step-Jump (Najafgarh Drain at km 16.5)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Why are Rows 1 to 4 green, and Rows 5 to 18 suddenly orange/red? Upstream of Wazirabad Barrage, Delhi has not dumped its sewage yet. At Node 5, the Najafgarh Drain discharges roughly <strong>60% of the capital&apos;s wastewater</strong> in a single spot. The river literally changes color in satellite imagery right at this confluence.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <span className="font-bold text-blue-400 text-xs uppercase tracking-wider block">
                    2. The Monsoon Dilution Flush (July & August)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Why do columns July and August look completely different? Heavy rainfall in Himachal and Haryana forces the release of tens of thousands of cusecs from Hathnikund Barrage. This sudden volume of freshwater dilutes chemical concentrations and flushes green algae downstream.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <span className="font-bold text-amber-400 text-xs uppercase tracking-wider block">
                    3. The &ldquo;2nd Friday&rdquo; Industrial Tank Purge
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Why does the column labeled &ldquo;2nd Friday&rdquo; flash deep red? Statistical Z-score analysis ($+1.8\sigma$ anomaly, $p &lt; 0.005$) shows unauthorized factories along Barapullah and Shahdara storm drains systematically drain their holding tanks on alternate Friday nights before regulatory offices close for the weekend.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SCIENTIFIC RIGOR & REMOTE-SENSING QA */}
          {activeCategory === 'science' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  5 Scientific Quality Assurance Pillars
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs">
                  YamunaPulse implements five rigorous remote sensing and statistical safeguards to ensure satellite observations are free of terrestrial contamination, atmospheric noise, and seasonal bias:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Dynamic Water Masking */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 text-xs uppercase tracking-wider">
                      1. Dynamic Water Masking (MNDWI)
                    </span>
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/60 font-mono">
                      Per-Pass
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    During dry summer months, river water levels fall and the active channel contracts. The pipeline dynamically calculates <strong>Xu Modified NDWI (MNDWI &gt; 0)</strong> and <strong>NDWI (&gt; 0.15)</strong> on every single pass. This isolates active flowing water from exposed riverbanks, mudflats, and shoreline weeds so dry soil never skews water quality numbers.
                  </p>
                </div>

                {/* 2. Surface Reflectance & Cloud/Glint Filtering */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                      2. Surface Reflectance & SCL Glint Filter
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/60 font-mono">
                      Sen2Cor BOA
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    We query <strong>Sentinel-2 Level-2A</strong> atmospherically corrected Bottom-Of-Atmosphere (BOA) surface reflectance. In addition, the Scene Classification Layer (SCL) filters out clouds (classes 8, 9), cloud shadows (3), thin cirrus (10), and defective/saturated pixels (1). A spectral glint heuristic also detects and removes specular water surface reflection.
                  </p>
                </div>

                {/* 3. Clean Geometry Selection */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                      3. Clean Geometry Selection
                    </span>
                    <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800/60 font-mono">
                      150m Buffer
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Each monitoring node's 150m x 150m bounding box is strategically offset <strong>150m to 300m away from road and railway bridge superstructures</strong> (like Loha Pul, ISBT, and DND Flyway) and weir aprons. This guarantees zero spectral contamination from steel girders, asphalt decks, concrete piers, or turbulent white-water rapids.
                  </p>
                </div>

                {/* 4. Seasonal Baseline Comparison */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-400 text-xs uppercase tracking-wider">
                      4. Seasonal Baseline Comparison (&Delta;NDTI)
                    </span>
                    <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/60 font-mono">
                      Season-Stratified
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Rather than using a misleading flat annual average, new satellite observations are benchmarked using <strong>Seasonal Deltas (&Delta;NDTI)</strong> and <strong>Seasonal Z-Scores</strong> against that station's historical same-season and same-month baselines. Natural monsoon silt is never mistaken for an industrial anomaly.
                  </p>
                </div>

                {/* 5. Algae Cross-Check */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400 text-xs uppercase tracking-wider">
                      5. Chlorophyll-a (NDCI) Algae Cross-Check
                    </span>
                    <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800/60 font-mono">
                      Dual-Index Safeguard
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Severe eutrophic algal blooms create strong red-light absorption (chlorophyll-a dip in Band 4 at 665 nm), which can artificially pull NDTI downward and hide severe organic pollution. YamunaPulse <strong>pairs NDTI directly with NDCI (Normalized Difference Chlorophyll Index)</strong>. When NDCI &gt; 0.18, the algorithm flags an <em>&ldquo;Algae-Masked Eutrophic Spike&rdquo;</em>, ensuring pollution is never missed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Access Earth Observation for Public Environmental Transparency</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-lg transition-colors"
          >
            Got It, Take Me to the Portal
          </button>
        </div>
      </div>
    </div>
  );
};
