import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { SeasonalResponse, WaterMetric } from '../types';
import { METRIC_CONFIGS } from '../utils/metrics';
import { Calendar, Sun, CloudRain, Wind, Snowflake } from 'lucide-react';

interface SeasonalComparatorProps {
  activeMetric: WaterMetric;
  onSelectNode: (nodeId: number) => void;
}

export const SeasonalComparator: React.FC<SeasonalComparatorProps> = ({
  activeMetric,
  onSelectNode,
}) => {
  const [data, setData] = useState<SeasonalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const metricConfig = METRIC_CONFIGS[activeMetric];

  useEffect(() => {
    fetch('/api/analytics/seasonal')
      .then((r) => r.json())
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load seasonal data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        Aggregating multi-year seasonal dynamics...
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.nodes.map((node) => {
    const sData = node.seasonal_data;
    return {
      node_id: node.node_id,
      name: node.name,
      river_km: parseFloat(node.river_km.toFixed(1)),
      drain_inflow: node.drain_inflow,
      pre_monsoon: sData['Pre-Monsoon'] ? (sData['Pre-Monsoon'] as any)[activeMetric] : null,
      monsoon: sData['Monsoon'] ? (sData['Monsoon'] as any)[activeMetric] : null,
      post_monsoon: sData['Post-Monsoon'] ? (sData['Post-Monsoon'] as any)[activeMetric] : null,
      winter: sData['Winter'] ? (sData['Winter'] as any)[activeMetric] : null,
    };
  });

  const seasonalCards = [
    {
      name: 'Pre-Monsoon',
      months: 'Mar - May',
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      color: '#f59e0b',
      theme: 'border-amber-800/60 bg-amber-950/20 text-amber-300',
      summary: 'High temperatures (>40°C) and sluggish flow trigger intense algal blooms (NDCI peak).',
    },
    {
      name: 'Monsoon',
      months: 'Jun - Aug',
      icon: <CloudRain className="w-4 h-4 text-blue-400" />,
      color: '#3b82f6',
      theme: 'border-blue-800/60 bg-blue-950/20 text-blue-300',
      summary: 'Hathnikund flood flush dilutes dissolved organics, but brings heavy mineral silt runoff.',
    },
    {
      name: 'Post-Monsoon',
      months: 'Sep - Nov',
      icon: <Wind className="w-4 h-4 text-emerald-400" />,
      color: '#10b981',
      theme: 'border-emerald-800/60 bg-emerald-950/20 text-emerald-300',
      summary: 'Receding floodwaters leave nutrient pools. Religious festival immersions increase organics.',
    },
    {
      name: 'Winter',
      months: 'Dec - Feb',
      icon: <Snowflake className="w-4 h-4 text-cyan-400" />,
      color: '#06b6d4',
      theme: 'border-cyan-800/60 bg-cyan-950/20 text-cyan-300',
      summary: 'Near-zero fresh flow release at Wazirabad. Severe toxic frothing at Kalindi Kunj.',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 backdrop-blur rounded-xl p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Seasonal Hydrodynamic Engine
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              Comparative Longitudinal Analysis
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Contrasts wet monsoon flushing dynamics against dry winter toxic froth accumulation along the 48km river line.
          </p>
        </div>
      </div>

      {/* 4 Season Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {seasonalCards.map((sc, idx) => (
          <div key={idx} className={`p-3 rounded-xl border ${sc.theme} space-y-1.5`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-bold">
                {sc.icon}
                <span>{sc.name}</span>
              </div>
              <span className="text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded font-mono text-slate-400">
                {sc.months}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">{sc.summary}</p>
          </div>
        ))}
      </div>

      {/* Recharts Longitudinal Line Comparison */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
        <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
          <span>
            Longitudinal Profile by Season: <span className="text-cyan-400">{metricConfig.shortName}</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Palla (km 0) &rarr; Asgarpur (km 48)</span>
        </h4>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 25, left: -10, bottom: 20 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  onSelectNode(e.activePayload[0].payload.node_id);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="river_km"
                stroke="#64748b"
                fontSize={11}
                unit=" km"
                label={{
                  value: 'River Distance (km)',
                  position: 'insideBottom',
                  offset: -10,
                  fill: '#94a3b8',
                  fontSize: 11,
                }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
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
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }} />

              {/* Major Drain Inflows Reference Lines */}
              <ReferenceLine x={16.5} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Najafgarh', fill: '#fb923c', fontSize: 10, position: 'top' }} />
              <ReferenceLine x={26.5} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Delhi Gate', fill: '#fb923c', fontSize: 10, position: 'top' }} />
              <ReferenceLine x={40.0} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Shahdara', fill: '#fb923c', fontSize: 10, position: 'top' }} />

              <Line
                type="monotone"
                dataKey="pre_monsoon"
                name="Pre-Monsoon"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="monsoon"
                name="Monsoon (Dilution Flush)"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="post_monsoon"
                name="Post-Monsoon"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="winter"
                name="Winter (Froth Peak)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
