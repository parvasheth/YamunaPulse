import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import type { NodeObservation, WaterMetric } from '../types';
import { METRIC_CONFIGS } from '../utils/metrics';
import { AlertCircle, ArrowDownRight, Compass } from 'lucide-react';

interface LongitudinalProfileChartProps {
  profile: NodeObservation[];
  activeMetric: WaterMetric;
  selectedNodeId: number | null;
  onSelectNode: (nodeId: number) => void;
}

export const LongitudinalProfileChart: React.FC<LongitudinalProfileChartProps> = ({
  profile,
  activeMetric,
  selectedNodeId,
  onSelectNode,
}) => {
  const metricConfig = METRIC_CONFIGS[activeMetric];

  const chartData = profile.map((obs) => {
    const val = (obs as any)[activeMetric] ?? 0;
    return {
      node_id: obs.node_id,
      name: obs.name,
      river_km: parseFloat(obs.river_km.toFixed(1)),
      value: parseFloat(val.toFixed(4)),
      drain_inflow: obs.drain_inflow,
      drain_impact_tier: obs.drain_impact_tier,
      active_water_pixels: obs.active_water_pixels,
      total_pixels: obs.total_pixels,
      segment: obs.segment,
    };
  });

  const selectedPoint = chartData.find((d) => d.node_id === selectedNodeId);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700/90 rounded-lg p-3 shadow-2xl text-xs text-white max-w-xs">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1.5">
            <span className="font-bold text-cyan-400">
              Node {data.node_id}: {data.name}
            </span>
            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
              km {data.river_km}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">{metricConfig.shortName}:</span>
              <span className="font-bold text-emerald-400">{data.value}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Water Channel Pixels:</span>
              <span className="font-medium text-slate-200">
                {data.active_water_pixels} / {data.total_pixels}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">River Reach:</span>
              <span className="text-slate-300">{data.segment}</span>
            </div>
            {data.drain_inflow && (
              <div className="mt-1 pt-1 border-t border-slate-800 text-amber-300 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span>Inflow: {data.drain_inflow}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 backdrop-blur rounded-xl p-4 shadow-xl flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              Longitudinal Spatial Cascade Profile
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              (Node 1 Palla &rarr; Node 18 Asgarpur)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized with active satellite pass. Watch pollution jump at drain outfalls.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2.5 h-0.5 bg-rose-500 inline-block"></span>
            Critical Threshold ({metricConfig.criticalThreshold})
          </span>
          <span className="flex items-center gap-1 text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
            <ArrowDownRight className="w-3 h-3" />
            Drain Breakpoints
          </span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload.length) {
                onSelectNode(e.activePayload[0].payload.node_id);
              }
            }}
          >
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="river_km"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              unit=" km"
              label={{
                value: 'Downstream River Distance (km from Palla)',
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
              tickLine={false}
              tickFormatter={(v) => v.toFixed(2)}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Critical threshold reference line */}
            <ReferenceLine
              y={metricConfig.criticalThreshold}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            {/* Major Drain Inflows Reference Lines */}
            <ReferenceLine x={16.5} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Najafgarh (km 16.5)', fill: '#fb923c', fontSize: 10, position: 'top' }} />
            <ReferenceLine x={26.5} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Delhi Gate (km 26.5)', fill: '#fb923c', fontSize: 10, position: 'top' }} />
            <ReferenceLine x={30.5} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Barapullah (km 30.5)', fill: '#fb923c', fontSize: 10, position: 'top' }} />
            <ReferenceLine x={40.0} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Shahdara (km 40.0)', fill: '#fb923c', fontSize: 10, position: 'top' }} />

            {/* Active profile area */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#38bdf8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#metricGradient)"
            />

            {/* Selected Node Reference Dot */}
            {selectedPoint && (
              <ReferenceDot
                x={selectedPoint.river_km}
                y={selectedPoint.value}
                r={6}
                fill="#ec4899"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
