import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { NodeObservation, WaterMetric } from '../types';
import { METRIC_CONFIGS, getMetricColor } from '../utils/metrics';
import { Maximize2, Satellite, Moon, Map as MapIcon } from 'lucide-react';

interface RiverMapProps {
  observations: NodeObservation[];
  selectedNodeId: number | null;
  onSelectNode: (nodeId: number) => void;
  activeMetric: WaterMetric;
}

type BasemapStyle = 'satellite' | 'dark' | 'streets';

export const RiverMap: React.FC<RiverMapProps> = ({
  observations,
  selectedNodeId,
  onSelectNode,
  activeMetric,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const riverPolylineRef = useRef<L.Polyline | null>(null);
  const [basemap, setBasemap] = useState<BasemapStyle>('satellite');
  const metricConfig = METRIC_CONFIGS[activeMetric];

  // Base tile sources (100% FREE, NO API KEY REQUIRED)
  const basemapConfigs: Record<BasemapStyle, { url: string; attribution: string; maxZoom: number }> = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxZoom: 19,
    },
    dark: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, HERE, Garmin',
      maxZoom: 16,
    },
    streets: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    },
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28.67, 77.27],
      zoom: 11,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer (Esri Satellite)
    const cfg = basemapConfigs.satellite;
    const tileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Layer when basemap state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const cfg = basemapConfigs[basemap];
    const newTileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
    newTileLayer.bringToBack();
  }, [basemap]);

  // Update Markers, Polygons, and River Polyline when observations or metric changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersLayerRef.current;
    if (!map || !group || observations.length === 0) return;

    group.clearLayers();

    // 1. Draw River centerline polyline
    const lineCoords: [number, number][] = observations.map((o) => [o.latitude, o.longitude]);
    if (riverPolylineRef.current) {
      riverPolylineRef.current.remove();
    }
    const polyline = L.polyline(lineCoords, {
      color: '#38bdf8',
      weight: 3.5,
      opacity: 0.8,
      dashArray: '5, 6',
      lineCap: 'round',
    }).addTo(group);
    riverPolylineRef.current = polyline;

    // 2. Render each Node with 150m Bounding Box & Dynamic Indicator Circle
    observations.forEach((obs) => {
      const metricVal = (obs as any)[activeMetric] ?? 0;
      const color = getMetricColor(activeMetric, metricVal);
      const isSelected = selectedNodeId === obs.node_id;
      const hasDrain = !!obs.drain_inflow;

      // 150m Bounding Box Polygon (delta ~0.000677 lat, ~0.000767 lon)
      const dLat = 0.000677;
      const dLon = 0.000767;
      const bboxBounds: L.LatLngBoundsExpression = [
        [obs.latitude - dLat, obs.longitude - dLon],
        [obs.latitude + dLat, obs.longitude + dLon],
      ];

      const bboxRect = L.rectangle(bboxBounds, {
        color: isSelected ? '#38bdf8' : color,
        weight: isSelected ? 2.5 : 1.2,
        fillColor: color,
        fillOpacity: isSelected ? 0.55 : 0.35,
      }).addTo(group);

      bboxRect.on('click', () => onSelectNode(obs.node_id));

      // Circular Node Marker
      const radius = isSelected ? 11 : hasDrain ? 8.5 : 7;
      const circleMarker = L.circleMarker([obs.latitude, obs.longitude], {
        radius,
        fillColor: color,
        color: isSelected ? '#ffffff' : hasDrain ? '#f97316' : '#1e293b',
        weight: isSelected ? 3 : hasDrain ? 2.5 : 1.5,
        opacity: 1,
        fillOpacity: 0.95,
      }).addTo(group);

      circleMarker.on('click', () => onSelectNode(obs.node_id));

      // Drain Inflow Outfall Marker (if applicable)
      if (hasDrain) {
        const drainIcon = L.divIcon({
          className: 'drain-badge-icon',
          html: `<div style="transform: translate(-50%, -100%); background: #ea580c; color: white; padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: bold; border: 1px solid #fed7aa; box-shadow: 0 2px 5px rgba(0,0,0,0.5); white-space: nowrap;">⚠️ ${obs.drain_inflow}</div>`,
          iconSize: [0, 0],
        });
        L.marker([obs.latitude, obs.longitude], { icon: drainIcon }).addTo(group);
      }

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; color: #f8fafc;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #38bdf8;">Node ${obs.node_id}: ${obs.name}</span>
            <span style="background: #1e293b; color: #94a3b8; padding: 1px 5px; border-radius: 4px; font-size: 10px;">${obs.river_km.toFixed(1)} km</span>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: #94a3b8;">${metricConfig.shortName}:</span>
            <span style="font-weight: 700; color: ${color}; margin-left: 4px;">${metricVal.toFixed(4)}</span>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: #94a3b8;">Active Water Pixels:</span>
            <span style="font-weight: 600; color: #e2e8f0; margin-left: 4px;">${obs.active_water_pixels} / ${obs.total_pixels}</span>
          </div>
          ${
            obs.drain_inflow
              ? `<div style="background: rgba(234, 88, 12, 0.15); border: 1px solid rgba(234, 88, 12, 0.4); padding: 3px 6px; border-radius: 4px; color: #fdba74; font-size: 11px; margin-top: 4px;">
                  ⚠️ <strong>Inflow:</strong> ${obs.drain_inflow} (${obs.drain_impact_tier.toUpperCase()})
                 </div>`
              : ''
          }
        </div>
      `;
      circleMarker.bindPopup(popupHtml);
    });
  }, [observations, selectedNodeId, activeMetric, onSelectNode, metricConfig]);

  const handleResetView = () => {
    if (mapInstanceRef.current && observations.length > 0) {
      const bounds = L.latLngBounds(observations.map((o) => [o.latitude, o.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
  };

  return (
    <div
      style={{ isolation: 'isolate' }}
      className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl z-0"
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls Top Left */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <button
          onClick={handleResetView}
          title="Fit River Corridor (Palla to Asgarpur)"
          className="flex items-center space-x-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-lg backdrop-blur transition-all"
        >
          <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Full Corridor</span>
        </button>
      </div>

      {/* Basemap Style Switcher Top Right */}
      <div className="absolute top-3 right-12 z-10 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl shadow-lg backdrop-blur flex items-center space-x-1 text-xs">
        <button
          onClick={() => setBasemap('satellite')}
          title="High-resolution aerial satellite imagery (Esri World Imagery, 100% Free)"
          className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
            basemap === 'satellite'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Satellite className="w-3 h-3" />
          <span>Satellite</span>
        </button>

        <button
          onClick={() => setBasemap('dark')}
          title="High-contrast dark canvas map (Esri Dark Canvas, 100% Free)"
          className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
            basemap === 'dark'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Moon className="w-3 h-3" />
          <span>Dark Canvas</span>
        </button>

        <button
          onClick={() => setBasemap('streets')}
          title="OpenStreetMap standard vector tiles"
          className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
            basemap === 'streets'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapIcon className="w-3 h-3" />
          <span>Streets</span>
        </button>
      </div>

      {/* Dynamic Spectral Color Legend Bottom Left */}
      <div className="absolute bottom-4 left-3 z-10 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-2.5 rounded-xl shadow-2xl max-w-xs text-xs">
        <div className="flex items-center justify-between font-semibold text-slate-200 mb-1.5">
          <span>{metricConfig.shortName}</span>
          <span className="text-[10px] text-slate-400">150m Cell</span>
        </div>
        <div className="w-48 h-2.5 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-600 border border-slate-700/60 mb-1" />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>{metricConfig.colorLabelLow}</span>
          <span>{metricConfig.colorLabelHigh}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
            Drain Outfall
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 border border-cyan-400 inline-block"></span>
            150m BBox
          </span>
        </div>
      </div>
    </div>
  );
};
