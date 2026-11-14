import React from 'react';
import type { WaterMetric, RiverId } from '../types';
import { METRIC_CONFIGS } from '../utils/metrics';
import { RiverSwitcher } from './RiverSwitcher';
import { Activity, Satellite, Waves, Grid, Sparkles, Calendar, BookOpen, Users, Share2, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeRiver: RiverId;
  onRiverChange: (river: RiverId) => void;
  activeMetric: WaterMetric;
  onMetricChange: (metric: WaterMetric) => void;
  activeTab: 'monitor' | 'patterns' | 'seasonal' | 'insights';
  onTabChange: (tab: 'monitor' | 'patterns' | 'seasonal' | 'insights') => void;
  passCount: number;
  visitorCount: number | null;
  onOpenGlossary: () => void;
  onOpenSync: () => void;
  onOpenShare: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRiver,
  onRiverChange,
  activeMetric,
  onMetricChange,
  activeTab,
  onTabChange,
  passCount,
  visitorCount,
  onOpenGlossary,
  onOpenSync,
  onOpenShare,
}) => {
  const isGanga = activeRiver === 'ganga';

  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col gap-2">
        {/* Row 1: Brand & Project Name, River Switcher, and Quick Action Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Brand, Project Name & Author */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className={`relative flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-md ${
              isGanga
                ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-600 shadow-emerald-500/20'
                : 'bg-gradient-to-tr from-cyan-600 via-blue-500 to-indigo-600 shadow-cyan-500/20'
            }`}>
              <Waves className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
              </span>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center space-x-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent whitespace-nowrap flex-shrink-0">
                  YamunaPulse
                </h1>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 whitespace-nowrap border ${
                  isGanga
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                }`}>
                  {isGanga ? 'Haridwar 34 km' : 'Delhi 48 km'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm flex-shrink-0 whitespace-nowrap">
                  <span className="text-slate-400 hidden xs:inline">By</span>
                  <span className="font-bold text-amber-200">Parva Sheth</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 whitespace-nowrap mt-0.5">
                <Satellite className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>
                  Sentinel-2 L2A &bull; {isGanga ? '14 Nodes (Raiwala to Balawali)' : '18 Nodes (Palla to Asgarpur)'} &bull; {passCount} passes
                </span>
              </p>
            </div>
          </div>

          {/* Right Header Controls: River Switcher & Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Prominent River Corridor Switcher */}
            <RiverSwitcher activeRiver={activeRiver} onChange={onRiverChange} />

            {/* Quick Actions (Visitors, Share, Orbit Sync, Guide) */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {/* Visitor Counter */}
              <div 
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 text-slate-300 border border-slate-700/80 text-xs font-medium shadow-sm whitespace-nowrap"
                title="Total portal visitors logged in analytical database"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="text-slate-400 hidden xl:inline">Visitors:</span>
                <span className="font-bold text-indigo-200 font-mono">
                  {visitorCount !== null ? visitorCount.toLocaleString() : '1'}
                </span>
              </div>

              {/* Share & Publish Button */}
              <button
                onClick={onOpenShare}
                title="Get public published shareable link to send to people"
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 text-blue-300 border border-blue-500/40 text-xs font-medium transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Share</span>
              </button>

              {/* Live Orbit Auto-Sync Button */}
              <button
                onClick={onOpenSync}
                title="Continuous Sentinel-2 orbital ingestion (Every 5 days)"
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-medium transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Sync</span>
              </button>

              {/* Glossary / Layman Guide Trigger */}
              <button
                onClick={onOpenGlossary}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 hover:from-emerald-600/50 hover:to-cyan-600/50 text-emerald-300 border border-emerald-500/50 text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Guide</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Desktop Navigation Tabs & Spectral Metric Selection Bar */}
        <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-slate-800/80 flex-wrap">
          {/* Desktop Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex-shrink-0">
            <button
              onClick={() => onTabChange('monitor')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'monitor'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Map &amp; Timelapse</span>
            </button>

            <button
              onClick={() => onTabChange('patterns')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'patterns'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Pattern Matrix</span>
            </button>

            <button
              onClick={() => onTabChange('seasonal')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'seasonal'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Seasonal Engine</span>
            </button>

            <button
              onClick={() => onTabChange('insights')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'insights'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Anomaly Feed</span>
            </button>
          </nav>

          {/* Metric Selector Chips & Satellite Status */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-0.5 flex-shrink-0 flex items-center gap-1">
              <span>Metric:</span>
            </span>
            {(Object.keys(METRIC_CONFIGS) as WaterMetric[]).map((mKey) => {
              const cfg = METRIC_CONFIGS[mKey];
              const isSelected = activeMetric === mKey;
              return (
                <button
                  key={mKey}
                  onClick={() => onMetricChange(mKey)}
                  title={`${cfg.name}: ${cfg.formula} - ${cfg.description}`}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800/80'
                  }`}
                >
                  <span>{cfg.shortName}</span>
                </button>
              );
            })}

            {/* Satellite Orbit Status Badge */}
            <div className="hidden xl:flex items-center space-x-1 text-[11px] text-slate-400 flex-shrink-0 pl-2">
              <span className="flex items-center gap-1 text-emerald-400 whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sentinel-2 5d Revisit Active</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
