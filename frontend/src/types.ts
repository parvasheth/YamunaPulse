export type WaterMetric = 'ndti_mean' | 'ndci_mean' | 'dom_ratio_mean' | 'ndwi_mean';

export type RiverId = 'yamuna' | 'ganga';

export interface RiverConfig {
  id: RiverId;
  name: string;
  shortName: string;
  corridor: string;
  length_km: number;
  nodes_count: number;
  center: [number, number];
  default_zoom: number;
  baseline_reach: string;
  critical_breakpoint: string;
  description: string;
  icon: string;
}

export const RIVER_CONFIGS: Record<RiverId, RiverConfig> = {
  yamuna: {
    id: 'yamuna',
    name: 'Yamuna River',
    shortName: 'Yamuna (Delhi)',
    corridor: 'Delhi 48.0 km Corridor',
    length_km: 48.0,
    nodes_count: 18,
    center: [28.67, 77.27],
    default_zoom: 11,
    baseline_reach: 'Palla (km 0.0)',
    critical_breakpoint: 'Najafgarh Drain (km 15.2)',
    description: '48.0 km Delhi metropolitan corridor from Palla baseline entry to Asgarpur exit, tracking 18 monitoring stations across industrial and domestic drain outfalls.',
    icon: '🌊'
  },
  ganga: {
    id: 'ganga',
    name: 'Ganga River',
    shortName: 'Ganga (Haridwar)',
    corridor: 'Haridwar 34.0 km Corridor',
    length_km: 34.0,
    nodes_count: 14,
    center: [29.88, 78.19],
    default_zoom: 11,
    baseline_reach: 'Raiwala / Cheela (km 0.0)',
    critical_breakpoint: 'Jagjeetpur STP (km 14.2)',
    description: '34.0 km Haridwar foothills corridor from Raiwala Shivalik entry through Har Ki Pauri pilgrimage ghats and Jagjeetpur STP outfall to Balawali exit.',
    icon: '🏔️'
  }
};

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
  river?: RiverId;
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
  river?: RiverId;
}

export interface AlgaeCrossCheck {
  status: 'ALGAE_MASKED' | 'MINERAL_SEDIMENT' | 'COMBINED_SEWAGE' | 'PRISTINE_BASEFLOW' | 'MODERATE_CHANNEL';
  label: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'LOW';
  color: string;
  explanation: string;
}

export interface WaterMaskQA {
  active_water_pixels: number;
  total_pixels: number;
  water_channel_fraction: number;
  mask_applied: string;
}

export interface CleanGeometryQA {
  channel_clearance: string;
  bridge_interference: string;
  rapids_interference: string;
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
  river?: RiverId;
  // 5 Quality Assurance Scientific Pillars
  seasonal_baseline_mean?: number;
  seasonal_delta_ndti?: number;
  seasonal_z_score?: number;
  algae_cross_check?: AlgaeCrossCheck;
  water_mask?: WaterMaskQA;
  clean_geometry?: CleanGeometryQA;
}

export interface LongitudinalProfileResponse {
  river: RiverId;
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
  river?: RiverId;
  metric: string;
  months: string[];
  days_of_week: string[];
  nth_weekdays: string[];
  years: string[];
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
  node_vs_year: Array<{
    node_id: number;
    node_name: string;
    river_km: number;
    values: (number | null)[];
    delta_since_start?: number;
    pct_change?: number;
    trend_status?: 'improved' | 'degraded' | 'stable';
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
  river?: RiverId;
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
