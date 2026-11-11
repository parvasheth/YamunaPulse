import React, { useEffect } from 'react';
import type { SatellitePass } from '../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  FastForward,
  RotateCcw,
  Cloud,
  Calendar,
  Clock,
} from 'lucide-react';

interface TimelineScrubberProps {
  passes: SatellitePass[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  passes,
  currentIndex,
  onIndexChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSpeedChange,
}) => {
  const currentPass = passes[currentIndex] || null;

  // Auto-play interval effect
  useEffect(() => {
    if (!isPlaying || passes.length === 0) return;

    const intervalMs = Math.max(100, Math.floor(800 / playbackSpeed));
    const timer = setInterval(() => {
      onIndexChange(currentIndex + 1 >= passes.length ? 0 : currentIndex + 1);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, passes.length, currentIndex, onIndexChange]);

  if (!currentPass) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center text-slate-400">
        Loading satellite timeline...
      </div>
    );
  }

  const passDate = new Date(currentPass.timestamp);
  const formattedDate = passDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getSeasonBadge = (season: string) => {
    switch (season) {
      case 'Monsoon':
        return 'bg-blue-950 text-blue-400 border-blue-800/60';
      case 'Pre-Monsoon':
        return 'bg-amber-950 text-amber-400 border-amber-800/60';
      case 'Post-Monsoon':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800/60';
      case 'Winter':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onIndexChange(parseInt(e.target.value, 10));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 backdrop-blur rounded-xl p-3.5 shadow-xl">
      {/* Top Bar: Pass Info & Key Event Jumpers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-y-1">
          <span className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-white bg-slate-800/90 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-700">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
            <span>{formattedDate}</span>
          </span>

          <span
            className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full border ${getSeasonBadge(
              currentPass.season
            )}`}
          >
            {currentPass.season}
          </span>

          <span className="text-[10px] sm:text-xs font-medium text-slate-300 bg-slate-800/60 px-1.5 sm:px-2 py-0.5 rounded-md border border-slate-700/60 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{currentPass.nth_weekday_of_month}</span>
          </span>

          <span className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 hidden xs:flex">
            <Cloud className="w-3 h-3 text-slate-400" />
            <span>{currentPass.cloud_cover_percent.toFixed(0)}%</span>
          </span>
        </div>

        {/* Quick event jump buttons (Horizontal scrollable on mobile) */}
        <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] overflow-x-auto no-scrollbar py-0.5">
          <span className="text-slate-500 font-medium flex-shrink-0">Jump:</span>
          <button
            onClick={() => {
              // Find winter froth pass (Dec)
              const idx = passes.findIndex((p) => p.month === 12 && p.season === 'Winter');
              if (idx !== -1) onIndexChange(idx);
            }}
            className="flex-shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 transition-colors"
          >
            ❄️ Winter Foam
          </button>
          <button
            onClick={() => {
              // Find monsoon pass (Jul/Aug)
              const idx = passes.findIndex((p) => p.season === 'Monsoon');
              if (idx !== -1) onIndexChange(idx);
            }}
            className="flex-shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded border border-slate-700 transition-colors"
          >
            🌊 Monsoon
          </button>
          <button
            onClick={() => {
              // Find 2nd Friday pass
              const idx = passes.findIndex((p) => p.nth_weekday_of_month.includes('2nd Friday'));
              if (idx !== -1) onIndexChange(idx);
            }}
            className="flex-shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 transition-colors"
          >
            ⚠️ 2nd Fri
          </button>
        </div>
      </div>

      {/* Scrubber Slider with Touch Target */}
      <div className="relative mb-2 flex items-center space-x-3 py-1">
        <input
          type="range"
          min={0}
          max={passes.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
      </div>

      {/* Control Buttons & Progress */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onIndexChange(0)}
            title="First Pass"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
            title="Previous Pass"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-md shadow-cyan-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Play Timelapse</span>
              </>
            )}
          </button>

          <button
            onClick={() => onIndexChange(Math.min(passes.length - 1, currentIndex + 1))}
            title="Next Pass"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center space-x-1 bg-slate-950 px-1.5 py-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 mr-1 flex items-center gap-0.5">
            <FastForward className="w-3 h-3" />
            Speed:
          </span>
          {[1, 2, 5, 10].map((spd) => (
            <button
              key={spd}
              onClick={() => onSpeedChange(spd)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                playbackSpeed === spd
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Counter */}
        <div className="text-[11px] text-slate-400 font-mono">
          Pass <span className="text-white font-semibold">{currentIndex + 1}</span> of{' '}
          <span className="text-slate-300">{passes.length}</span>
        </div>
      </div>
    </div>
  );
};
