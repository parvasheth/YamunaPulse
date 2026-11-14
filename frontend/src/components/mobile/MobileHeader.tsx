import React from 'react';
import type { RiverId } from '../../types';
import { RiverSwitcher } from '../RiverSwitcher';
import { Waves, Sparkles, BookOpen, Share2, Satellite, Users } from 'lucide-react';

interface MobileHeaderProps {
  activeRiver: RiverId;
  onRiverChange: (river: RiverId) => void;
  visitorCount: number | null;
  onOpenGuide: () => void;
  onOpenSync: () => void;
  onOpenShare: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeRiver,
  onRiverChange,
  visitorCount,
  onOpenGuide,
  onOpenSync,
  onOpenShare,
}) => {
  const isGanga = activeRiver === 'ganga';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2 text-white flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        {/* Brand & Creator */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className={`relative flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl shadow-md ${
            isGanga
              ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-600 shadow-emerald-500/20'
              : 'bg-gradient-to-tr from-cyan-600 via-blue-500 to-indigo-600 shadow-cyan-500/20'
          }`}>
            <Waves className="w-4 h-4 text-white" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <h1 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent whitespace-nowrap">
                YamunaPulse
              </h1>
              <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-full flex-shrink-0 whitespace-nowrap border ${
                isGanga
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                  : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
              }`}>
                {isGanga ? 'Haridwar 34km' : 'Delhi 48km'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-amber-300 font-medium whitespace-nowrap">
              <Sparkles className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
              <span>Created by Parva Sheth</span>
            </div>
          </div>
        </div>

        {/* Quick Action Icons */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
          {/* Visitor Counter Badge */}
          <div 
            className="flex items-center space-x-1 px-1.5 py-1 rounded-lg bg-slate-950/80 text-slate-300 border border-slate-800 text-[10px] font-mono whitespace-nowrap"
            title="Total portal visitors"
          >
            <Users className="w-3 h-3 text-indigo-400" />
            <span className="text-indigo-200 font-semibold">{visitorCount !== null ? visitorCount.toLocaleString() : '1'}</span>
          </div>

          {/* Field Guide */}
          <button
            data-testid="header-guide-btn"
            onClick={onOpenGuide}
            title="Field Guide & Science"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* 5-Day Orbit Sync */}
          <button
            data-testid="header-sync-btn"
            onClick={onOpenSync}
            title="Satellite Ingestion Status"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors active:scale-95"
          >
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Share Link */}
          <button
            data-testid="header-share-btn"
            onClick={onOpenShare}
            title="Share Public Link"
            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-semibold shadow-md shadow-blue-500/20 active:scale-95 transition-all whitespace-nowrap"
          >
            <Share2 className="w-3 h-3" />
            <span className="hidden xs:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Prominent River Corridor Switcher for Mobile */}
      <div className="w-full">
        <RiverSwitcher activeRiver={activeRiver} onChange={onRiverChange} compact={true} />
      </div>
    </header>
  );
};
