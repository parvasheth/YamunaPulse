import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { MonitoringNode, WaterMetric, RiverId } from '../types';
import { METRIC_CONFIGS } from '../utils/metrics';
import { X, MapPin, AlertTriangle, TrendingUp } from 'lucide-react';

interface NodeInspectorModalProps {
  nodeId: number | null;
  onClose: () => void;
  activeMetric: WaterMetric;
  nodes: MonitoringNode[];
  river?: RiverId;
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  nodeId,
  onClose,
  activeMetric,
  nodes,
  river = 'yamuna',
}) => {
  const [timeseriesData, setTimeseriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const metricConfig = METRIC_CONFIGS[activeMetric];

  const node = nodes.find((n) => n.node_id === nodeId);

  useEffect(() => {
    if (!nodeId) return;
    setLoading(true);
    fetch(`/api/timeseries?river=${river}&node_id=${nodeId}&metric=${activeMetric}`)
      .then((r) => r.json())
      .then((res) => {
        const formatted = (res.data || []).map((pt: any) => ({
          date: pt.timestamp.split('T')[0],
          value: parseFloat(pt.value.toFixed(4)),
          season: pt.season,
          day: pt.day_of_week,
          nth: pt.nth_weekday_of_month,
        }));
        setTimeseriesData(formatted);
      })
      .catch((err) => console.error('Failed to load node timeseries:', err))
      .finally(() => setLoading(false));
  }, [nodeId, activeMetric, river]);

  if (!nodeId || !node) return null;

  // Compute local stats
  const values = timeseriesData.map((d) => d.value);
  const meanVal = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const maxVal = values.length ? Math.max(...values) : 0;
  const minVal = values.length ? Math.min(...values) : 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-4 p-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm">
              N{node.node_id}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">{node.name}</h3>
                <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                  km {node.river_km.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">({node.segment})</span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {node.latitude.toFixed(4)}°N, {node.longitude.toFixed(4)}°E
                </span>
                {node.drain_inflow && (
                  <span className="text-amber-400 font-semibold flex items-center gap-1 bg-amber-950/80 px-2 py-0.2 rounded border border-amber-800/80 text-[10px]">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Inflow: {node.drain_inflow} ({node.drain_impact_tier.toUpperCase()})
                  </span>
                )}
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

        {/* Node Description & Summary Cards */}
        <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          {node.description}
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block">5-Year Historical Mean</span>
            <span className="text-base font-bold text-cyan-400">{meanVal.toFixed(4)}</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Peak Anomaly Surge</span>
            <span className="text-base font-bold text-rose-400">{maxVal.toFixed(4)}</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Baseline Trough</span>
            <span className="text-base font-bold text-emerald-400">{minVal.toFixed(4)}</span>
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="flex-1 min-h-[260px] bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Multi-Year Pass Series (2021-2026): {metricConfig.shortName}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {timeseriesData.length} Satellite Passes
            </span>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
              Loading pass trajectory...
            </div>
          ) : (
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={timeseriesData} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    domain={[metricConfig.min, metricConfig.max]}
                    tickFormatter={(v) => v.toFixed(2)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <ReferenceLine
                    y={metricConfig.criticalThreshold}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#38bdf8"
                    strokeWidth={1.8}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 5 Scientific Quality Assurance Verification Pillars */}
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Quality Assurance & Remote-Sensing Validation
            </span>
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
              Sentinel-2 L2A (BOA)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-lg">
              <span className="font-semibold text-cyan-300 block mb-0.5">1. Dynamic Water Masking (MNDWI)</span>
              <p className="text-slate-400 leading-snug">
                Applies per-pass MNDWI & NDWI (&gt;0.15) segmentation. Excludes dry sandbars, exposed mudflats, and riparian weeds.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-lg">
              <span className="font-semibold text-emerald-300 block mb-0.5">2. Surface Reflectance & SCL Glint Filter</span>
              <p className="text-slate-400 leading-snug">
                Sen2Cor L2A atmospherically corrected BOA data with cloud/shadow (SCL 3,8,9,10) and specular sun-glint masking.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-lg">
              <span className="font-semibold text-amber-300 block mb-0.5">3. Clean Channel Geometry</span>
              <p className="text-slate-400 leading-snug">
                150m mid-channel sampling box offset 150m–300m away from road/rail bridge decks and weir turbulence to prevent asphalt/steel bias.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-lg">
              <span className="font-semibold text-purple-300 block mb-0.5">4. Seasonal Baseline & Algae Cross-Check</span>
              <p className="text-slate-400 leading-snug">
                Anomalies calculated via Seasonal ΔNDTI vs historical same-season baseline, paired with NDCI to catch chlorophyll-masked blooms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
