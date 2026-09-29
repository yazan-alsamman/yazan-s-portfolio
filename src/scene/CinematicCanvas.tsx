'use client';

import { Canvas } from '@react-three/fiber';
import { useCallback, useMemo, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { TIER_SETTINGS, type Tier } from './quality';
import { PALETTE } from './state';
import { Director, Lights } from './parts/Director';
import { Field } from './parts/Field';
import { Circuits } from './parts/Circuits';
import { buildGraph, NeuralGraph } from './parts/NeuralGraph';
import { Actuator, ACTUATOR_BASE } from './parts/Actuator';
import { Links } from './parts/Links';
import { Portrait, PORTRAIT_POSITION } from './parts/Portrait';
import { InferenceCore } from './parts/InferenceCore';

export type CinematicCanvasProps = {
  tier: Exclude<Tier, 'static'>;
  portraitSrc: string;
  active: boolean;
  fadeTarget: RefObject<HTMLElement | null>;
  onReady: () => void;
  onFail: (reason: string) => void;
};

/**
 * The WebGL layer (client-only, lazily imported — never on the critical path).
 * Receives only plain props: no CMS, router or i18n access inside the render loop (ADR-007).
 * Everything is procedural: no model/texture downloads except the owner's portrait copy.
 */
export default function CinematicCanvas({
  tier,
  portraitSrc,
  active,
  fadeTarget,
  onReady,
  onFail,
}: CinematicCanvasProps) {
  const settings = TIER_SETTINGS[tier];
  const layout = useMemo(() => buildGraph(settings.graphNodesPerLayer), [settings.graphNodesPerLayer]);
  const effector = useMemo(() => ACTUATOR_BASE.clone().add(new THREE.Vector3(0.6, 4.1, 0)), []);
  // Phase 8: nothing is rendered until every shader program is compiled in parallel (`warm`);
  // then frames are rendered on demand (scroll, resize, settling), never continuously.
  const [warm, setWarm] = useState(false);
  const onWarm = useCallback(() => setWarm(true), []);

  return (
    <Canvas
      dpr={settings.dpr}
      shadows={settings.shadows ? 'percentage' : false}
      frameloop={active && warm ? 'demand' : 'never'}
      camera={{ fov: 38, near: 0.1, far: 120, position: [0, 0.6, 18] }}
      gl={{
        antialias: settings.antialias,
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
      }}
      onCreated={({ gl }) => {
        performance.mark('cinematic:created');
        gl.setClearColor(PALETTE.obsidian, 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        // Shaders are fixed and unit-free; skip per-program validation in production
        // (saves compile time and silences benign driver info logs).
        if (process.env.NODE_ENV === 'production') gl.debug.checkShaderErrors = false;
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onFail('webglcontextlost');
        });
      }}
      aria-hidden="true"
    >
      <Director tier={tier} fadeTarget={fadeTarget} onWarm={onWarm} onFirstFrame={onReady} />
      <Lights shadows={settings.shadows} />
      <Field count={settings.points} />
      <Circuits paths={settings.circuitPaths} />
      <InferenceCore tier={tier} />
      <NeuralGraph layout={layout} />
      <Actuator shadows={settings.shadows} />
      <Links graphOutputs={layout.outputs} effector={effector} portrait={PORTRAIT_POSITION} />
      <Portrait src={portraitSrc} />
    </Canvas>
  );
}
