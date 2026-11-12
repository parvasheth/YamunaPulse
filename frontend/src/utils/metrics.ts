import type { WaterMetric } from '../types';

export interface MetricConfig {
  id: WaterMetric;
  name: string;
  shortName: string;
  formula: string;
  description: string;
  min: number;
  max: number;
  criticalThreshold: number;
  unit: string;
  colorLabelLow: string;
  colorLabelHigh: string;
}

export const METRIC_CONFIGS: Record<WaterMetric, MetricConfig> = {
  ndti_mean: {
    id: 'ndti_mean',
    name: 'Normalized Difference Turbidity Index',
    shortName: 'NDTI (Turbidity)',
    formula: '(B04 - B03) / (B04 + B03)',
    description: 'Measures suspended solids, particulate matter, and sewage turbidity in the water column.',
    min: 0.0,
    max: 0.65,
    criticalThreshold: 0.35,
    unit: 'Index (-1 to 1)',
    colorLabelLow: 'Clear (0.0)',
    colorLabelHigh: 'Hyper-turbid (>0.5)',
  },
  ndci_mean: {
    id: 'ndci_mean',
    name: 'Normalized Difference Chlorophyll Index',
    shortName: 'NDCI (Algal / Eutrophic)',
    formula: '(B05 - B04) / (B05 + B04)',
    description: 'Detects chlorophyll-a concentration, algal blooms, and eutrophication from nutrient-rich agricultural & sewage runoff.',
    min: -0.15,
    max: 0.45,
    criticalThreshold: 0.20,
    unit: 'Index (-1 to 1)',
    colorLabelLow: 'Oligotrophic (<0.0)',
    colorLabelHigh: 'Hyper-eutrophic (>0.3)',
  },
  dom_ratio_mean: {
    id: 'dom_ratio_mean',
    name: 'Dissolved Organic Matter & Dye Ratio',
    shortName: 'DOM / Dye Ratio',
    formula: 'B03 / B02 (Green / Blue)',
    description: 'Indicators of synthetic dye discharges, dissolved organic carbon, and surfactant accumulation (foam precursors).',
    min: 0.90,
    max: 1.85,
    criticalThreshold: 1.35,
    unit: 'Ratio',
    colorLabelLow: 'Natural (~1.0)',
    colorLabelHigh: 'Severe Dye/Foam (>1.5)',
  },
  ndwi_mean: {
    id: 'ndwi_mean',
    name: 'Normalized Difference Water Index',
    shortName: 'NDWI (Water Presence)',
    formula: '(B03 - B08) / (B03 + B08)',
    description: 'Delineates open surface water channel boundaries and separates submerged river reaches from sandbars and floodplains.',
    min: 0.15,
    max: 0.60,
    criticalThreshold: 0.20,
    unit: 'Index (-1 to 1)',
    colorLabelLow: 'Dry Bed (<0.20)',
    colorLabelHigh: 'Deep Flow (>0.45)',
  },
};

/**
 * Returns an RGB color tuple for a normalized value (0.0 to 1.0)
 * Uses vibrant multi-stop ramps:
 * For Turbidity/NDTI: Green -> Yellow -> Orange -> Red -> Magenta
 * For Chlorophyll/NDCI: Dark Blue -> Cyan -> Lime -> Amber -> Red
 * For DOM Ratio: Teal -> Gold -> Orange -> Violet
 */
export function getMetricColor(metric: WaterMetric, value: number): string {
  const cfg = METRIC_CONFIGS[metric];
  const t = Math.max(0, Math.min(1, (value - cfg.min) / (cfg.max - cfg.min)));

  if (metric === 'ndti_mean') {
    // 0: #10b981 (emerald), 0.3: #eab308 (yellow), 0.6: #f97316 (orange), 1.0: #ef4444 (red)
    if (t < 0.3) {
      const p = t / 0.3;
      return interpolateRgb([16, 185, 129], [234, 179, 8], p);
    } else if (t < 0.7) {
      const p = (t - 0.3) / 0.4;
      return interpolateRgb([234, 179, 8], [249, 115, 22], p);
    } else {
      const p = (t - 0.7) / 0.3;
      return interpolateRgb([249, 115, 22], [239, 68, 68], p);
    }
  } else if (metric === 'ndci_mean') {
    // Algal bloom: blue -> cyan -> lime-green -> dark-red
    if (t < 0.35) {
      const p = t / 0.35;
      return interpolateRgb([14, 165, 233], [34, 197, 94], p);
    } else if (t < 0.7) {
      const p = (t - 0.35) / 0.35;
      return interpolateRgb([34, 197, 94], [234, 179, 8], p);
    } else {
      const p = (t - 0.7) / 0.3;
      return interpolateRgb([234, 179, 8], [225, 29, 72], p);
    }
  } else if (metric === 'dom_ratio_mean') {
    // Dissolved organics/dyes: cyan -> amber -> purple
    if (t < 0.4) {
      const p = t / 0.4;
      return interpolateRgb([6, 182, 212], [245, 158, 11], p);
    } else {
      const p = (t - 0.4) / 0.6;
      return interpolateRgb([245, 158, 11], [168, 85, 247], p);
    }
  } else {
    // NDWI: sand/dry (slate-amber) -> deep water blue
    if (t < 0.4) {
      const p = t / 0.4;
      return interpolateRgb([148, 163, 184], [56, 189, 248], p);
    } else {
      const p = (t - 0.4) / 0.6;
      return interpolateRgb([56, 189, 248], [37, 99, 235], p);
    }
  }
}

function interpolateRgb(c1: [number, number, number], c2: [number, number, number], p: number): string {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * p);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * p);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * p);
  return `rgb(${r}, ${g}, ${b})`;
}

export interface LaymanRating {
  label: string;
  badgeClass: string;
}

export function getLaymanLabel(metric: WaterMetric, value: number): LaymanRating {
  if (metric === 'ndti_mean') {
    if (value < 0.08) return { label: 'Clean / Low Silt', badgeClass: 'bg-emerald-950 text-emerald-300 border border-emerald-800' };
    if (value < 0.18) return { label: 'Fair / Moderate', badgeClass: 'bg-blue-950 text-blue-300 border border-blue-800' };
    if (value < 0.28) return { label: 'Murky / Sewage', badgeClass: 'bg-amber-950 text-amber-300 border border-amber-800' };
    return { label: 'Severe Sewage', badgeClass: 'bg-rose-950 text-rose-300 border border-rose-800' };
  } else if (metric === 'ndci_mean') {
    if (value < -0.02) return { label: 'Low Algae', badgeClass: 'bg-emerald-950 text-emerald-300 border border-emerald-800' };
    if (value < 0.08) return { label: 'Moderate Algae', badgeClass: 'bg-blue-950 text-blue-300 border border-blue-800' };
    if (value < 0.18) return { label: 'Algal Scum', badgeClass: 'bg-amber-950 text-amber-300 border border-amber-800' };
    return { label: 'Hyper-Eutrophic', badgeClass: 'bg-rose-950 text-rose-300 border border-rose-800' };
  } else if (metric === 'dom_ratio_mean') {
    if (value < 1.05) return { label: 'Natural River', badgeClass: 'bg-emerald-950 text-emerald-300 border border-emerald-800' };
    if (value < 1.25) return { label: 'Elevated Organics', badgeClass: 'bg-amber-950 text-amber-300 border border-amber-800' };
    return { label: 'Industrial Dyes/Foam', badgeClass: 'bg-purple-950 text-purple-300 border border-purple-800' };
  } else {
    if (value < 0.20) return { label: 'Dry Sand Shoal', badgeClass: 'bg-slate-900 text-slate-300 border border-slate-700' };
    if (value < 0.35) return { label: 'Shallow Stream', badgeClass: 'bg-cyan-950 text-cyan-300 border border-cyan-800' };
    return { label: 'Full River Channel', badgeClass: 'bg-blue-950 text-blue-300 border border-blue-800' };
  }
}

