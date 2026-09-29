import { describe, expect, it, vi } from 'vitest';
import {
  ACT_RANGES,
  actAt,
  actEnvelope,
  actProgress,
  damp,
  smoothstep,
  TOTAL_LENGTH,
} from '@/scene/timeline';
import { LANDSCAPE_KEYS, PORTRAIT_KEYS, sampleCamera } from '@/scene/camera-path';
import { corePose, LANDSCAPE_CORE, PORTRAIT_CORE } from '@/scene/core-path';
import { detectTier, TIER_SETTINGS, type Capabilities } from '@/scene/quality';
import { bindScrollProgress, computeProgress, progress } from '@/scene/progress';
import { seeded } from '@/scene/random';

describe('timeline', () => {
  it('covers [0, 1] with contiguous, ordered acts', () => {
    expect(ACT_RANGES[0]!.start).toBe(0);
    expect(ACT_RANGES.at(-1)!.end).toBeCloseTo(1, 10);
    for (let i = 1; i < ACT_RANGES.length; i++)
      expect(ACT_RANGES[i]!.start).toBeCloseTo(ACT_RANGES[i - 1]!.end, 10);
    expect(ACT_RANGES.map((r) => r.id)).toEqual([
      'arrival',
      'ignition',
      'intelligence',
      'engineering',
      'systems',
      'human',
      'identity',
      'transition',
    ]);
    expect(TOTAL_LENGTH).toBeGreaterThan(7);
  });

  it('resolves acts and local progress deterministically', () => {
    expect(actAt(0).id).toBe('arrival');
    expect(actAt(1).id).toBe('transition');
    const human = ACT_RANGES.find((r) => r.id === 'human')!;
    expect(actProgress((human.start + human.end) / 2, 'human')).toBeCloseTo(0.5, 10);
    expect(actProgress(0, 'human')).toBe(0);
    expect(actProgress(1, 'human')).toBe(1);
  });

  it('envelopes are 0 outside and 1 inside their acts', () => {
    const eng = ACT_RANGES.find((r) => r.id === 'engineering')!;
    expect(actEnvelope((eng.start + eng.end) / 2, 'engineering', 'systems')).toBeCloseTo(1, 5);
    expect(actEnvelope(0, 'engineering', 'systems')).toBe(0);
    expect(actEnvelope(1, 'engineering', 'systems')).toBe(0);
  });

  it('smoothstep has zero slope at the ends and damping never overshoots', () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(1)).toBe(1);
    expect(smoothstep(0.01)).toBeLessThan(0.001);
    let v = 0;
    for (let i = 0; i < 120; i++) {
      v = damp(v, 1, 6, 1 / 60);
      expect(v).toBeLessThanOrEqual(1);
    }
    expect(v).toBeGreaterThan(0.99);
    expect(damp(0, 1, 6, 5)).toBeLessThan(0.5); // huge dt (tab switch) is clamped: no jump
  });
});

describe('camera path', () => {
  for (const [name, keys] of [
    ['landscape', LANDSCAPE_KEYS],
    ['portrait', PORTRAIT_KEYS],
  ] as const) {
    it(`${name}: deterministic and continuous (no jumps between samples)`, () => {
      expect(sampleCamera(0.37, keys)).toEqual(sampleCamera(0.37, keys));
      let prev = sampleCamera(0, keys);
      for (let i = 1; i <= 1000; i++) {
        const pose = sampleCamera(i / 1000, keys);
        const step = Math.hypot(
          ...(pose.position.map((c, k) => c - prev.position[k]!) as [number, number, number]),
        );
        expect(step).toBeLessThan(0.35); // max 0.35 m per 0.1 % of scroll
        prev = pose;
      }
    });
  }

  it('portrait framing is a different composition, not a crop (wider lens, further back)', () => {
    const land = sampleCamera(0.5, LANDSCAPE_KEYS);
    const port = sampleCamera(0.5, PORTRAIT_KEYS);
    expect(port.fov).toBeGreaterThan(land.fov);
  });
});

describe('quality tiers', () => {
  const desktop: Capabilities = {
    reducedMotion: false,
    webgl2: true,
    saveData: false,
    deviceMemory: 8,
    hardwareConcurrency: 12,
    coarsePointer: false,
    viewportWidth: 1440,
  };
  it('maps capabilities to tiers', () => {
    expect(detectTier(desktop)).toBe('high');
    expect(detectTier({ ...desktop, hardwareConcurrency: 4 })).toBe('medium');
    expect(detectTier({ ...desktop, coarsePointer: true, viewportWidth: 390 })).toBe('low');
    expect(detectTier({ ...desktop, reducedMotion: true })).toBe('static');
    expect(detectTier({ ...desktop, webgl2: false })).toBe('static');
    expect(detectTier({ ...desktop, saveData: true })).toBe('static');
    expect(detectTier({ ...desktop, deviceMemory: 2 })).toBe('static');
  });
  it('scales cost down tier by tier', () => {
    expect(TIER_SETTINGS.high.points).toBeGreaterThan(TIER_SETTINGS.medium.points);
    expect(TIER_SETTINGS.medium.points).toBeGreaterThan(TIER_SETTINGS.low.points);
    expect(TIER_SETTINGS.low.points).toBeLessThanOrEqual(3000);
    expect(TIER_SETTINGS.high.dpr[1]).toBeLessThanOrEqual(2);
  });
});

describe('scroll progress', () => {
  it('normalizes the scroll position over the cinematic travel', () => {
    // Centre line of a 1000px viewport inside a 5000px section.
    expect(computeProgress(0, 5000, 1000)).toBe(0.1);
    expect(computeProgress(-2000, 5000, 1000)).toBe(0.5);
    expect(computeProgress(-9999, 5000, 1000)).toBe(1);
    expect(computeProgress(600, 5000, 1000)).toBe(0);
    expect(computeProgress(0, 0, 1000)).toBe(0);
  });
  it('requests a frame only when the progress actually changes (demand rendering)', () => {
    let top = 0;
    let queued: (() => void) | null = null;
    const listeners = new Map<string, () => void>();
    vi.stubGlobal('window', {
      innerHeight: 1000,
      addEventListener: (t: string, fn: () => void) => listeners.set(t, fn),
      removeEventListener: (t: string) => listeners.delete(t),
    });
    vi.stubGlobal('requestAnimationFrame', (fn: () => void) => ((queued = fn), 1));
    vi.stubGlobal('cancelAnimationFrame', () => {});
    const root = { getBoundingClientRect: () => ({ top, height: 5000 }) } as HTMLElement;
    const onChange = vi.fn();
    progress.onChange = onChange;
    progress.target = 0;
    const unbind = bindScrollProgress(root);
    expect(progress.target).toBe(0.1);
    expect(onChange).toHaveBeenCalledTimes(1);
    const scroll = () => {
      listeners.get('scroll')!();
      queued!();
    };
    scroll(); // same position: no new frame
    expect(onChange).toHaveBeenCalledTimes(1);
    top = -2000;
    scroll();
    expect(progress.target).toBe(0.5);
    expect(onChange).toHaveBeenCalledTimes(2);
    unbind();
    expect(listeners.size).toBe(0);
    progress.onChange = undefined;
    vi.unstubAllGlobals();
  });
  it('seeded randomness is reproducible', () => {
    const a = seeded(7);
    const b = seeded(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('inference core choreography (design evolution)', () => {
  const ignitionEnd = ACT_RANGES.find((r) => r.id === 'ignition')!.end;

  it('is deterministic and continuous across the whole progress range', () => {
    for (const portrait of [false, true]) {
      let prev = corePose(0, portrait);
      for (let i = 1; i <= 400; i++) {
        const p = i / 400;
        const pose = corePose(p, portrait);
        expect(corePose(p, portrait)).toEqual(pose);
        const jump = Math.hypot(...pose.position.map((v, k) => v - prev.position[k]!));
        expect(jump).toBeLessThan(0.5); // no teleport: ≤ 0.5 m per 0.25 % of scroll
        prev = pose;
      }
    }
  });

  it('docks at the origin of the floor circuits by the end of ignition and stays there', () => {
    for (const portrait of [false, true]) {
      for (const p of [ignitionEnd, 0.5, 1]) {
        const pose = corePose(p, portrait);
        expect(pose.position[0]).toBeCloseTo(0, 6);
        expect(pose.position[2]).toBeCloseTo(0, 6);
        expect(pose.position[1]).toBeLessThan(-1.9); // seated on the floor plane (y = -2)
      }
    }
  });

  it('mirrors for right-to-left layouts and converges on the same dock', () => {
    const ltr = corePose(0, false);
    const rtl = corePose(0, false, true);
    expect(rtl.position[0]).toBeCloseTo(-ltr.position[0], 10);
    expect(rtl.rotation[1]).toBeCloseTo(-ltr.rotation[1], 10);
    expect(corePose(1, false, true).position[0]).toBeCloseTo(0, 10);
  });

  it('holds a distinct hero framing per orientation (a composition, not a crop)', () => {
    expect(LANDSCAPE_CORE[0]!.position[0]).toBeGreaterThan(2); // beside the identity
    expect(PORTRAIT_CORE[0]!.position[0]).toBe(0); // centred above it
    expect(corePose(0, false)).not.toEqual(corePose(0, true));
  });
});
