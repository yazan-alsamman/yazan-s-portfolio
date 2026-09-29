'use client';

import { useEffect } from 'react';

/**
 * One delegated pointer listener for the whole site (design evolution micro-interactions):
 * - `.spot` elements receive --mx/--my (cursor light, globals.css §12);
 * - `.magnetic` elements receive --tx/--ty, a pull of at most 6px toward the pointer.
 * Fine pointers only, never under reduced motion; one rAF per pointer frame; renders nothing.
 * Content and actions never depend on it.
 */
export function PointerEffects() {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || still.matches) return;
    let frame = 0;
    let event: PointerEvent | null = null;
    let pulled: HTMLElement | null = null;
    const release = () => {
      pulled?.style.removeProperty('--tx');
      pulled?.style.removeProperty('--ty');
      pulled = null;
    };
    const update = () => {
      frame = 0;
      const e = event;
      if (!e || !(e.target instanceof Element)) return;
      const spot = e.target.closest<HTMLElement>('.spot');
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
        spot.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
      const magnet = e.target.closest<HTMLElement>('.magnetic');
      if (magnet !== pulled) release();
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const pull = (d: number, size: number) =>
          `${Math.max(-6, Math.min(6, (d / size) * 12)).toFixed(1)}px`;
        magnet.style.setProperty('--tx', pull(e.clientX - (r.left + r.width / 2), r.width));
        magnet.style.setProperty('--ty', pull(e.clientY - (r.top + r.height / 2), r.height));
        pulled = magnet;
      }
    };
    const onMove = (e: PointerEvent) => {
      event = e;
      if (!frame) frame = requestAnimationFrame(update);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', release);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', release);
      release();
    };
  }, []);
  return null;
}
