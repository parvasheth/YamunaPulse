import React, { useState, useEffect } from 'react';
import type { MonitoringNode, SatellitePass, NodeObservation, WaterMetric } from './types';
import { Navbar } from './components/Navbar';
import { RiverMap } from './components/RiverMap';
import { TimelineScrubber } from './components/TimelineScrubber';
import { LongitudinalProfileChart } from './components/LongitudinalProfileChart';
import { PatternDiscoveryMatrix } from './components/PatternDiscoveryMatrix';
import { SeasonalComparator } from './components/SeasonalComparator';
import { AutomatedInsightsFeed } from './components/AutomatedInsightsFeed';
import { NodeInspectorModal } from './components/NodeInspectorModal';
import { GlossaryModal } from './components/GlossaryModal';
import { SyncModal } from './components/SyncModal';
import { ShareModal } from './components/ShareModal';
import { Activity, Database, Compass, BookOpen, Users, Sparkles, Share2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeMetric, setActiveMetric] = useState<WaterMetric>('ndti_mean');
  const [activeTab, setActiveTab] = useState<'monitor' | 'patterns' | 'seasonal' | 'insights'>('monitor');
  const [nodes, setNodes] = useState<MonitoringNode[]>([]);
  const [passes, setPasses] = useState<SatellitePass[]>([]);
  const [currentPassIndex, setCurrentPassIndex] = useState<number>(0);
  const [currentProfile, setCurrentProfile] = useState<NodeObservation[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isSyncOpen, setIsSyncOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  // Live Cloudflare public tunnel URL for sharing
  const publicShareUrl = 'https://wish-bbs-lace-promises.trycloudflare.com';

  const loadPasses = () => {
    fetch('/api/passes?limit=500')
      .then((r) => r.json())
      .then((data) => {
        const passList: SatellitePass[] = data.passes || [];
        setPasses(passList);
      })
      .catch((err) => console.error('Failed to load passes:', err));
  };

  // Visitor Counter Tracking: increments once per session
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('yamunapulse_visited');
    const method = hasVisited ? 'GET' : 'POST';

    fetch('/api/stats/visit', { method })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.total_visits === 'number') {
          setVisitorCount(data.total_visits);
          sessionStorage.setItem('yamunapulse_visited', 'true');
        }
      })
      .catch((err) => {
        console.warn('Visitor counter fallback:', err);
        setVisitorCount((prev) => (prev !== null ? prev : 1));
      });
  }, []);

  // Initial load: Nodes and Passes
  useEffect(() => {
    Promise.all([
      fetch('/api/nodes').then((r) => r.json()),
      fetch('/api/passes?limit=500').then((r) => r.json()),
    ])
      .then(([nodesData, passesData]) => {
        const nodeList: MonitoringNode[] = (nodesData.features || []).map((f: any) => f.properties);
        setNodes(nodeList);
        const passList: SatellitePass[] = passesData.passes || [];
        setPasses(passList);
        if (passList.length > 0) {
          // Default to a notable recent pass
          setCurrentPassIndex(Math.floor(passList.length * 0.75));
        }
      })
      .catch((err) => console.error('Failed to load initial metadata:', err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch longitudinal profile whenever currentPassIndex changes
  useEffect(() => {
    if (passes.length === 0 || currentPassIndex < 0 || currentPassIndex >= passes.length) return;

    const pass = passes[currentPassIndex];
    fetch(`/api/profile?pass_id=${pass.pass_id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setCurrentProfile(data.profile);
        }
      })
      .catch((err) => console.error('Failed to load profile for pass:', err));
  }, [currentPassIndex, passes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-600 animate-pulse">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Initializing YamunaPulse...</h2>
        <p className="text-xs text-slate-400">Loading Delhi Yamuna STAC Cube & Analytics Engine</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Banner: Creator Attribution & Share Shortcut */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5 text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Created by Parva Sheth
          </span>
          <span className="hidden md:inline text-slate-500">&bull;</span>
          <span className="hidden md:inline text-slate-400">
            Sentinel-2 Spatiotemporal Satellite Water Quality & Anomaly Detection System
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {/* Visitor Counter */}
          <span className="flex items-center gap-1 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/60 text-slate-300 font-mono">
            <Users className="w-3 h-3 text-indigo-400" />
            <span>Visitors: {visitorCount !== null ? visitorCount.toLocaleString() : '1'}</span>
          </span>
          {/* Share Link Shortcut */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
          >
            <Share2 className="w-3 h-3" />
            <span>Share Public Link</span>
          </button>
        </div>
      </div>

      {/* Navigation Header */}
      <Navbar
        activeMetric={activeMetric}
        onMetricChange={setActiveMetric}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        passCount={passes.length}
        visitorCount={visitorCount}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenSync={() => setIsSyncOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col gap-4">
        {/* Tab 1: Live Split-Screen Map & Longitudinal Scrubber */}
        {activeTab === 'monitor' && (
          <div className="flex flex-col gap-3 flex-1">
            {/* Layman Quick Context Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-slate-300">
                  <strong className="text-white">Active Metric:</strong>{' '}
                  {activeMetric === 'ndti_mean' && 'NDTI (Turbidity) — Measures suspended mud, silt, and untreated sewage particles.'}
                  {activeMetric === 'ndci_mean' && 'NDCI (Algal / Eutrophic) — Measures green chlorophyll scum, algae, and rotting organic matter.'}
                  {activeMetric === 'dom_ratio_mean' && 'DOM / Dye Ratio — Measures toxic detergent surfactants, textile dyes, and foaming chemicals.'}
                  {activeMetric === 'ndwi_mean' && 'NDWI (Water Presence) — Delineates surface water flow width vs dry sandy riverbeds.'}
                </span>
              </div>
              <button
                onClick={() => setIsGlossaryOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explain All Terms & Drains &rarr;</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
              {/* Left Column: Interactive Map (5 cols on lg) */}
              <div className="lg:col-span-5 h-[600px] lg:h-[700px] flex flex-col">
                <RiverMap
                  observations={currentProfile}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={(id) => setSelectedNodeId(id)}
                  activeMetric={activeMetric}
                />
              </div>

              {/* Right Column: Scrubber & Longitudinal Cascade Profile (7 cols on lg) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {/* Timeline Scrubber */}
                <TimelineScrubber
                  passes={passes}
                  currentIndex={currentPassIndex}
                  onIndexChange={setCurrentPassIndex}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  playbackSpeed={playbackSpeed}
                  onSpeedChange={setPlaybackSpeed}
                />

                {/* Longitudinal River Profile Chart */}
                <div className="flex-1 min-h-[360px]">
                  <LongitudinalProfileChart
                    profile={currentProfile}
                    activeMetric={activeMetric}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={(id) => setSelectedNodeId(id)}
                  />
                </div>

                {/* Status Bar */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>DuckDB Analytical Store: {passes.length * 18} observations synchronized</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-amber-300/90 font-medium">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Created by Parva Sheth
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Compass className="w-3.5 h-3.5 text-slate-500" />
                      Click any node to inspect trend
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pattern Discovery Matrix (Heatmaps & Cyclical Rules) */}
        {activeTab === 'patterns' && (
          <div className="flex-1">
            <PatternDiscoveryMatrix
              activeMetric={activeMetric}
              onSelectNode={(id) => setSelectedNodeId(id)}
            />
          </div>
        )}

        {/* Tab 3: Seasonal Hydrodynamic Engine */}
        {activeTab === 'seasonal' && (
          <div className="flex-1">
            <SeasonalComparator
              activeMetric={activeMetric}
              onSelectNode={(id) => setSelectedNodeId(id)}
            />
          </div>
        )}

        {/* Tab 4: Automated Insights & Anomaly Feed */}
        {activeTab === 'insights' && (
          <div className="flex-1">
            <AutomatedInsightsFeed
              onSelectNode={(id) => setSelectedNodeId(id)}
            />
          </div>
        )}
      </main>

      {/* Node Inspector Modal */}
      <NodeInspectorModal
        nodeId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
        activeMetric={activeMetric}
        nodes={nodes}
      />

      {/* Field Guide & Layman Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Satellite Ingestion & Orbit Sync Modal */}
      <SyncModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        onSyncComplete={loadPasses}
      />

      {/* Share & Published Public Link Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        publicUrl={publicShareUrl}
        visitorCount={visitorCount}
      />
    </div>
  );
};
export default App;
