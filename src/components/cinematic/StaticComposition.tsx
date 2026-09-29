import { GridLines } from '@/components/shell/GridLines';

/**
 * The always-present base layer of the cinematic stage (server-rendered, CSS only).
 * It is what reduced-motion users, WebGL-less browsers and every first paint see, and what
 * remains if the 3D layer fails at any point — never a blank canvas (spec §9, §10).
 * Same visual language as the scene: obsidian environment, measured grid, a horizon of signal.
 * The Inference Core drawing belongs to the arrival chapter (StaticCore), not to this sticky layer,
 * so it scrolls away with the identity instead of sitting behind every later act.
 */
export function StaticComposition() {
  return (
    <div className="cine-static absolute inset-0" aria-hidden="true">
      <GridLines />
      <div className="cine-static-floor" />
      <div className="cine-static-horizon" />
      <div className="cine-static-glow" />
    </div>
  );
}
