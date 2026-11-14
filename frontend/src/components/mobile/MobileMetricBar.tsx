import React from 'react';
import type { WaterMetric } from '../../types';
import { METRIC_CONFIGS } from '../../utils/metrics';

interface MobileMetricBarProps {
  activeMetric: WaterMetric;
  onMetricChange: (metric: WaterMetric) => void;
}

export const MobileMetricBar: React.FC<MobileMetricBarProps> = ({
  activeMetric,
  onMetricChange,
}) => {
  const currentConfig = METRIC_CONFIGS[activeMetric];

  return (
    <div className="bg-slate-950/90 border-b border-slate-800/80 px-3 py-1.5 flex flex-col gap-1">
      {/* Horizontal Scrollable Metric Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
        {(Object.keys(METRIC_CONFIGS) as WaterMetric[]).map((mKey) => {
          const cfg = METRIC_CONFIGS[mKey];
          const isSelected = activeMetric === mKey;
          return (
            <button
              key={mKey}
              onClick={() => onMetricChange(mKey)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all active:scale-95 ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              <span>{cfg.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Layman Sub-indicator */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
        <span className="truncate">
          <strong className="text-cyan-400">{currentConfig.name}:</strong>{' '}
          {activeMetric === 'ndti_mean' && 'Suspended silt & municipal sewage outfalls.'}
          {activeMetric === 'ndci_mean' && 'Algal blooms & rotting organic matter (Red-Edge).'}
          {activeMetric === 'dom_ratio_mean' && 'Industrial textile dyes & toxic foam precursors.'}
          {activeMetric === 'ndwi_mean' && 'Active water flow surface vs sand shoals.'}
        </span>
      </div>
    </div>
  );
};

