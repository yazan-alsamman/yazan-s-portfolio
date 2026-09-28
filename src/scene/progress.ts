import { clamp01 } from './timeline';

/**
 * Scroll → normalized progress store (client). One passive scroll listener; no React state,
 * no re-renders per frame. The WebGL scene reads `progress.target` every frame and damps
 * toward it (timeline.damp), so wheel, touch, keyboard and scrollbar input all produce the
 * same smooth, deterministic motion. Native scrolling is never hijacked.
 */
export const progress: { target: number; onChange?: () => void } = { target: 0 };

/**
 * Centre-line progress: p is the position of the viewport's horizontal centre line within the
 * cinematic section. Because each HTML chapter's height is proportional to its act length, the
 * act the scene is showing is always the chapter whose copy crosses the middle of the screen.
 */
export function computeProgress(rootTop: number, rootHeight: number, viewportHeight: number): number {
  if (rootHeight <= 0) return 0;
  return clamp01((viewportHeight / 2 - rootTop) / rootHeight);
}

export function bindScrollProgress(root: HTMLElement): () => void {
  let frame = 0;
  const update = () => {
    frame = 0;
    const rect = root.getBoundingClientRect();
    const next = computeProgress(rect.top, rect.height, window.innerHeight);
    if (next !== progress.target) {
      progress.target = next;
      progress.onChange?.(); // the scene renders on demand (Phase 8)
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  };
}
