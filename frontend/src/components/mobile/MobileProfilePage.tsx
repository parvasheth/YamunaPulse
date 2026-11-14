import React from 'react';
import type { NodeObservation, SatellitePass, WaterMetric, RiverId } from '../../types';
import { LongitudinalProfileChart } from '../LongitudinalProfileChart';
import { TimelineScrubber } from '../TimelineScrubber';
import { Compass, ArrowRight } from 'lucide-react';

interface MobileProfilePageProps {
  activeRiver?: RiverId;
  profile: NodeObservation[];
  passes: SatellitePass[];
  currentPassIndex: number;
  onPassIndexChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  selectedNodeId: number | null;
  onSelectNode: (nodeId: number) => void;
  activeMetric: WaterMetric;
  onOpenInspector: (nodeId: number) => void;
}

export const MobileProfilePage: React.FC<MobileProfilePageProps> = ({
  activeRiver = 'yamuna',
  profile,
  passes,
  currentPassIndex,
  onPassIndexChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSpeedChange,
  selectedNodeId,
  onSelectNode,
  activeMetric,
  onOpenInspector,
}) => {
  const isGanga = activeRiver === 'ganga';

  // Entry, Breakpoint, and Exit observations
  const entryObs = profile.find((o) => o.river_km === 0);
  const breakpointObs = isGanga
    ? profile.find((o) => o.drain_inflow && o.drain_inflow.includes('Jagjeetpur')) || profile.find((o) => o.node_id === 109)
    : profile.find((o) => o.drain_inflow && o.drain_inflow.includes('Najafgarh')) || profile.find((o) => o.node_id === 5);
  const exitObs = profile[profile.length - 1];

  const entryVal = entryObs ? ((entryObs as any)[activeMetric] ?? 0) : 0;
  const bpVal = breakpointObs ? ((breakpointObs as any)[activeMetric] ?? 0) : 0;
  const exitVal = exitObs ? ((exitObs as any)[activeMetric] ?? 0) : 0;

  const spikeJumpPct = entryVal > 0 ? Math.round(((bpVal - entryVal) / entryVal) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 p-3 max-w-full pb-20 animate-in fade-in">
      {/* Page Title & Context */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>{isGanga ? '34 km Ganga Cascade Profile' : '48 km Yamuna Cascade Profile'}</span>
          </h2>
          <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded-full">
            {profile.length} Stations
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          {isGanga
            ? 'Continuous water quality profile from Raiwala Shivalik entry (km 0.0) downstream to Balawali exit (km 34.0).'
            : 'Continuous pollution profile from Palla entry (km 0.0) downstream to Asgarpur exit (km 48.0).'}
        </p>
      </div>

      {/* Longitudinal Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-xl min-h-[300px]">
        <LongitudinalProfileChart
          profile={profile}
          activeMetric={activeMetric}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          activeRiver={activeRiver}
        />
      </div>

      {/* Timeline Scrubber & Animation Controls */}
      <TimelineScrubber
        passes={passes}
        currentIndex={currentPassIndex}
        onIndexChange={onPassIndexChange}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        playbackSpeed={playbackSpeed}
        onSpeedChange={onSpeedChange}
      />

      {/* Upstream vs Downstream Breakdown Cards */}
      <div className="grid grid-cols-3 gap-2">
        {/* Entry */}
        <div 
          onClick={() => entryObs && onSelectNode(entryObs.node_id)}
          className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="text-[10px] text-slate-400 font-medium truncate">
            {isGanga ? 'Entry (Raiwala)' : 'Entry (Palla)'}
          </div>
          <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
            {entryVal.toFixed(3)}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">km 0.0 (Clean)</div>
        </div>

        {/* Major Breakpoint */}
        <div 
          onClick={() => breakpointObs && onSelectNode(breakpointObs.node_id)}
          className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-2.5 cursor-pointer hover:border-amber-700/60 transition-colors"
        >
          <div className="text-[10px] text-amber-300 font-medium truncate">
            {isGanga ? 'Jagjeetpur STP' : 'Najafgarh Drain'}
          </div>
          <div className="text-xs font-bold text-rose-400 font-mono mt-0.5">
            {bpVal.toFixed(3)}
          </div>
          <div className="text-[9px] text-rose-300 font-bold mt-0.5">
            +{spikeJumpPct}% Jump
          </div>
        </div>

        {/* Exit */}
        <div 
          onClick={() => exitObs && onSelectNode(exitObs.node_id)}
          className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="text-[10px] text-slate-400 font-medium truncate">
            {isGanga ? 'Exit (Balawali)' : 'Exit (Asgarpur)'}
          </div>
          <div className="text-xs font-bold text-orange-400 font-mono mt-0.5">
            {exitVal.toFixed(3)}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            km {exitObs ? exitObs.river_km.toFixed(1) : (isGanga ? '34.0' : '48.0')} (Exit)
          </div>
        </div>
      </div>

      {/* Selected Node Inspector Action Banner */}
      {selectedNodeId && (
        <div className="bg-slate-900 border border-cyan-800/60 rounded-xl p-3 flex items-center justify-between gap-2 shadow-lg">
          <div>
            <div className="text-xs font-bold text-cyan-300">
              Station Node {selectedNodeId} Selected
            </div>
            <div className="text-[10px] text-slate-400">
              Tap below to inspect multi-year time-series & spectral signatures.
            </div>
          </div>
          <button
            onClick={() => onOpenInspector(selectedNodeId)}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all flex-shrink-0"
          >
            <span>Inspect</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
