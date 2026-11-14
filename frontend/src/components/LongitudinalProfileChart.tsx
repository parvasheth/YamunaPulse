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
import { METRIC_CONFIGS, formatLocationLabel } from '../utils/metrics';
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
    const location_label = formatLocationLabel(obs.name, obs.river_km);
    return {
      node_id: obs.node_id,
      name: obs.name,
      location_label,
      river_km: parseFloat(obs.river_km.toFixed(1)),
      value: parseFloat(val.toFixed(4)),
      drain_inflow: obs.drain_inflow,
      drain_impact_tier: obs.drain_impact_tier,
      active_water_pixels: obs.active_water_pixels,
      total_pixels: obs.total_pixels,
      segment: obs.segment,
      seasonal_baseline_mean: obs.seasonal_baseline_mean,
      seasonal_delta_ndti: obs.seasonal_delta_ndti,
      seasonal_z_score: obs.seasonal_z_score,
      algae_cross_check: obs.algae_cross_check,
      water_mask: obs.water_mask,
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
            {data.seasonal_delta_ndti !== undefined && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Seasonal ΔNDTI:</span>
                <span className={`font-mono font-bold ${data.seasonal_delta_ndti > 0.04 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {data.seasonal_delta_ndti > 0 ? `+${data.seasonal_delta_ndti}` : data.seasonal_delta_ndti} ({data.seasonal_z_score > 0 ? `+${data.seasonal_z_score}` : data.seasonal_z_score}σ)
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Dynamic Water Mask:</span>
              <span className="font-medium text-slate-200">
                {data.active_water_pixels} / {data.total_pixels} px (MNDWI)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">River Reach:</span>
              <span className="text-slate-300">{data.segment}</span>
            </div>
            {data.algae_cross_check && (
              <div className="mt-1 pt-1 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Algae Cross-Check:</span>
                <span className={`px-1.5 py-0.5 rounded font-semibold ${
                  data.algae_cross_check.status === 'ALGAE_MASKED'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : data.algae_cross_check.status === 'COMBINED_SEWAGE'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : data.algae_cross_check.status === 'MINERAL_SEDIMENT'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {data.algae_cross_check.label}
                </span>
              </div>
            )}
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

      <div className="w-full h-[280px] sm:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
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
              dataKey="location_label"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={75}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
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

            {/* River Specific Landmark & Drain Inflow Guide Lines */}
            {isGanga ? (
              <>
                <ReferenceLine x="Har Ki Pauri (5.4km)" stroke="#06b6d4" strokeDasharray="3 3" />
                <ReferenceLine x="Kassaban (8.1km)" stroke="#f97316" strokeDasharray="3 3" />
                <ReferenceLine x="Jagjeetpur STP (14.2km)" stroke="#f43f5e" strokeDasharray="3 3" />
                <ReferenceLine x="SIIDCUL (19.2km)" stroke="#f97316" strokeDasharray="3 3" />
                <ReferenceLine x="Laksar (28.5km)" stroke="#eab308" strokeDasharray="3 3" />
              </>
            ) : (
              <>
                <ReferenceLine x="Najafgarh (16.5km)" stroke="#f43f5e" strokeDasharray="3 3" />
                <ReferenceLine x="Delhi Gate (26.5km)" stroke="#f97316" strokeDasharray="3 3" />
                <ReferenceLine x="Barapullah (30.5km)" stroke="#f97316" strokeDasharray="3 3" />
                <ReferenceLine x="Shahdara / Asgarpur (48km)" stroke="#f97316" strokeDasharray="3 3" />
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
                x={selectedPoint.location_label}
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
