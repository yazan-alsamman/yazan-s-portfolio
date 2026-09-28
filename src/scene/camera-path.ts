import { rangeOf, smoothstep, type ActId } from './timeline';

/**
 * Directed camera: one keyframe per act. Between keyframes the camera eases in/out
 * (smoothstep), so it settles on each composition like a dolly operator — no constant
 * spinning, no drone drift. Separate framings for landscape and portrait (mobile) viewports.
 * Pure data + math, unit-tested.
 */
export type Vec3 = readonly [number, number, number];
export type CameraKey = {
  act: ActId;
  at: 'start' | 'mid' | 'end';
  position: Vec3;
  target: Vec3;
  fov: number;
};
export type CameraPose = { position: Vec3; target: Vec3; fov: number };

// World layout (metres): point field around origin; circuits on the floor (y = -2);
// neural graph centred at (0, 1, 0); actuator at (7, -2, -1); portrait at (-5, 0.9, 2).
export const LANDSCAPE_KEYS: readonly CameraKey[] = [
  { act: 'arrival', at: 'start', position: [0, 0.6, 18], target: [0, 0, 0], fov: 38 },
  { act: 'arrival', at: 'end', position: [0, 0.9, 14], target: [0, -0.4, 0], fov: 38 },
  { act: 'ignition', at: 'end', position: [3.2, 2.4, 9.5], target: [0.5, -1.6, 0], fov: 40 },
  { act: 'intelligence', at: 'mid', position: [-4, 1.8, 8.4], target: [-2.8, 1, 0], fov: 42 },
  { act: 'intelligence', at: 'end', position: [-1, 1.6, 8.6], target: [-1.6, 0.8, 0], fov: 42 },
  { act: 'engineering', at: 'mid', position: [4.2, 0.4, 4.8], target: [7, -0.4, -1], fov: 36 },
  { act: 'engineering', at: 'end', position: [5.2, 1.4, 5.6], target: [6.6, -0.2, -1], fov: 38 },
  { act: 'systems', at: 'end', position: [1, 3.6, 17], target: [1.2, 0, 0], fov: 44 },
  { act: 'human', at: 'mid', position: [-3.2, 1.1, 10.2], target: [-2.8, 0.9, 2], fov: 34 },
  { act: 'human', at: 'end', position: [-3.4, 1, 9.4], target: [-3, 0.9, 2], fov: 33 },
  { act: 'identity', at: 'end', position: [0, 0.4, 22], target: [0, 0.2, 0], fov: 36 },
  { act: 'transition', at: 'end', position: [0, 0.2, 26], target: [0, 0, 0], fov: 36 },
];

/** Portrait viewports: pull back, centre subjects, wider lens — a different composition, not a crop. */
export const PORTRAIT_KEYS: readonly CameraKey[] = [
  { act: 'arrival', at: 'start', position: [0, 0.8, 24], target: [0, 0, 0], fov: 50 },
  { act: 'arrival', at: 'end', position: [0, 1.2, 19], target: [0, -0.4, 0], fov: 50 },
  { act: 'ignition', at: 'end', position: [1.2, 4.2, 13], target: [0.4, -1.8, 0], fov: 52 },
  { act: 'intelligence', at: 'mid', position: [-0.6, 2, 11.5], target: [0, 1, 0], fov: 54 },
  { act: 'intelligence', at: 'end', position: [0.4, 1.8, 11.8], target: [0.2, 0.8, 0], fov: 54 },
  { act: 'engineering', at: 'mid', position: [6.4, 0.8, 7.8], target: [7, -0.3, -1], fov: 50 },
  { act: 'engineering', at: 'end', position: [7.2, 1.6, 8.4], target: [6.8, -0.2, -1], fov: 50 },
  { act: 'systems', at: 'end', position: [1.4, 5, 24], target: [1.2, 0, 0], fov: 56 },
  { act: 'human', at: 'mid', position: [-4.8, 1.6, 11.4], target: [-5, 1.6, 2], fov: 44 },
  { act: 'human', at: 'end', position: [-5, 1.5, 10.6], target: [-5, 1.5, 2], fov: 42 },
  { act: 'identity', at: 'end', position: [0, 0.6, 30], target: [0, 0.2, 0], fov: 46 },
  { act: 'transition', at: 'end', position: [0, 0.3, 34], target: [0, 0, 0], fov: 46 },
];

function keyTime(key: CameraKey): number {
  const r = rangeOf(key.act);
  return key.at === 'start' ? r.start : key.at === 'end' ? r.end : (r.start + r.end) / 2;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

/** Camera pose at progress p. Deterministic: same p → same pose. */
export function sampleCamera(p: number, keys: readonly CameraKey[]): CameraPose {
  const times = keys.map(keyTime);
  if (p <= times[0]!) return { position: keys[0]!.position, target: keys[0]!.target, fov: keys[0]!.fov };
  for (let i = 1; i < keys.length; i++) {
    const t1 = times[i]!;
    if (p <= t1) {
      const t0 = times[i - 1]!;
      const t = smoothstep((p - t0) / (t1 - t0 || 1));
      const a = keys[i - 1]!;
      const b = keys[i]!;
      return {
        position: lerp3(a.position, b.position, t),
        target: lerp3(a.target, b.target, t),
        fov: lerp(a.fov, b.fov, t),
      };
    }
  }
  const last = keys[keys.length - 1]!;
  return { position: last.position, target: last.target, fov: last.fov };
}
