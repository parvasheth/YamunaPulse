import React, { useState, useEffect } from 'react';
import type { AutomatedInsight } from '../types';
import {
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface AutomatedInsightsFeedProps {
  onSelectNode?: (nodeId: number) => void;
}

export const AutomatedInsightsFeed: React.FC<AutomatedInsightsFeedProps> = () => {
  const [insights, setInsights] = useState<AutomatedInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/insights')
      .then((r) => r.json())
      .then((data) => setInsights(data.insights || []))
      .catch((err) => console.error('Failed to load insights feed:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        Synthesizing automated spatiotemporal insights...
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />,
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-950/80 text-orange-300 border-orange-800/80',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />,
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />,
        };
      default:
        return {
          bg: 'bg-blue-950/80 text-blue-300 border-blue-800/80',
          icon: <Info className="w-3.5 h-3.5 text-blue-400" />,
        };
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 backdrop-blur rounded-xl p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Automated Anomaly & Intelligence Feed
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60">
              {insights.length} High-Confidence Detections
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Statistically validated anomalies synthesized across multi-year STAC passes and hydrological regimes.
          </p>
        </div>
      </div>

      {/* Feed Cards */}
      <div className="grid grid-cols-1 gap-3.5">
        {insights.map((ins) => {
          const badgeStyle = getSeverityBadge(ins.severity);
          return (
            <div
              key={ins.id}
              data-testid="insight-card"
              className="bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 space-y-3 transition-all shadow-md"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle.bg}`}
                  >
                    {badgeStyle.icon}
                    <span>{ins.severity}</span>
                  </span>

                  <span className="text-xs font-semibold text-slate-300 bg-slate-800/70 px-2 py-0.5 rounded border border-slate-700">
                    {ins.category}
                  </span>
                </div>

                <span className="text-[11px] font-medium text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
                  {ins.badge}
                </span>
              </div>

              {/* Title & Summary */}
              <div>
                <h4 className="text-sm font-bold text-white mb-1">{ins.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{ins.summary}</p>
              </div>

              {/* Scientific Evidence */}
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-300 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Empirical & Spectral Evidence:
                </span>
                <p className="text-slate-300 text-[11px] leading-normal">{ins.evidence}</p>
              </div>

              {/* Actionable Takeaway */}
              <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-2.5 text-xs text-emerald-300 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold block text-[11px] text-emerald-400">
                    Recommended Policy & Engineering Action:
                  </span>
                  <span className="text-[11px] text-emerald-200/90">
                    {ins.actionable_takeaway}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
