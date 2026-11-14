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
  const [activeSection, setActiveSection] = useState<'basics' | 'indices' | 'reaches' | 'satellites' | 'science'>('basics');

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
        <button
          onClick={() => setActiveSection('science')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'science'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          5. Scientific QA
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

      {/* Section 3: Corridors & Reaches */}
      {activeSection === 'reaches' && (
        <div className="space-y-3">
          {/* Delhi Yamuna */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h3 className="text-sm font-bold text-cyan-400">1. Delhi Yamuna Corridor (48.0 km)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Delhi represents only <strong>2% of the Yamuna's length</strong>, yet contributes nearly <strong>80% of its total pollution load</strong>.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 space-y-1">
              <div className="font-bold text-emerald-400">Yamuna Reach 1: Pristine Entry (km 0.0 to 15.0)</div>
              <p className="text-slate-300">
                From Palla to Wazirabad Barrage. Cold baseline runoff (NDTI ~0.04). Drinking water is extracted for Delhi at Wazirabad before zero base-flow release downstream.
              </p>
            </div>

            <div className="bg-rose-950/30 border border-rose-800/50 rounded-xl p-3 space-y-1">
              <div className="font-bold text-rose-400">Yamuna Reach 2: Urban Collapse (km 16.5 to 35.0)</div>
              <p className="text-slate-300">
                Begins with the catastrophic inflow of the <strong>Najafgarh Drain at km 16.5</strong>, dumping &gt;60% of Delhi's wastewater (+533% turbidity step-jump), followed by Delhi Gate and Barapullah drains.
              </p>
            </div>

            <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 space-y-1">
              <div className="font-bold text-amber-400">Yamuna Reach 3: Okhla Frothing & Exit (km 36.0 to 48.0)</div>
              <p className="text-slate-300">
                Water hits Okhla Barrage and Kalindi Kunj, where drop-structures whip surfactant-laden effluents into floating toxic foam, before flowing past Shahdara Drain into Uttar Pradesh.
              </p>
            </div>
          </div>

          {/* Haridwar Ganga */}
          <div className="bg-slate-900/90 border border-emerald-900/50 rounded-xl p-3.5 space-y-2 mt-4">
            <h3 className="text-sm font-bold text-emerald-400">2. Haridwar Ganga Corridor (34.0 km)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tracking the holy Ganga from its Himalayan mountain exit at Rajaji National Park through the sacred pilgrimage center and industrial plains.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 space-y-1">
              <div className="font-bold text-emerald-400">Ganga Reach 1: Himalayan Foothills (km 0.0 to 4.5)</div>
              <p className="text-slate-300">
                Raiwala and Bhimgoda Barrage: Crystal-clear cold snowmelt with ultra-low non-monsoon turbidity (NDTI ~0.03). High water clarity and gravelly boulder bed.
              </p>
            </div>

            <div className="bg-cyan-950/30 border border-cyan-800/50 rounded-xl p-3 space-y-1">
              <div className="font-bold text-cyan-400">Ganga Reach 2: Pilgrimage Core & Ghats (km 5.4 to 10.5)</div>
              <p className="text-slate-300">
                <strong>Har Ki Pauri (km 5.4)</strong>: Holy bathing epicenter where weekend and festival crowds generate distinct organic load pulses (DOM ratio surges +35%), followed by Kassaban nullah drainage.
              </p>
            </div>

            <div className="bg-rose-950/30 border border-rose-800/50 rounded-xl p-3 space-y-1">
              <div className="font-bold text-rose-400">Ganga Reach 3: Jagjeetpur STP & SIIDCUL (km 14.2 to 23.0)</div>
              <p className="text-slate-300">
                <strong>Jagjeetpur STP (km 14.2)</strong>: Major municipal outfall (68 + 27 MLD) causing the river's primary step-jump. Followed by <strong>SIIDCUL canal (km 19.2)</strong> with cyclical mid-week industrial batch discharges.
              </p>
            </div>

            <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 space-y-1">
              <div className="font-bold text-amber-400">Ganga Reach 4: Laksar Sugar Mills & Exit (km 28.5 to 34.0)</div>
              <p className="text-slate-300">
                Agro-industrial sugarcane crushing season (Nov–March) surges organic effluents into the Laksar drain before the river exits Haridwar at Balawali Bridge.
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

      {/* Section 5: Scientific Rigor & QA */}
      {activeSection === 'science' && (
        <div className="space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              5 Remote-Sensing Quality Assurance Pillars
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg space-y-1">
                <span className="font-bold text-cyan-400 block">1. Dynamic Water Masking (MNDWI)</span>
                <p className="text-slate-300">
                  Calculates MNDWI (&gt;0) and NDWI (&gt;0.15) on every pass to trace the true flowing channel, excluding dry sandbars, mudflats, and shore weeds as river levels rise and fall.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg space-y-1">
                <span className="font-bold text-emerald-400 block">2. Surface Reflectance & SCL Glint Filter</span>
                <p className="text-slate-300">
                  Uses atmospherically corrected Sentinel-2 Level-2A (BOA) data. Sen2Cor Scene Classification Layer (SCL) filters clouds (8, 9), shadows (3), cirrus (10), and sun glint (1).
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg space-y-1">
                <span className="font-bold text-amber-400 block">3. Clean Geometry Selection</span>
                <p className="text-slate-300">
                  Every 150m sampling box is placed in open channel water, offset 150m–300m away from road/rail bridge decks and weir aprons to prevent asphalt/steel spectral bias.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg space-y-1">
                <span className="font-bold text-purple-400 block">4. Seasonal Baseline Comparison (&Delta;NDTI)</span>
                <p className="text-slate-300">
                  Readings are benchmarked against historical same-season and same-month baselines via Seasonal Deltas (&Delta;NDTI) and Z-scores, avoiding misleading flat annual averages.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg space-y-1">
                <span className="font-bold text-rose-400 block">5. Chlorophyll-a Algae Cross-Check</span>
                <p className="text-slate-300">
                  NDTI is paired with chlorophyll index (NDCI). Catches masked eutrophic blooms where red light absorption (B04 dip) artificially suppresses NDTI despite heavy pollution.
                </p>
              </div>
            </div>
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
