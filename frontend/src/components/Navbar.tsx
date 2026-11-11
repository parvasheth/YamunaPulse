import React from 'react';
import type { WaterMetric } from '../types';
import { METRIC_CONFIGS } from '../utils/metrics';
import { Activity, Satellite, Waves, Grid, Sparkles, Calendar, BookOpen, Users, Share2 } from 'lucide-react';

interface NavbarProps {
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
  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand, Creator Attribution & Status */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
            <Waves className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                YamunaPulse
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                Delhi 48 km
              </span>
              {/* Creator Attribution Badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm">
                <span className="text-slate-400">Created by</span>
                <span className="font-bold text-amber-200">Parva Sheth</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Satellite className="w-3 h-3 text-cyan-400" />
              <span>Sentinel-2 L2A &bull; 18 Nodes (Palla to Asgarpur) &bull; {passCount} passes</span>
            </p>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('monitor')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'monitor'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Map & Timelapse</span>
          </button>

          <button
            onClick={() => onTabChange('patterns')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'insights'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Anomaly Feed</span>
          </button>
        </nav>

        {/* Right Section: Visitor Counter, Share, Auto-Sync, Guide & Metric Selector */}
        <div className="flex items-center space-x-2 flex-wrap">
          {/* Visitor Counter */}
          <div 
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 text-slate-300 border border-slate-700/80 text-xs font-medium shadow-sm"
            title="Total portal visitors logged in analytical database"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 hidden md:inline">Visitors:</span>
            <span className="font-bold text-indigo-200 font-mono">
              {visitorCount !== null ? visitorCount.toLocaleString() : '...'}
            </span>
          </div>

          {/* Share & Publish Button */}
          <button
            onClick={onOpenShare}
            title="Get public published shareable link to send to people"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 text-blue-300 border border-blue-500/40 text-xs font-medium transition-all shadow-sm group"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Share Link</span>
          </button>

          {/* Live Orbit Auto-Sync Button */}
          <button
            onClick={onOpenSync}
            title="Continuous Sentinel-2 orbital ingestion (Every 5 days). Click to check status or trigger manual STAC sync."
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-medium transition-all shadow-sm group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="group-hover:text-cyan-300">5d Orbit Sync</span>
          </button>

          {/* Glossary / Layman Guide Trigger */}
          <button
            onClick={onOpenGlossary}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 hover:from-emerald-600/50 hover:to-cyan-600/50 text-emerald-300 border border-emerald-500/50 text-xs font-bold transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>📖 Guide & Terms</span>
          </button>

          {/* Metric Selector Buttons */}
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {(Object.keys(METRIC_CONFIGS) as WaterMetric[]).map((mKey) => {
              const cfg = METRIC_CONFIGS[mKey];
              const isSelected = activeMetric === mKey;
              return (
                <button
                  key={mKey}
                  onClick={() => onMetricChange(mKey)}
                  title={`${cfg.name}: ${cfg.formula} - ${cfg.description}`}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  {cfg.shortName}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
