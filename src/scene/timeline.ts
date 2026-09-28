/**
 * Cinematic timeline — the single source of truth for the scroll narrative (Phase 3).
 *
 *   scroll position → normalized progress p ∈ [0, 1] → act + local progress → scene state
 *
 * The same table drives BOTH layers: the HTML chapters (their scroll length) and the WebGL
 * scene (camera keyframes, element visibility), so text and image can never drift apart.
 * Pure module: no DOM, no three.js — unit-tested.
 */

export type ActId =
  'arrival' | 'ignition' | 'intelligence' | 'engineering' | 'systems' | 'human' | 'identity' | 'transition';

export type Act = {
  id: ActId;
  /** Scroll length of the act in viewport heights (drives the HTML chapter height). */
  length: number;
};

/**
 * Tuned composition. Quiet acts are short; the two "hero" moments (engineering, human intent)
 * get the most scroll so the camera can travel slowly. Total ≈ 8.4 viewports.
 */
export const ACTS: readonly Act[] = [
  { id: 'arrival', length: 1.1 },
  { id: 'ignition', length: 0.9 },
  { id: 'intelligence', length: 1.2 },
  { id: 'engineering', length: 1.3 },
  { id: 'systems', length: 0.9 },
  { id: 'human', length: 1.3 },
  { id: 'identity', length: 1.0 },
  { id: 'transition', length: 0.7 },
];

export const TOTAL_LENGTH = ACTS.reduce((sum, act) => sum + act.length, 0);

export type ActRange = { id: ActId; start: number; end: number };

/** Normalized [start, end) range of every act. */
export const ACT_RANGES: readonly ActRange[] = (() => {
  let cursor = 0;
  return ACTS.map((act) => {
    const start = cursor / TOTAL_LENGTH;
    cursor += act.length;
    return { id: act.id, start, end: cursor / TOTAL_LENGTH };
  });
})();

export function rangeOf(id: ActId): ActRange {
  const range = ACT_RANGES.find((r) => r.id === id);
  if (!range) throw new Error(`Unknown act ${id}`);
  return range;
}

export const clamp01 = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x); // also normalizes -0

/** Hermite smoothstep: zero velocity at both ends (cinematic ease-in-out). */
export const smoothstep = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/** Linear remap of p from [a, b] to [0, 1], clamped. */
export const remap = (p: number, a: number, b: number) =>
  b === a ? (p >= b ? 1 : 0) : clamp01((p - a) / (b - a));

/** Local 0→1 progress within an act. */
export function actProgress(p: number, id: ActId): number {
  const { start, end } = rangeOf(id);
  return remap(p, start, end);
}

/** The act containing p (p = 1 belongs to the last act). */
export function actAt(p: number): ActRange {
  const q = clamp01(p);
  return ACT_RANGES.find((r) => q >= r.start && q < r.end) ?? ACT_RANGES[ACT_RANGES.length - 1]!;
}

/**
 * Visibility envelope: fades in over [inStart, inEnd], holds, fades out over [outStart, outEnd].
 * Used for every scene element so appearance/disappearance is declared, not scattered.
 */
export function envelope(p: number, inStart: number, inEnd: number, outStart = 2, outEnd = 3): number {
  return smoothstep(remap(p, inStart, inEnd)) * (1 - smoothstep(remap(p, outStart, outEnd)));
}

/** Envelope expressed in act terms: visible from `from` (start + fade) until `until` (end − fade). */
export function actEnvelope(p: number, from: ActId, until: ActId, fade = 0.05): number {
  const a = rangeOf(from);
  const b = rangeOf(until);
  return envelope(p, a.start - fade, a.start + fade, b.end - fade, b.end + fade);
}

/**
 * Frame-rate-independent critically damped follow (exponential smoothing).
 * lambda ≈ 6 gives a ~0.4 s settle: smooth, never floaty, no overshoot, no velocity explosions.
 */
export function damp(current: number, target: number, lambda: number, dtSeconds: number): number {
  const dt = Math.min(Math.max(dtSeconds, 0), 0.1); // clamp: tab switches must not jump
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
