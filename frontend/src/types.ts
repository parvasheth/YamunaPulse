export type WaterMetric = 'ndti_mean' | 'ndci_mean' | 'dom_ratio_mean' | 'ndwi_mean';

export interface MonitoringNode {
  node_id: number;
  name: string;
  river_km: number;
  latitude: number;
  longitude: number;
  drain_inflow: string | null;
  drain_impact_tier: 'baseline' | 'low' | 'moderate' | 'high' | 'critical';
  segment: string;
  description: string;
  bbox: [number, number, number, number];
}

export interface SatellitePass {
  pass_id: string;
  satellite: string;
  timestamp: string;
  cloud_cover_percent: number;
  scene_id: string;
  year: number;
  month: number;
  season: 'Pre-Monsoon' | 'Monsoon' | 'Post-Monsoon' | 'Winter';
  day_of_week: string;
  nth_weekday_of_month: string;
}

export interface NodeObservation {
  node_id: number;
  name: string;
  river_km: number;
  latitude: number;
  longitude: number;
  drain_inflow: string | null;
  drain_impact_tier: string;
  segment: string;
  active_water_pixels: number;
  total_pixels: number;
  cloud_shadow_fraction: number;
  ndwi_mean: number;
  ndwi_median: number;
  ndwi_p90: number;
  ndti_mean: number;
  ndti_median: number;
  ndti_p90: number;
  ndci_mean: number;
  ndci_median: number;
  ndci_p90: number;
  dom_ratio_mean: number;
  dom_ratio_median: number;
  dom_ratio_p90: number;
}

export interface LongitudinalProfileResponse {
  pass_info: SatellitePass;
  profile: NodeObservation[];
}

export interface Breakpoint {
  from_node_id: number;
  to_node_id: number;
  location_name: string;
  river_km: number;
  drain_inflow: string | null;
  delta: number;
  percent_jump: number;
  severity: 'critical' | 'high' | 'moderate';
  description: string;
}

export interface AutomatedInsight {
  id: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  badge: string;
  title: string;
  summary: string;
  evidence: string;
  actionable_takeaway: string;
}

export interface HeatmapMatrixResponse {
  metric: string;
  months: string[];
  days_of_week: string[];
  nth_weekdays: string[];
  node_vs_month: Array<{
    node_id: number;
    node_name: string;
    river_km: number;
    values: (number | null)[];
  }>;
  node_vs_dow: Array<{
    node_id: number;
    node_name: string;
    river_km: number;
    values: (number | null)[];
  }>;
  node_vs_nth_weekday: Array<{
    node_id: number;
    node_name: string;
    river_km: number;
    values: (number | null)[];
  }>;
}

export interface CyclicalRule {
  title: string;
  condition: string;
  affected_range: string;
  significance: string;
  impact: string;
  root_cause: string;
}

export interface SeasonalResponse {
  seasons: string[];
  nodes: Array<{
    node_id: number;
    name: string;
    river_km: number;
    drain_inflow: string | null;
    segment: string;
    seasonal_data: Record<string, {
      ndti_mean: number;
      ndti_std: number;
      ndci_mean: number;
      dom_ratio_mean: number;
      ndwi_mean: number;
      active_water_pixels: number;
    } | null>;
  }>;
}

