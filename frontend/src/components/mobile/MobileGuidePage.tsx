import React, { useState } from 'react';
import {
  BookOpen,
  ArrowLeft,
  Waves,
  Sparkles,
  Satellite,
  Compass,
} from 'lucide-react';

interface MobileGuidePageProps {
  onBack: () => void;
}

export const MobileGuidePage: React.FC<MobileGuidePageProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<'basics' | 'indices' | 'reaches' | 'satellites'>('basics');

  return (
    <div className="flex flex-col gap-3 p-3 max-w-full pb-24 animate-in fade-in text-slate-200">
      {/* Back Button Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <button
          data-testid="guide-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 text-xs font-semibold active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </button>

        <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>By Parva Sheth</span>
        </div>
      </div>

      {/* Guide Title Banner */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-900/40 rounded-2xl p-3.5 space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">YamunaPulse Field Guide</h2>
            <p className="text-[11px] text-slate-400">Plain-English guide to satellite river observation</p>
          </div>
        </div>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setActiveSection('basics')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'basics'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          1. The Basics
        </button>
        <button
          onClick={() => setActiveSection('indices')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'indices'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          2. The 4 Water Indices
        </button>
        <button
          onClick={() => setActiveSection('reaches')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'reaches'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          3. Delhi Drains & Reaches
        </button>
        <button
          onClick={() => setActiveSection('satellites')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'satellites'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          4. Free Satellite Tech
        </button>
      </div>

      {/* Section 1: The Basics */}
      {activeSection === 'basics' && (
        <div className="space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-cyan-400" />
              What is YamunaPulse?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              YamunaPulse is an autonomous Earth observation intelligence platform created by <strong>Parva Sheth</strong>. It monitors the <strong>48 km stretch of the Yamuna River</strong> flowing through the National Capital Territory of Delhi, from its entry at <strong>Palla (km 0.0)</strong> to its exit at <strong>Asgarpur / Okhla (km 48.0)</strong>.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unlike traditional manual grab sampling which happens once a month at just 2-3 points, YamunaPulse measures <strong>18 equidistant virtual stations every 5 days</strong> using European Space Agency Sentinel-2 satellites.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              How the App is Organized
            </h3>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <strong className="text-cyan-400">🗺️ Map:</strong> Full-screen satellite map with interactive station pins and color-coded pollution levels.
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <strong className="text-blue-400">📈 Profile:</strong> 48 km river cascade line chart with timeline scrubber and playback animation.
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <strong className="text-indigo-400">🗓️ Patterns:</strong> 2D heatmap matrix exposing day-of-week and bi-weekly industrial dumping schedules.
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <strong className="text-emerald-400">🌦️ Seasonal:</strong> Comparing monsoon flushing against winter toxic froth build-up.
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <strong className="text-rose-400">🚨 Anomalies:</strong> Automated statistical alerts for sudden pollution step-jumps.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: The 4 Water Indices */}
      {activeSection === 'indices' && (
        <div className="space-y-3">
          {/* NDTI */}
          <div className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-300">NDTI — Turbidity & Sewage</h4>
              <span className="text-[10px] font-mono bg-amber-950 text-amber-400 px-2 py-0.5 rounded-full border border-amber-800/60">
                (B04 - B03)/(B04 + B03)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Measures how murky the water is from suspended sediments, silt, and untreated municipal sewage sludge. Clean water reflects low Red light; sewage-loaded water scatters intense Red.
            </p>
            <div className="text-[11px] text-slate-400 font-mono pt-1">
              &lt; 0.05: Clean &bull; 0.05–0.15: Fair &bull; 0.15–0.25: Murky &bull; &gt; 0.25: Extreme Sewage
            </div>
          </div>

          {/* NDCI */}
          <div className="bg-slate-900/90 border border-emerald-900/40 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-300">NDCI — Algal Scum & Chlorophyll</h4>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/60">
                (B05 - B04)/(B05 + B04)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Uses Sentinel-2's specialized Red-Edge Band 5 to detect chlorophyll-a in microscopic algae. High readings indicate severe eutrophication caused by fertilizer runoff and detergent phosphates.
            </p>
            <div className="text-[11px] text-slate-400 font-mono pt-1">
              &lt; -0.05: Low Algae &bull; 0.00–0.05: Moderate &bull; &gt; 0.05: Severe Bloom
            </div>
          </div>

          {/* DOM */}
          <div className="bg-slate-900/90 border border-indigo-900/40 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-300">DOM Ratio — Industrial Dye & Surfactants</h4>
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-800/60">
                B03 / B02
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Detects chemical effluents from textile dyeing units and detergent foaming surfactants that cause the famous toxic foam at Okhla Barrage and Kalindi Kunj during Chhath Puja.
            </p>
            <div className="text-[11px] text-slate-400 font-mono pt-1">
              &lt; 0.85: Normal &bull; 0.85–1.10: Elevated &bull; &gt; 1.10: Severe Chemical Dyes
            </div>
          </div>

          {/* NDWI */}
          <div className="bg-slate-900/90 border border-cyan-900/40 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-cyan-300">NDWI — Water Surface Delineation</h4>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800/60">
                (B03 - B08)/(B03 + B08)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Separates actual liquid river flow from dry sandbars, riverbanks, and exposed mudflats. Every station dynamically calculates indices only where NDWI &gt; 0.15.
            </p>
          </div>
        </div>
      )}

      {/* Section 3: Delhi Drains & Reaches */}
      {activeSection === 'reaches' && (
        <div className="space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h3 className="text-sm font-bold text-white">The Anatomy of Delhi Yamuna</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Delhi represents only <strong>2% of the Yamuna's total length</strong>, yet contributes nearly <strong>80% of its total pollution load</strong>.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 space-y-1">
              <div className="font-bold text-emerald-400">Reach 1: Entry & Upper Reach (km 0.0 to 15.0)</div>
              <p className="text-slate-300">
                From Palla to Wazirabad Barrage. Water is relatively clean (NDTI ~0.04). Drinking water is extracted for Delhi at Wazirabad.
              </p>
            </div>

            <div className="bg-rose-950/30 border border-rose-800/50 rounded-xl p-3 space-y-1">
              <div className="font-bold text-rose-400">Reach 2: The Toxic Urban Core (km 16.5 to 35.0)</div>
              <p className="text-slate-300">
                Begins with the catastrophic inflow of the <strong>Najafgarh Drain at km 16.5</strong>, which single-handedly dumps ~70% of Delhi's untreated wastewater, causing a <strong>+533% turbidity step-jump</strong>. Followed by Delhi Gate and Barapullah drains.
              </p>
            </div>

            <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 space-y-1">
              <div className="font-bold text-amber-400">Reach 3: Okhla & Exit Reach (km 36.0 to 48.0)</div>
              <p className="text-slate-300">
                Water hits Okhla Barrage and Kalindi Kunj, where drop-structures create churning that whips detergent surfactants into floating toxic foam, before flowing past Shahdara Drain into Uttar Pradesh.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Free Satellite Tech */}
      {activeSection === 'satellites' && (
        <div className="space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
              <Satellite className="w-4 h-4 text-cyan-400" />
              100% Free Open Science Stack
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              YamunaPulse is engineered to run permanently with <strong>zero paid API keys and zero vendor lock-in</strong>:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li><strong>Sentinel-2 L2A:</strong> ESA constellation twin satellites (2A & 2B) orbiting at 786 km altitude.</li>
              <li><strong>Microsoft Planetary Computer:</strong> Free open STAC catalog without usage quotas.</li>
              <li><strong>Cloud-Optimized GeoTIFFs (COG):</strong> Byte-range HTTP requests extract 150m station bounding boxes in seconds without downloading whole gigabyte scenes.</li>
              <li><strong>DuckDB:</strong> Embedded analytical columnar database providing sub-millisecond aggregation queries.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Footer attribution */}
      <div className="text-center text-[11px] text-slate-500 pt-3">
        YamunaPulse &bull; Designed & Built by Parva Sheth
      </div>
    </div>
  );
};
