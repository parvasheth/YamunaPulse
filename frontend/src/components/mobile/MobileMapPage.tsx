import React from 'react';
import type { NodeObservation, SatellitePass, WaterMetric, MonitoringNode } from '../../types';
import { METRIC_CONFIGS, getLaymanLabel, getMetricColor } from '../../utils/metrics';
import { RiverMap } from '../RiverMap';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  AlertTriangle,
  X,
  ExternalLink,
  Navigation,
} from 'lucide-react';

interface MobileMapPageProps {
  observations: NodeObservation[];
  passes: SatellitePass[];
  currentPassIndex: number;
  onPassIndexChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  selectedNodeId: number | null;
  onSelectNode: (nodeId: number | null) => void;
  activeMetric: WaterMetric;
  nodes?: MonitoringNode[];
  onOpenInspector: (nodeId: number) => void;
}

export const MobileMapPage: React.FC<MobileMapPageProps> = ({
  observations,
  passes,
  currentPassIndex,
  onPassIndexChange,
  isPlaying,
  onTogglePlay,
  selectedNodeId,
  onSelectNode,
  activeMetric,
  onOpenInspector,
}) => {
  const currentPass = passes[currentPassIndex] || null;
  const metricConfig = METRIC_CONFIGS[activeMetric];

  const passDate = currentPass
    ? new Date(currentPass.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const selectedObservation = observations.find((o) => o.node_id === selectedNodeId);
  const pallaObs = observations.find((o) => o.river_km === 0);

  const selectedVal = selectedObservation
    ? ((selectedObservation as any)[activeMetric] ?? 0)
    : 0;

  const pallaVal = pallaObs ? ((pallaObs as any)[activeMetric] ?? 0) : 0;
  const pctChangeVsPalla = pallaVal > 0 ? Math.round(((selectedVal - pallaVal) / pallaVal) * 100) : 0;

  const laymanInfo = selectedObservation ? getLaymanLabel(activeMetric, selectedVal) : null;
  const metricColor = selectedObservation ? getMetricColor(activeMetric, selectedVal) : '#38bdf8';

  const handlePrevPass = () => {
    if (currentPassIndex > 0) {
      onPassIndexChange(currentPassIndex - 1);
    }
  };

  const handleNextPass = () => {
    if (currentPassIndex < passes.length - 1) {
      onPassIndexChange(currentPassIndex + 1);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-175px)] min-h-[460px] flex flex-col bg-slate-950 overflow-hidden">
      {/* Interactive Map Component */}
      <div className="flex-1 w-full h-full relative z-0">
        <RiverMap
          observations={observations}
          selectedNodeId={selectedNodeId}
          onSelectNode={(id) => onSelectNode(id)}
          activeMetric={activeMetric}
        />
      </div>

      {/* Floating Date Stepper / Playback Capsule (Top Center) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center bg-slate-900/95 border border-slate-700/90 rounded-full px-2 py-1 shadow-2xl backdrop-blur-md text-xs text-white max-w-[94%]">
        <button
          onClick={handlePrevPass}
          disabled={currentPassIndex === 0}
          className="p-1 rounded-full text-slate-400 hover:text-white disabled:opacity-30 transition-colors active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-1.5 px-2">
          <Calendar className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="font-bold text-[11px] text-slate-100 whitespace-nowrap">
            {passDate}
          </span>
          <span className="text-[10px] text-slate-400 hidden xs:inline">
            ({currentPassIndex + 1}/{passes.length})
          </span>
        </div>

        <button
          onClick={onTogglePlay}
          className={`p-1 rounded-full transition-all active:scale-90 ${
            isPlaying ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
          }`}
          title={isPlaying ? 'Pause timelapse' : 'Play timelapse'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={handleNextPass}
          disabled={currentPassIndex >= passes.length - 1}
          className="p-1 rounded-full text-slate-400 hover:text-white disabled:opacity-30 transition-colors active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Bottom Station Summary Card (When node is selected) */}
      {selectedObservation ? (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-900/95 border border-slate-700/90 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-white animate-in slide-in-from-bottom-3">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-white">
                  Node {selectedObservation.node_id}: {selectedObservation.name}
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                  km {selectedObservation.river_km.toFixed(1)}
                </span>
                <span className="text-[10px] bg-blue-950/80 text-blue-300 border border-blue-800/60 px-1.5 py-0.5 rounded">
                  {selectedObservation.segment}
                </span>
              </div>
              {selectedObservation.drain_inflow && (
                <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium mt-0.5">
                  <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span>Outfall: {selectedObservation.drain_inflow}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectNode(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                {metricConfig.shortName}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold font-mono" style={{ color: metricColor }}>
                  {selectedVal.toFixed(3)}
                </span>
                {laymanInfo && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${laymanInfo.badgeClass}`}
                  >
                    {laymanInfo.label}
                  </span>
                )}
              </div>
            </div>

            {selectedObservation.river_km > 0 && pctChangeVsPalla !== 0 && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Vs Entry (Palla)</div>
                <div
                  className={`text-xs font-bold font-mono ${
                    pctChangeVsPalla > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {pctChangeVsPalla > 0 ? `+${pctChangeVsPalla}%` : `${pctChangeVsPalla}%`}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onOpenInspector(selectedObservation.node_id)}
            className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <span>Inspect 5-Year History & Trend Curves</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Subtle Tap Hint when no node is selected */
        <div className="absolute bottom-3 right-3 z-10 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-400 backdrop-blur flex items-center gap-1.5 shadow-lg pointer-events-none">
          <Navigation className="w-3 h-3 text-cyan-400" />
          <span>Tap any node on map to inspect</span>
        </div>
      )}
    </div>
  );
};
