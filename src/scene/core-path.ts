import { rangeOf, smoothstep, type ActId } from './timeline';

/**
 * Inference Core choreography (design evolution): one pose per keyframe, eased between keys
 * exactly like the directed camera (camera-path.ts). Pure data + math, unit-tested.
 *
 *   hero     floating beside the identity (landscape: right of the name; portrait: above it)
 *   exploded opened in place at the end of arrival (the architecture is visible)
 *   docked   seated at the origin of the floor, where the ignition circuits radiate from
 */
export type Vec3 = readonly [number, number, number];
export type CorePose = { position: Vec3; rotation: Vec3; scale: number };
type CoreKey = CorePose & { act: ActId; at: number };

const DOCKED: CorePose = { position: [0, -1.99, 0], rotation: [0, Math.PI / 4, 0], scale: 0.62 };

export const LANDSCAPE_CORE: readonly CoreKey[] = [
  { act: 'arrival', at: 0, position: [3.55, 1.05, 6.4], rotation: [0.6, -0.62, 0], scale: 1.08 },
  { act: 'arrival', at: 1, position: [3.1, -0.45, 4.2], rotation: [0.5, -0.9, 0], scale: 0.9 },
  { act: 'ignition', at: 0.55, position: [3.9, -1.6, 1.3], rotation: [0.36, 0.1, 0], scale: 0.72 },
  { act: 'ignition', at: 1, ...DOCKED },
];

/** Portrait viewports: centred above the identity, closer to the lens (a composition, not a crop). */
export const PORTRAIT_CORE: readonly CoreKey[] = [
  { act: 'arrival', at: 0, position: [0, 2.6, 11.5], rotation: [0.66, -0.62, 0], scale: 1.1 },
  { act: 'arrival', at: 1, position: [0, 1.1, 9.4], rotation: [0.5, -0.9, 0], scale: 0.95 },
  { act: 'ignition', at: 0.55, position: [0.2, 0.9, 3.4], rotation: [0.5, 0.1, 0], scale: 0.8 },
  { act: 'ignition', at: 1, ...DOCKED },
];

function keyTime(key: CoreKey): number {
  const r = rangeOf(key.act);
  return r.start + (r.end - r.start) * key.at;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

/** Mirror across the vertical axis (RTL: the identity sits on the right, so the core takes the left). */
const mirror = (pose: CorePose): CorePose => ({
  position: [-pose.position[0], pose.position[1], pose.position[2]],
  rotation: [pose.rotation[0], -pose.rotation[1], -pose.rotation[2]],
  scale: pose.scale,
});

/**
 * Core pose at progress p. Deterministic: same p → same pose. Holds the docked pose after
 * ignition. `rtl` mirrors the path (the docked pose at the origin is symmetric either way).
 */
export function corePose(p: number, portrait: boolean, rtl = false): CorePose {
  const pose = sampleCore(p, portrait);
  return rtl ? mirror(pose) : pose;
}

function sampleCore(p: number, portrait: boolean): CorePose {
  const keys = portrait ? PORTRAIT_CORE : LANDSCAPE_CORE;
  const times = keys.map(keyTime);
  const pick = (k: CoreKey): CorePose => ({ position: k.position, rotation: k.rotation, scale: k.scale });
  if (p <= times[0]!) return pick(keys[0]!);
  for (let i = 1; i < keys.length; i++) {
    const t1 = times[i]!;
    if (p <= t1) {
      const t0 = times[i - 1]!;
      const t = smoothstep((p - t0) / (t1 - t0 || 1));
      const a = keys[i - 1]!;
      const b = keys[i]!;
      return {
        position: lerp3(a.position, b.position, t),
        rotation: lerp3(a.rotation, b.rotation, t),
        scale: lerp(a.scale, b.scale, t),
      };
    }
  }
  return pick(keys[keys.length - 1]!);
}
