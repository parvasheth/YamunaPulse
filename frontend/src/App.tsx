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
import { Activity, Database, Compass, BookOpen, Users, Sparkles, Share2, Map as MapIcon, Layers, Grid, Calendar } from 'lucide-react';

export const App: React.FC = () => {
  const [activeMetric, setActiveMetric] = useState<WaterMetric>('ndti_mean');
  const [activeTab, setActiveTab] = useState<'monitor' | 'patterns' | 'seasonal' | 'insights'>('monitor');
  const [mobileView, setMobileView] = useState<'map' | 'profile' | 'split'>('map');
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

  // Dynamic public share URL: uses live production origin when deployed, or active tunnel fallback
  const publicShareUrl = typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')
    ? window.location.origin
    : 'https://contain-taste-regulatory-insight.trycloudflare.com';

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
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80 px-3 sm:px-4 py-1.5 text-xs text-slate-400 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center space-x-2 sm:space-x-3 truncate">
          <span className="flex items-center gap-1.5 text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-[11px] sm:text-xs flex-shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Created by Parva Sheth
          </span>
          <span className="hidden md:inline text-slate-500">&bull;</span>
          <span className="hidden md:inline text-slate-400 truncate">
            Sentinel-2 Spatiotemporal Satellite Water Quality & Anomaly Detection System
          </span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Visitor Counter */}
          <span className="flex items-center gap-1 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/60 text-slate-300 font-mono text-[11px] sm:text-xs">
            <Users className="w-3 h-3 text-indigo-400" />
            <span>Visitors: {visitorCount !== null ? visitorCount.toLocaleString() : '1'}</span>
          </span>
          {/* Share Link Shortcut */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors text-[11px] sm:text-xs"
          >
            <Share2 className="w-3 h-3" />
            <span>Share Link</span>
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

      {/* Main Dashboard Layout (with bottom padding for mobile bar) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 flex flex-col gap-3 sm:gap-4 pb-20 lg:pb-6">
        {/* Tab 1: Live Split-Screen Map & Longitudinal Scrubber */}
        {activeTab === 'monitor' && (
          <div className="flex flex-col gap-2.5 sm:gap-3 flex-1">
            {/* Layman Quick Context Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0"></span>
                <span className="text-slate-300 text-[11px] sm:text-xs truncate sm:whitespace-normal">
                  <strong className="text-white">Active:</strong>{' '}
                  {activeMetric === 'ndti_mean' && 'NDTI (Turbidity) — Suspended silt & municipal sewage.'}
                  {activeMetric === 'ndci_mean' && 'NDCI (Algal / Eutrophic) — Chlorophyll scum & rotting organic matter.'}
                  {activeMetric === 'dom_ratio_mean' && 'DOM / Dye Ratio — Detergent surfactants & textile dyes.'}
                  {activeMetric === 'ndwi_mean' && 'NDWI (Water Channel) — Flow channel width vs sand shoals.'}
                </span>
              </div>
              <button
                onClick={() => setIsGlossaryOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors text-[11px] sm:text-xs flex-shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explain All Terms &rarr;</span>
              </button>
            </div>

            {/* Mobile View Switcher (Only visible on screens < lg) */}
            <div className="lg:hidden flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs shadow-sm">
              <button
                onClick={() => setMobileView('map')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
                  mobileView === 'map'
                    ? 'bg-blue-600 text-white shadow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>
              <button
                onClick={() => setMobileView('profile')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
                  mobileView === 'profile'
                    ? 'bg-blue-600 text-white shadow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Profile Chart</span>
              </button>
              <button
                onClick={() => setMobileView('split')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
                  mobileView === 'split'
                    ? 'bg-blue-600 text-white shadow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>
            </div>

            {/* Main Split Grid (Responsive behavior between mobile views and desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 flex-1">
              {/* Left Column: Interactive Map */}
              <div 
                className={`flex flex-col transition-all ${
                  // On Desktop: always 5 cols, 700px height
                  'lg:col-span-5 lg:h-[700px] lg:flex ' +
                  // On Mobile: controlled by mobileView
                  (mobileView === 'map'
                    ? 'h-[360px] sm:h-[440px] flex'
                    : mobileView === 'split'
                    ? 'h-[250px] sm:h-[300px] flex'
                    : 'hidden')
                }`}
              >
                <RiverMap
                  observations={currentProfile}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={(id) => setSelectedNodeId(id)}
                  activeMetric={activeMetric}
                />
              </div>

              {/* Right Column: Scrubber & Longitudinal Cascade Profile */}
              <div 
                className={`flex flex-col gap-3 sm:gap-4 ${
                  'lg:col-span-7 lg:flex ' +
                  (mobileView === 'map'
                    ? 'flex' // Keep Scrubber visible below map on mobile
                    : mobileView === 'profile' || mobileView === 'split'
                    ? 'flex'
                    : 'flex')
                }`}
              >
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
                <div 
                  className={`flex-1 transition-all ${
                    // On Desktop: always flex-1 min-h-[360px]
                    'lg:min-h-[360px] lg:block ' +
                    // On Mobile: hide if mobileView === 'map'
                    (mobileView === 'profile'
                      ? 'min-h-[320px] sm:min-h-[380px] block'
                      : mobileView === 'split'
                      ? 'min-h-[220px] sm:min-h-[260px] block'
                      : 'hidden')
                  }`}
                >
                  <LongitudinalProfileChart
                    profile={currentProfile}
                    activeMetric={activeMetric}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={(id) => setSelectedNodeId(id)}
                  />
                </div>

                {/* Status Bar */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between text-[11px] sm:text-xs text-slate-400 flex-wrap gap-2">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span>DuckDB: {passes.length * 18} observations</span>
                  </span>
                  <span className="flex items-center gap-2 sm:gap-3">
                    <span className="flex items-center gap-1 text-amber-300 font-medium">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Parva Sheth
                    </span>
                    <span className="text-slate-600 hidden xs:inline">|</span>
                    <span className="flex items-center gap-1 text-slate-400 hidden xs:flex">
                      <Compass className="w-3.5 h-3.5 text-slate-500" />
                      Tap node to inspect
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

      {/* Mobile Fixed Bottom Navigation Bar (Screens < lg) */}
      <nav data-testid="mobile-bottom-nav" className="lg:hidden fixed bottom-0 left-0 right-0 z-[999] bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-1.5 flex items-center justify-around text-[10px] font-medium shadow-2xl safe-area-bottom">
        <button
          data-testid="bottom-nav-monitor"
          onClick={() => setActiveTab('monitor')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all ${
            activeTab === 'monitor' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Monitor</span>
        </button>

        <button
          data-testid="bottom-nav-patterns"
          onClick={() => setActiveTab('patterns')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all ${
            activeTab === 'patterns' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Patterns</span>
        </button>

        <button
          data-testid="bottom-nav-seasonal"
          onClick={() => setActiveTab('seasonal')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all ${
            activeTab === 'seasonal' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Seasonal</span>
        </button>

        <button
          data-testid="bottom-nav-insights"
          onClick={() => setActiveTab('insights')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all ${
            activeTab === 'insights' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Anomalies</span>
        </button>
      </nav>

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
