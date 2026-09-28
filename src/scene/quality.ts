/**
 * Device quality tiers (LANDING_CINEMATIC_SPEC "Performance", ADR-007).
 * Pure decision function over detected capabilities — unit-tested.
 *
 * static : no WebGL download at all (reduced motion, no WebGL2, Save-Data, ≤2 GB memory)
 * low    : phones/tablets — dedicated mobile composition, minimal particles, no shadows, DPR ≤ 1.5
 * medium : laptops / moderate GPUs — reduced counts, DPR ≤ 1.5
 * high   : capable desktops — full counts, DPR ≤ 2
 */
export type Tier = 'static' | 'low' | 'medium' | 'high';

export type Capabilities = {
  reducedMotion: boolean;
  webgl2: boolean;
  saveData: boolean;
  deviceMemory?: number; // GB (Chromium only)
  hardwareConcurrency?: number;
  coarsePointer: boolean;
  viewportWidth: number;
};

export function detectTier(c: Capabilities): Tier {
  if (c.reducedMotion || !c.webgl2 || c.saveData) return 'static';
  if (c.deviceMemory !== undefined && c.deviceMemory <= 2) return 'static';
  if (c.coarsePointer || c.viewportWidth < 768) return 'low';
  const cores = c.hardwareConcurrency ?? 4;
  if (cores <= 4 || (c.deviceMemory !== undefined && c.deviceMemory <= 4)) return 'medium';
  return 'high';
}

export type TierSettings = {
  dpr: [number, number];
  points: number;
  graphNodesPerLayer: number;
  circuitPaths: number;
  antialias: boolean;
  shadows: boolean;
};

export const TIER_SETTINGS: Record<Exclude<Tier, 'static'>, TierSettings> = {
  high: {
    dpr: [1, 2],
    points: 5200,
    graphNodesPerLayer: 14,
    circuitPaths: 34,
    antialias: true,
    shadows: true,
  },
  medium: {
    dpr: [1, 1.5],
    points: 3000,
    graphNodesPerLayer: 11,
    circuitPaths: 24,
    antialias: true,
    shadows: false,
  },
  low: {
    dpr: [1, 1.5],
    points: 1400,
    graphNodesPerLayer: 8,
    circuitPaths: 14,
    antialias: false,
    shadows: false,
  },
};

/** Next lower tier for runtime downgrade when frames are consistently slow. */
export function downgrade(tier: Exclude<Tier, 'static'>): Exclude<Tier, 'static'> {
  return tier === 'high' ? 'medium' : 'low';
}
