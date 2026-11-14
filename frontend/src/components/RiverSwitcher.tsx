import React from 'react';
import type { RiverId } from '../types';
import { RIVER_CONFIGS } from '../types';

interface RiverSwitcherProps {
  activeRiver: RiverId;
  onChange: (river: RiverId) => void;
  compact?: boolean;
}

export const RiverSwitcher: React.FC<RiverSwitcherProps> = ({
  activeRiver,
  onChange,
  compact = false,
}) => {
  const rivers: RiverId[] = ['yamuna', 'ganga'];

  return (
    <div
      role="tablist"
      aria-label="Select river corridor"
      className={`inline-flex items-center rounded-xl bg-slate-900/90 p-1 border border-slate-700/60 shadow-lg backdrop-blur-md transition-all ${
        compact ? 'w-full max-w-sm justify-between text-xs' : 'text-sm'
      }`}
    >
      {rivers.map((rivId) => {
        const config = RIVER_CONFIGS[rivId];
        const isActive = activeRiver === rivId;

        return (
          <button
            key={rivId}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(rivId)}
            className={`relative flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              compact
                ? 'flex-1 py-1.5 px-2 text-xs'
                : 'px-3.5 py-1.5'
            } ${
              isActive
                ? rivId === 'yamuna'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="text-base leading-none">{config.icon}</span>
            <div className="flex flex-col text-left leading-tight">
              <span className="font-semibold tracking-wide">
                {compact ? (rivId === 'yamuna' ? 'Yamuna' : 'Ganga') : config.name}
              </span>
              <span
                className={`text-[10px] ${
                  isActive ? 'text-white/80' : 'text-slate-500'
                }`}
              >
                {compact ? (rivId === 'yamuna' ? 'Delhi 48km' : 'Haridwar 34km') : config.corridor}
              </span>
            </div>

            {isActive && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
};
