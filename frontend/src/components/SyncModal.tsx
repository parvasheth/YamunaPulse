import React, { useState, useEffect } from 'react';
import {
  Satellite,
  RefreshCw,
  X,
  CheckCircle2,
  Clock,
  Database,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [statusData, setStatusData] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);

  const fetchStatus = () => {
    fetch('/api/ingest/status')
      .then((r) => r.json())
      .then((data) => setStatusData(data))
      .catch((err) => console.error('Failed to load ingest status:', err));
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setSyncMessage(null);
      setSyncSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncMessage('Querying Microsoft Planetary Computer STAC for new Sentinel-2 L2A scenes...');
    setSyncSuccess(null);

    fetch('/api/ingest/sync', { method: 'POST' })
      .then((r) => r.json())
      .then((res) => {
        setIsSyncing(false);
        setSyncSuccess(res.status === 'success' || res.status === 'up_to_date');
        setSyncMessage(res.message || 'Synchronization check complete.');
        fetchStatus();
        onSyncComplete();
      })
      .catch((err) => {
        setIsSyncing(false);
        setSyncSuccess(false);
        setSyncMessage(`Synchronization error: ${err.message}`);
      });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Satellite className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Continuous Satellite Ingestion & Orbit Sync
              </h2>
              <p className="text-xs text-slate-400">
                Automated 5-day Earth Observation ingestion from Sentinel-2A and Sentinel-2B.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Constellation Banner */}
          <div className="bg-cyan-950/30 border border-cyan-800/60 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Copernicus Sentinel-2 Constellation (ESA / Planetary Computer)
              </span>
              <span className="bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono">
                🟢 Auto-Sync Active
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sentinel-2 operates as a twin-satellite constellation (Sentinel-2A and Sentinel-2B) phased 180° apart in sun-synchronous orbit. Over Delhi, the satellites deliver a fresh high-resolution multi-spectral capture <strong>every 5 days</strong>.
            </p>
          </div>

          {/* Status Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Ingested Satellite Passes
              </span>
              <span className="text-base font-bold text-white">
                {statusData?.total_satellite_passes ?? '...'} passes
              </span>
              <span className="text-[10px] text-slate-500 block">
                Stored locally in DuckDB
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Latest Ingested Pass
              </span>
              <span className="text-base font-bold text-emerald-400 truncate block">
                {statusData?.latest_pass_timestamp
                  ? new Date(statusData.latest_pass_timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '...'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Cloud-masked & segmented
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Next Orbital Overpass
              </span>
              <span className="text-base font-bold text-amber-300 truncate block">
                {statusData?.next_expected_pass
                  ? new Date(statusData.next_expected_pass).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Every 5 days'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Orbit cycle (~5 days)
              </span>
            </div>
          </div>

          {/* Autonomous Scheduler Explanation */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              How New Data Is Added Continuously:
            </span>
            <ul className="space-y-1.5 text-slate-300 text-xs pl-4 list-disc">
              <li>
                <strong>Background Autonomous Polling:</strong> A background daemon thread inside YamunaPulse wakes up every 6 hours and queries Microsoft Planetary Computer STAC for any Sentinel-2 L2A passes newer than the latest timestamp recorded in DuckDB.
              </li>
              <li>
                <strong>Automatic 18-Node Extraction:</strong> Whenever a new satellite pass is detected, the system extracts the 150m x 150m windows for all 18 nodes, applies cloud/shadow masking, isolates water pixels, and stores new NDTI, NDCI, and DOM_Ratio observations.
              </li>
              <li>
                <strong>Instant Anomaly Update:</strong> Anomaly detection and spatial breakpoint engines update immediately so newly detected pollution surges appear on the portal without restarting.
              </li>
            </ul>
          </div>

          {/* Sync Result Banner */}
          {syncMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                syncSuccess
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                  : syncSuccess === false
                  ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                  : 'bg-blue-950/40 border-blue-800 text-blue-200'
              }`}
            >
              {syncSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              ) : syncSuccess === false ? (
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0 animate-spin" />
              )}
              <span className="leading-relaxed">{syncMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-slate-400">
            STAC Source: Microsoft Planetary Computer (100% Free)
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing STAC...' : 'Check for New Passes Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
