'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, type RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { LANDSCAPE_KEYS, PORTRAIT_KEYS, sampleCamera } from '../camera-path';
import { progress } from '../progress';
import type { Tier } from '../quality';
import { actProgress, damp, smoothstep } from '../timeline';
import { PALETTE, sceneState } from '../state';

declare global {
  interface Window {
    __cinematic?: {
      tier: Tier;
      p: number;
      fps: number;
      drawCalls: number;
      triangles: number;
      points: number;
      geometries: number;
      textures: number;
      dpr: number;
    };
  }
}

function publishStats(gl: THREE.WebGLRenderer, tier: Exclude<Tier, 'static'>, fps: number) {
  const info = gl.info;
  window.__cinematic = {
    tier,
    p: sceneState.p,
    fps: Math.round(fps),
    drawCalls: info.render.calls,
    triangles: info.render.triangles,
    points: info.render.points,
    geometries: info.memory.geometries,
    textures: info.memory.textures,
    dpr: gl.getPixelRatio(),
  };
}

/**
 * The Director runs first every frame: progress damping → camera pose → canvas fade,
 * plus adaptive resolution and measurable stats (window.__cinematic, read by tests/QA).
 *
 * Phase 8 — render on demand: every frame is a pure function of scroll progress (no wall-clock
 * animation anywhere in the scene), so frames are rendered only while the progress changes, the
 * damping is settling or the canvas is resized. At rest the GPU is idle (measured before: ~165
 * identical frames/s while reading). `onWarm` fires once every scene program is compiled in
 * parallel; only then does the parent start rendering, so no frame blocks on a scene shader.
 */
export function Director({
  tier,
  fadeTarget,
  onWarm,
  onFirstFrame,
}: {
  tier: Exclude<Tier, 'static'>;
  fadeTarget: RefObject<HTMLElement | null>;
  onWarm: () => void;
  onFirstFrame: () => void;
}) {
  const { camera, gl, size, scene, invalidate } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const perf = useMemo(
    () => ({
      acc: 0,
      frames: 0,
      fpsAcc: 0,
      fpsFrames: 0,
      fps: 60,
      typicalDt: 1 / 60,
      asleep: false,
      first: true,
    }),
    [],
  );

  // Image-based lighting for the metals only (procedural room, no HDR download), then a parallel
  // compile (KHR_parallel_shader_compile) of every scene program before the first frame — this
  // removed a ~0.5 s stall mid-scroll when hidden parts (e.g. the actuator) first appeared.
  useEffect(() => {
    let cancelled = false;
    let env: THREE.Texture | null = null;
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    scene.fog = new THREE.FogExp2(PALETTE.obsidian, 0.03);
    const build = () => {
      env = pmrem.fromScene(room, 0.04).texture;
      scene.environment = env;
      scene.environmentIntensity = 0.55;
    };
    // performance marks (read by the Phase 8 harness; negligible cost, deferred chunk only)
    const mark = (name: string) => performance.mark(`cinematic:${name}`);
    void (async () => {
      try {
        // PMREM compiles synchronously (~0.5 s cold on D3D11/ANGLE, measured): a parallel warm-up
        // was tried and gave no benefit cold (ANGLE finalises the program at draw time), so it
        // runs here once, before the first frame, while the static composition is on screen.
        mark('environment-start');
        build();
        mark('environment-built');
        await gl.compileAsync(scene, camera);
        mark('scene-compiled');
      } catch {
        // Fallback: the synchronous path (identical image, blocking compile).
        if (!cancelled && !env) build();
      }
      if (!cancelled) onWarm();
    })();
    return () => {
      cancelled = true;
      scene.environment = null;
      (env as THREE.Texture | null)?.dispose();
      room.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, camera, onWarm]);

  // Scroll input requests a frame (demand rendering).
  useEffect(() => {
    progress.onChange = invalidate;
    return () => {
      if (progress.onChange === invalidate) progress.onChange = undefined;
    };
  }, [invalidate]);

  useFrame((_, delta) => {
    // After a pause the clock delta spans the idle time: damp with the typical frame interval so
    // the motion is the same as with continuous rendering.
    const wasAsleep = perf.asleep;
    const dt = wasAsleep ? perf.typicalDt : delta;
    if (!wasAsleep && delta < 0.1) perf.typicalDt += (delta - perf.typicalDt) * 0.1;
    sceneState.p = damp(sceneState.p, progress.target, 6, dt);
    // The last frame before sleeping lands exactly on the target: the resting image is the one
    // continuous damping converges to (stopping 1e-4 short was a visible camera offset).
    const settling = Math.abs(sceneState.p - progress.target) > 1e-4;
    if (!settling) sceneState.p = progress.target;
    sceneState.portrait = size.width / size.height < 0.85;
    const pose = sampleCamera(sceneState.p, sceneState.portrait ? PORTRAIT_KEYS : LANDSCAPE_KEYS);
    camera.position.set(pose.position[0], pose.position[1], pose.position[2]);
    look.set(pose.target[0], pose.target[1], pose.target[2]);
    camera.lookAt(look);
    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(cam.fov - pose.fov) > 0.01) {
      cam.fov = pose.fov;
      cam.updateProjectionMatrix();
    }
    // Transition: the scene yields to the portfolio (canvas fades; HTML takes over).
    if (fadeTarget.current) {
      fadeTarget.current.style.opacity = String(
        1 - smoothstep(actProgress(sceneState.p, 'transition') * 1.15),
      );
    }

    // Adaptive resolution: sustained slow frames lower the pixel ratio (never below 1). Only
    // consecutive frames count (idle gaps between on-demand frames are not slow frames).
    if (!wasAsleep && delta < 0.25) {
      perf.acc += delta;
      perf.frames += 1;
      perf.fpsAcc += delta;
      perf.fpsFrames += 1;
    }
    if (perf.fpsAcc > 1) {
      perf.fps = perf.fpsFrames / perf.fpsAcc;
      perf.fpsAcc = 0;
      perf.fpsFrames = 0;
    }
    let publish = perf.first || !settling;
    if (perf.frames >= 120) {
      const avg = perf.acc / perf.frames;
      const ratio = gl.getPixelRatio();
      if (avg > 1 / 40 && ratio > 1) gl.setPixelRatio(Math.max(1, ratio - 0.25));
      perf.acc = 0;
      perf.frames = 0;
      publish = true;
    }
    // After this frame's render (same tick): gl.info then describes this frame, not the previous one.
    if (publish) queueMicrotask(() => publishStats(gl, tier, perf.fps));
    if (perf.first) {
      perf.first = false;
      performance.mark('cinematic:first-frame');
      requestAnimationFrame(onFirstFrame); // the canvas is shown once a real frame exists
    }
    perf.asleep = !settling;
    if (settling) invalidate();
  });

  return null;
}

/** Restrained studio lighting: one neutral key, one cool rim, a low fill. No coloured wash. */
export function Lights({ shadows }: { shadows: boolean }) {
  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight
        position={[10, 9, 6]}
        intensity={1.6}
        color="#f1f3f6"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={6}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-6, 3, -8]} intensity={0.9} color={PALETTE.blue} />
      <pointLight position={[6.5, 1.6, 2.5]} intensity={6} distance={9} decay={2} color="#cfd8e3" />
    </>
  );
}
