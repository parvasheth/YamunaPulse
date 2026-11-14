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
import type { NodeObservation, WaterMetric, RiverId } from '../types';
import { METRIC_CONFIGS } from '../utils/metrics';
import { AlertCircle, ArrowDownRight, Compass } from 'lucide-react';

interface LongitudinalProfileChartProps {
  profile: NodeObservation[];
  activeMetric: WaterMetric;
  selectedNodeId: number | null;
  onSelectNode: (nodeId: number) => void;
  activeRiver?: RiverId;
}

export const LongitudinalProfileChart: React.FC<LongitudinalProfileChartProps> = ({
  profile,
  activeMetric,
  selectedNodeId,
  onSelectNode,
  activeRiver = 'yamuna',
}) => {
  const metricConfig = METRIC_CONFIGS[activeMetric];
  const isGanga = activeRiver === 'ganga';

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
    <div className="bg-slate-900/90 border border-slate-800 backdrop-blur rounded-xl p-3 sm:p-4 shadow-xl flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <div>
          <div className="flex items-center space-x-2 flex-wrap">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
              <span>
                {isGanga
                  ? 'Spatial Profile (Raiwala \u2192 Balawali, 34 km)'
                  : 'Spatial Profile (Palla \u2192 Asgarpur, 48 km)'}
              </span>
            </h3>
            {selectedPoint && (
              <span className="text-[10px] sm:text-xs text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60 font-medium">
                N{selectedPoint.node_id} ({selectedPoint.name})
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 hidden xs:block">
            {isGanga
              ? 'Observe water quality transitions past Har Ki Pauri ghats, Jagjeetpur STP, and SIIDCUL canal.'
              : 'Watch pollution surge at Najafgarh and Barapullah drain outfalls.'}
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] flex-shrink-0">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2.5 h-0.5 bg-rose-500 inline-block"></span>
            <span>Threshold ({metricConfig.criticalThreshold})</span>
          </span>
          <span className="flex items-center gap-1 text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
            <ArrowDownRight className="w-3 h-3" />
            <span>Key Landmarks</span>
          </span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[200px] sm:min-h-[240px]">
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
                <stop offset="5%" stopColor={isGanga ? '#10b981' : '#38bdf8'} stopOpacity={0.6} />
                <stop offset="95%" stopColor={isGanga ? '#0d9488' : '#0284c7'} stopOpacity={0.05} />
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
                value: isGanga
                  ? 'Downstream River Distance (km from Raiwala)'
                  : 'Downstream River Distance (km from Palla)',
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

            {/* River Specific Landmark & Drain Inflow Lines */}
            {isGanga ? (
              <>
                <ReferenceLine x={5.4} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: 'Har Ki Pauri (km 5.4)', fill: '#22d3ee', fontSize: 10, position: 'top' }} />
                <ReferenceLine x={8.1} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Kassaban (km 8.1)', fill: '#fb923c', fontSize: 10, position: 'top' }} />
                <ReferenceLine x={14.2} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Jagjeetpur STP (km 14.2)', fill: '#fb7185', fontSize: 10, position: 'top' }} />
                <ReferenceLine x={19.2} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'SIIDCUL (km 19.2)', fill: '#fb923c', fontSize: 10, position: 'top' }} />
                <ReferenceLine x={28.5} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Laksar Sugar (km 28.5)', fill: '#fde047', fontSize: 10, position: 'top' }} />
              </>
            ) : (
              <>
                <ReferenceLine x={16.5} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Najafgarh (km 16.5)', fill: '#fb7185', fontSize: 10, position: 'top' }} />
                <ReferenceLine x={26.5} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Delhi Gate (km 26.5)', fill: '#fb923c', fontSize: 10, position: 'top' }} />
                <ReferenceLine x={30.5} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Barapullah (km 30.5)', fill: '#fb923c', fontSize: 10, position: 'top' }} />
                <ReferenceLine x={40.0} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Shahdara (km 40.0)', fill: '#fb923c', fontSize: 10, position: 'top' }} />
              </>
            )}

            {/* Active profile area */}
            <Area
              type="monotone"
              dataKey="value"
              stroke={isGanga ? '#10b981' : '#38bdf8'}
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
