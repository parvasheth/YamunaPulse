import React, { useState, useEffect } from 'react';
import type { HeatmapMatrixResponse, WaterMetric, CyclicalRule } from '../types';
import { METRIC_CONFIGS, getMetricColor } from '../utils/metrics';
import {
  Grid,
  Calendar,
  Clock,
  Layers,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Sparkles,
  Eye,
  FastForward,
} from 'lucide-react';

interface PatternDiscoveryMatrixProps {
  activeMetric: WaterMetric;
  onSelectNode: (nodeId: number) => void;
}

export const PatternDiscoveryMatrix: React.FC<PatternDiscoveryMatrixProps> = ({
  activeMetric,
  onSelectNode,
}) => {
  const [data, setData] = useState<HeatmapMatrixResponse | null>(null);
  const [cyclicalRules, setCyclicalRules] = useState<CyclicalRule[]>([]);
  const [activeMatrix, setActiveMatrix] = useState<'month' | 'dow' | 'nth'>('nth');
  const [loading, setLoading] = useState(true);

  // Hands-on Interactive Controls
  const [activeColumnIndex, setActiveColumnIndex] = useState<number | null>(null);
  const [isTourPlaying, setIsTourPlaying] = useState<boolean>(false);
  const [tourSpeed, setTourSpeed] = useState<number>(1.5);
  const [isLaymanMode, setIsLaymanMode] = useState<boolean>(false);
  const [nodeFilter, setNodeFilter] = useState<'all' | 'upstream' | 'urban'>('all');
  const [isExplanationOpen, setIsExplanationOpen] = useState<boolean>(true);

  const metricConfig = METRIC_CONFIGS[activeMetric];

  useEffect(() => {
    setLoading(true);
    setActiveColumnIndex(null);
    setIsTourPlaying(false);
    Promise.all([
      fetch(`/api/analytics/heatmaps?metric=${activeMetric}`).then((r) => r.json()),
      fetch(`/api/analytics/cyclical?metric=${activeMetric}`).then((r) => r.json()),
    ])
      .then(([heatmapRes, cyclicalRes]) => {
        setData(heatmapRes);
        setCyclicalRules(cyclicalRes.consolidated_rules || []);
      })
      .catch((err) => console.error('Failed to load pattern matrix:', err))
      .finally(() => setLoading(false));
  }, [activeMetric]);

  // Determine active columns and rows
  let columns: string[] = [];
  let rawRows: Array<{
    node_id: number;
    node_name: string;
    river_km: number;
    values: (number | null)[];
  }> = [];

  if (data) {
    if (activeMatrix === 'month') {
      columns = data.months;
      rawRows = data.node_vs_month;
    } else if (activeMatrix === 'dow') {
      columns = data.days_of_week;
      rawRows = data.node_vs_dow;
    } else {
      columns = data.nth_weekdays;
      rawRows = data.node_vs_nth_weekday;
    }
  }

  // Filter rows based on selection
  const filteredRows = rawRows.filter((r) => {
    if (nodeFilter === 'upstream') return r.node_id <= 4;
    if (nodeFilter === 'urban') return r.node_id >= 5;
    return true;
  });

  // Tour Autoplay Loop
  useEffect(() => {
    if (!isTourPlaying || columns.length === 0) return;

    const intervalMs = Math.floor(2000 / tourSpeed);
    const timer = setInterval(() => {
      setActiveColumnIndex((prev) => {
        if (prev === null || prev + 1 >= columns.length) {
          return 0;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isTourPlaying, tourSpeed, columns.length]);

  if (loading || !data) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        Computing multi-year spatiotemporal pattern matrices...
      </div>
    );
  }

  // Column-specific contextual explanations for layman understanding
  const getColumnStory = (colName: string): { title: string; story: string; type: 'alert' | 'flush' | 'normal' } => {
    if (colName.includes('2nd Friday') || colName.includes('4th Friday')) {
      return {
        title: `🚨 Pre-Weekend Industrial Discharge Surge (${colName})`,
        story: `Notice the sharp red color shift in Rows 11 through 18! Unregulated industrial facilities along the Barapullah and Shahdara drain corridors purge chemical holding tanks before weekend regulatory monitoring closures.`,
        type: 'alert',
      };
    }
    if (colName === 'Jul' || colName === 'Aug') {
      return {
        title: `🌊 Monsoon Flood Flush Regime (${colName})`,
        story: `Notice the rows turn green or light cyan! Hathnikund Barrage releases tens of thousands of cusecs of rainwater, diluting algal blooms and washing out stagnant sewage pools.`,
        type: 'flush',
      };
    }
    if (colName === 'Dec' || colName === 'Jan') {
      return {
        title: `❄️ Winter Low-Flow Frothing Crisis (${colName})`,
        story: `With almost zero fresh water released at Wazirabad, untreated household soaps and surfactants build up. Notice the intense discoloration at Kalindi Kunj and downstream nodes.`,
        type: 'alert',
      };
    }
    if (colName === 'Sunday') {
      return {
        title: `🏙️ Weekend Domestic Sewage Volume Peak (${colName})`,
        story: `Higher household water consumption across Delhi results in elevated organic and surfactant loads in central urban drains (ISBT, Delhi Gate, Barapullah).`,
        type: 'normal',
      };
    }
    return {
      title: `📊 Normal Operating Corridor (${colName})`,
      story: `Regular baseline distribution. Observe the permanent color boundary between pristine Node 1-4 (green) and heavily contaminated Node 5-18 (orange/red).`,
      type: 'normal',
    };
  };

  const activeColName = activeColumnIndex !== null ? columns[activeColumnIndex] : null;
  const activeColStory = activeColName ? getColumnStory(activeColName) : null;

  // Convert raw value to Layman rating label
  const getLaymanBadge = (val: number | null) => {
    if (val === null) return '-';
    if (activeMetric === 'ndti_mean') {
      if (val < 0.12) return 'Clean';
      if (val < 0.30) return 'Fair';
      if (val < 0.45) return 'Murky';
      return 'Sewage';
    } else if (activeMetric === 'ndci_mean') {
      if (val < 0.05) return 'Clear';
      if (val < 0.20) return 'Algae';
      if (val < 0.32) return 'Bloom';
      return 'Severe';
    } else if (activeMetric === 'dom_ratio_mean') {
      if (val < 1.15) return 'Natural';
      if (val < 1.35) return 'Organics';
      if (val < 1.55) return 'Dye';
      return 'Foam';
    } else {
      if (val < 0.22) return 'Dry';
      if (val < 0.35) return 'Shallow';
      return 'Deep';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 backdrop-blur rounded-xl p-4 shadow-xl space-y-4">
      {/* Top Header & Matrix Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Grid className="w-5 h-5 text-cyan-400" />
              Pattern Discovery Matrix
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              Interactive Hands-On Explorer ({cyclicalRules.length} Statistical Rules)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detects weekly factory purge schedules, seasonal monsoon washouts, and spatial drain impacts across 426 satellite passes.
          </p>
        </div>

        {/* Matrix Switcher Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setActiveMatrix('nth');
              setActiveColumnIndex(null);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMatrix === 'nth'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Nth-Weekday of Month</span>
          </button>

          <button
            onClick={() => {
              setActiveMatrix('dow');
              setActiveColumnIndex(null);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMatrix === 'dow'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Day of Week</span>
          </button>

          <button
            onClick={() => {
              setActiveMatrix('month');
              setActiveColumnIndex(null);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMatrix === 'month'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Month of Year</span>
          </button>
        </div>
      </div>

      {/* Hands-on Interactive Control Bar (Play/Pause, Layman Mode, Filter) */}
      <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Play/Pause Tour Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Column Tour:</span>
          </span>

          <button
            onClick={() => setIsTourPlaying(!isTourPlaying)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-bold transition-all shadow-sm ${
              isTourPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isTourPlaying ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Pause Tour</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Play Tour</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (activeColumnIndex === null || activeColumnIndex === 0) {
                setActiveColumnIndex(columns.length - 1);
              } else {
                setActiveColumnIndex(activeColumnIndex - 1);
              }
            }}
            title="Step Back"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
          >
            <SkipBack className="w-3 h-3" />
          </button>

          <button
            onClick={() => {
              if (activeColumnIndex === null || activeColumnIndex + 1 >= columns.length) {
                setActiveColumnIndex(0);
              } else {
                setActiveColumnIndex(activeColumnIndex + 1);
              }
            }}
            title="Step Forward"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
          >
            <SkipForward className="w-3 h-3" />
          </button>

          {/* Tour Speed Selector */}
          <div className="flex items-center space-x-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px]">
            <FastForward className="w-2.5 h-2.5 text-slate-400" />
            {[1, 1.5, 3].map((spd) => (
              <button
                key={spd}
                onClick={() => setTourSpeed(spd)}
                className={`px-1 py-0.5 rounded ${
                  tourSpeed === spd ? 'bg-cyan-500/40 text-cyan-200 font-bold' : 'text-slate-400'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {activeColumnIndex !== null && (
            <button
              onClick={() => setActiveColumnIndex(null)}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline ml-1"
            >
              Reset Tour
            </button>
          )}
        </div>

        {/* Layman Mode & Reach Filters */}
        <div className="flex items-center space-x-3">
          {/* Layman Translation Toggle */}
          <button
            onClick={() => setIsLaymanMode(!isLaymanMode)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${
              isLaymanMode
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Layman Words ({isLaymanMode ? 'ON' : 'OFF'})</span>
          </button>

          {/* Node Reach Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <Filter className="w-3 h-3 text-slate-500 ml-1.5" />
            {(['all', 'upstream', 'urban'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setNodeFilter(mode)}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  nodeFilter === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'all' ? 'All 18' : mode === 'upstream' ? 'Clean Baseline (1-4)' : 'Urban Drains (5-18)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Column Tour Narrative Banner */}
      {activeColStory && (
        <div
          className={`p-3.5 rounded-xl border transition-all text-xs ${
            activeColStory.type === 'alert'
              ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
              : activeColStory.type === 'flush'
              ? 'bg-blue-950/40 border-blue-800/80 text-blue-200'
              : 'bg-slate-950/70 border-slate-700 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between font-bold mb-1">
            <span className="flex items-center gap-1.5 text-sm">
              {activeColStory.title}
            </span>
            <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 font-mono">
              Highlighted Column: {activeColName}
            </span>
          </div>
          <p className="leading-relaxed text-slate-300">{activeColStory.story}</p>
        </div>
      )}

      {/* Surfaced Statistical Rules Alert Banner (Collapsible) */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden text-xs">
        <button
          onClick={() => setIsExplanationOpen(!isExplanationOpen)}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">
              Why Are These Heatmap Colors Changing So Rapidly? (Click to {isExplanationOpen ? 'Collapse' : 'Expand'})
            </span>
          </div>
          {isExplanationOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isExplanationOpen && (
          <div className="p-3.5 pt-0 border-t border-slate-800/60 space-y-2.5 text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-rose-400 block mb-0.5">1. The 16.5 km Najafgarh Cliff</span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Rows 1 to 4 are green because they are upstream of Delhi. At Row 5, the Najafgarh drain injects 60% of Delhi&apos;s wastewater, permanently shifting subsequent rows to orange/red.
                </p>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-blue-400 block mb-0.5">2. Monsoon Dilution vs Winter Foam</span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  July and August floodwaters dilute chlorophyll and organic dyes (turning cells green/blue). December and January have zero fresh flow, producing toxic white detergent foam at Okhla.
                </p>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-amber-400 block mb-0.5">3. Alternate Friday Tank Purges</span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  On 2nd and 4th Fridays, trans-Yamuna factories systematically flush un-neutralized holding tanks before weekend inspections, triggering +1.8 SD anomalies on those columns.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2D Heatmap Grid Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 p-2">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 text-slate-400 font-medium sticky left-0 bg-slate-950/95 z-20 min-w-[170px] border-b border-slate-800">
                Monitoring Node
              </th>
              {columns.map((col, idx) => {
                const isColActive = activeColumnIndex === idx;
                return (
                  <th
                    key={idx}
                    onClick={() => setActiveColumnIndex(idx)}
                    className={`p-1.5 text-center font-medium border-b border-slate-800 min-w-[62px] cursor-pointer transition-all ${
                      isColActive
                        ? 'bg-cyan-950/80 text-cyan-300 ring-2 ring-cyan-400 rounded-t-lg font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="block text-[10px] leading-tight truncate">{col}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr
                key={row.node_id}
                onClick={() => onSelectNode(row.node_id)}
                className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
              >
                <td className="p-1.5 sticky left-0 bg-slate-950 group-hover:bg-slate-900 z-10 border-b border-slate-800/60">
                  <div className="flex items-center justify-between pr-2">
                    <span className="font-semibold text-slate-200 truncate max-w-[130px]">
                      N{row.node_id} {row.node_name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {row.river_km.toFixed(1)}km
                    </span>
                  </div>
                </td>

                {row.values.map((val, cIdx) => {
                  const hasVal = val !== null;
                  const isColActive = activeColumnIndex === cIdx;
                  const color = hasVal
                    ? getMetricColor(activeMetric, val)
                    : '#1e293b';

                  const isSpike =
                    hasVal && val > metricConfig.criticalThreshold * 1.15;

                  return (
                    <td
                      key={cIdx}
                      className={`p-1 text-center border-b border-slate-800/40 transition-colors ${
                        isColActive ? 'bg-cyan-950/30' : ''
                      }`}
                    >
                      <div
                        title={`Node ${row.node_id} (${row.node_name}) - ${columns[cIdx]}: ${
                          hasVal ? val.toFixed(4) : 'N/A'
                        }`}
                        style={{
                          backgroundColor: hasVal ? color : '#0f172a',
                          color: '#ffffff',
                        }}
                        className={`h-7 w-full rounded flex items-center justify-center font-mono text-[9px] font-bold shadow-sm transition-transform hover:scale-110 hover:z-20 hover:ring-2 hover:ring-white ${
                          isColActive ? 'ring-2 ring-cyan-300 scale-105 z-10' : ''
                        } ${isSpike ? 'ring-1 ring-rose-400 animate-pulse' : ''}`}
                      >
                        {hasVal
                          ? isLaymanMode
                            ? getLaymanBadge(val)
                            : val.toFixed(2)
                          : '-'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
        <div className="flex items-center gap-2">
          <span>Spectral Intensity:</span>
          <div className="w-36 h-2 rounded bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-600"></div>
          <span>Green (Clean) &rarr; Red (Severe Contamination)</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="w-2 h-2 rounded-full border border-cyan-400 inline-block"></span>
            Highlighted Column: Active Tour Target
          </span>
          <span className="flex items-center gap-1 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block"></span>
            Pulsing Border: Anomaly Outlier
          </span>
        </div>
      </div>
    </div>
  );
};
