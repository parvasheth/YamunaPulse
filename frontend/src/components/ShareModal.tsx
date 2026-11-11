import React, { useState } from 'react';
import { X, Copy, Check, Globe, Share2, Users, Sparkles, Smartphone, ShieldCheck, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicUrl?: string;
  visitorCount: number | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  publicUrl = window.location.origin,
  visitorCount,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Use the active Cloudflare tunnel URL or current origin if already on the tunnel
  const shareableUrl = window.location.origin.includes('trycloudflare.com')
    ? window.location.origin
    : (publicUrl || window.location.origin);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Share YamunaPulse</h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Published
                </span>
              </div>
              <p className="text-xs text-amber-300 font-medium flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Created by Parva Sheth
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Public Link Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Public Shareable Link
              </label>
              <span className="text-xs text-slate-400">Zero credentials needed</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 truncate select-all">
                {shareableUrl}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-900">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Free HTTPS &bull; No warning screens
              </span>
              <a 
                href={shareableUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                Open in new tab <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Visitor Counter & Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Portal Visitors</div>
                <div className="text-lg font-bold font-mono text-white">
                  {visitorCount !== null ? visitorCount.toLocaleString() : '1'}
                </div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400">System Author</div>
                <div className="text-sm font-bold text-amber-200">
                  Parva Sheth
                </div>
              </div>
            </div>
          </div>

          {/* Device & Access Info */}
          <div className="bg-blue-950/20 border border-blue-800/30 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <h4 className="font-semibold text-blue-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" />
              Who can access this link?
            </h4>
            <p className="leading-relaxed text-slate-300">
              Anyone with this link can view the interactive Delhi Yamuna river map, play back multi-year satellite timelapses, inspect all 18 monitoring stations, and analyze industrial discharge patterns on any phone, tablet, or laptop.
            </p>
          </div>

          {/* Permanent Cloud Hosting Options */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-2 text-xs">
            <h4 className="font-semibold text-slate-200">Permanent 24/7 Cloud Deployment:</h4>
            <p className="text-slate-400 leading-relaxed">
              YamunaPulse is fully bundled with FastAPI serving the static React frontend from a single port. It can be deployed to free hosting providers (e.g. Render, Hugging Face Spaces, or Railway) by pointing to this repository with a standard Python environment.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>YamunaPulse &bull; Satellite Water Quality & Anomaly Detection</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

