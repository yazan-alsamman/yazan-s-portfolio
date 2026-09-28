'use client';

import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { bindScrollProgress } from '@/scene/progress';
import { detectTier, type Tier } from '@/scene/quality';

/**
 * Client island that upgrades the server-rendered cinematic section with WebGL.
 *
 * Loading order (spec §12): HTML identity + typography + layout are already painted by the
 * server; this island then (1) decides a quality tier, (2) waits for idle time, (3) lazily
 * imports the three.js chunk, (4) fades the canvas in over the static composition once its
 * first frame exists. Any failure leaves the static composition in place — never a blank
 * canvas, spinner or broken layout.
 */
const CinematicCanvas = lazy(() => import('@/scene/CinematicCanvas'));

type Mode = 'pending' | 'static' | 'webgl' | 'failed';

class SceneBoundary extends Component<
  { onError: (e: unknown) => void; children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: unknown) {
    this.props.onError(error);
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

function detectCapabilities() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  let webgl2 = false;
  try {
    webgl2 = Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    webgl2 = false;
  }
  return {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    webgl2,
    saveData: Boolean(nav.connection?.saveData),
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    viewportWidth: window.innerWidth,
  };
}

export function CinematicStage({ rootId, portraitSrc }: { rootId: string; portraitSrc: string }) {
  const [tier, setTier] = useState<Tier | null>(null);
  const [mode, setMode] = useState<Mode>('pending');
  const [load, setLoad] = useState(false);
  const [active, setActive] = useState(true);
  const layer = useRef<HTMLDivElement>(null);

  // Reflect the mode on the section so CSS can adapt (e.g. portrait fallback visibility).
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (root) root.dataset.cinematic = mode === 'webgl' ? 'webgl' : mode === 'pending' ? 'pending' : 'static';
  }, [mode, rootId]);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const unbind = bindScrollProgress(root);
    const io = new IntersectionObserver(([entry]) => setActive(Boolean(entry?.isIntersecting)), {
      rootMargin: '10% 0px',
    });
    io.observe(root);

    const decided = detectTier(detectCapabilities());
    // Capability detection needs browser APIs, so it can only run after hydration; this single
    // post-mount update is intentional (the server render is the static composition).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTier(decided);
    if (decided === 'static') {
      setMode('static');
    } else {
      // Only after the readable page exists and the main thread is idle.
      const start = () => setLoad(true);
      const idle = (
        window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
      ).requestIdleCallback;
      if (idle) idle(start, { timeout: 1500 });
      else setTimeout(start, 600);
    }
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => media.matches && setMode('static');
    media.addEventListener('change', onMotion);
    return () => {
      unbind();
      io.disconnect();
      media.removeEventListener('change', onMotion);
    };
  }, [rootId]);

  const fail = (reason: unknown) => {
    if (process.env.NODE_ENV !== 'production')
      console.warn('[cinematic] falling back to static composition:', reason);
    setMode('failed');
  };

  if (!load || !tier || tier === 'static' || mode === 'failed' || mode === 'static') return null;

  return (
    <div
      ref={layer}
      className="cine-canvas absolute inset-0 transition-opacity duration-(--duration-reveal) ease-standard"
      style={{ visibility: mode === 'webgl' ? 'visible' : 'hidden' }}
      aria-hidden="true"
    >
      <SceneBoundary onError={fail}>
        <Suspense fallback={null}>
          <CinematicCanvas
            tier={tier}
            portraitSrc={portraitSrc}
            active={active}
            fadeTarget={layer}
            onReady={() => setMode('webgl')}
            onFail={fail}
          />
        </Suspense>
      </SceneBoundary>
    </div>
  );
}
