'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { seeded } from '../random';
import { actEnvelope, actProgress, smoothstep } from '../timeline';
import { PALETTE, sceneState } from '../state';

/**
 * ACT I (arrival) + ACT VII (identity): a sparse, static point field — distant data at rest.
 * Points never wander on their own: brightness and the final collapse into a single horizon
 * line are functions of scroll progress only (deterministic).
 * Also the architectural floor grid that anchors the space.
 */
export function Field({ count }: { count: number }) {
  const { geometry, material } = useMemo(() => {
    const rand = seeded(11);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Wide, shallow volume, denser toward the horizon — reads as architecture, not "space".
      const r = 6 + Math.pow(rand(), 0.6) * 34;
      const a = rand() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = -1.8 + Math.pow(rand(), 2.2) * 14;
      pos[i * 3 + 2] = Math.sin(a) * r - 6;
      seed[i] = rand();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uOpacity: { value: 0 },
        uCollapse: { value: 0 },
        uColor: { value: new THREE.Color(PALETTE.mist) },
        uAccent: { value: new THREE.Color(PALETTE.cyan) },
        uPixelRatio: { value: 1 },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uCollapse; uniform float uPixelRatio;
        varying float vSeed; varying float vDepth;
        void main() {
          vec3 p = position;
          // Identity: the system simplifies into one horizon line.
          vec3 horizon = vec3(p.x * 0.9, 0.0, -8.0 + (aSeed - 0.5) * 0.6);
          p = mix(p, horizon, uCollapse);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          vDepth = -mv.z; vSeed = aSeed;
          gl_PointSize = (1.2 + aSeed * 1.8) * uPixelRatio * (22.0 / max(-mv.z, 1.0));
        }`,
      fragmentShader: /* glsl */ `
        uniform float uOpacity; uniform vec3 uColor; uniform vec3 uAccent;
        varying float vSeed; varying float vDepth;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float soft = smoothstep(0.5, 0.0, d);
          float fog = exp(-vDepth * 0.035);
          vec3 col = mix(uColor, uAccent, step(0.965, vSeed)); // ~3.5% signal points
          gl_FragColor = vec4(col, soft * uOpacity * fog * (0.35 + vSeed * 0.65));
        }`,
    });
    return { geometry, material };
  }, [count]);

  const grid = useMemo(() => {
    const g = new THREE.GridHelper(80, 40, PALETTE.steel, PALETTE.steel);
    g.position.y = -2;
    const m = g.material as THREE.LineBasicMaterial;
    m.transparent = true;
    m.opacity = 0;
    m.depthWrite = false;
    return g;
  }, []);

  const horizon = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(120, 1.4);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uOpacity: { value: 0 },
        uA: { value: new THREE.Color(PALETTE.cyan) },
        uB: { value: new THREE.Color(PALETTE.violet) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uOpacity; uniform vec3 uA; uniform vec3 uB; varying vec2 vUv;
        void main() {
          float d = abs(vUv.y - 0.5) * 2.0;
          float line = exp(-d * 38.0) + exp(-d * 5.0) * 0.18;
          float edge = smoothstep(0.0, 0.35, vUv.x) * smoothstep(1.0, 0.65, vUv.x);
          gl_FragColor = vec4(mix(uA, uB, vUv.x), line * edge * uOpacity * 0.7);
        }`,
    });
    return { geometry, material };
  }, []);

  useEffect(
    () => () => {
      horizon.geometry.dispose();
      horizon.material.dispose();
      geometry.dispose();
      material.dispose();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
    },
    [geometry, material, grid, horizon],
  );

  useFrame(({ gl }) => {
    const p = sceneState.p;
    const arrival = 0.45 + 0.55 * smoothstep(actProgress(p, 'arrival') * 1.4);
    const fadeOut = 1 - smoothstep(actProgress(p, 'transition'));
    material.uniforms.uOpacity!.value = (0.25 + 0.75 * arrival) * fadeOut;
    material.uniforms.uCollapse!.value = smoothstep(actProgress(p, 'identity'));
    material.uniforms.uPixelRatio!.value = gl.getPixelRatio();
    (grid.material as THREE.LineBasicMaterial).opacity =
      0.3 * actEnvelope(p, 'arrival', 'systems', 0.06) * arrival;
    // Horizon of signal: present on arrival, yields to the circuits, returns for identity.
    horizon.material.uniforms.uOpacity!.value =
      Math.max(
        1 - smoothstep(actProgress(p, 'ignition') * 1.5),
        smoothstep(actProgress(p, 'identity') * 1.5),
      ) * fadeOut;
  });

  return (
    <>
      <points geometry={geometry} material={material} frustumCulled={false} />
      <primitive object={grid} />
      <mesh
        geometry={horizon.geometry}
        material={horizon.material}
        position={[0, -1.6, -34]}
        frustumCulled={false}
      />
    </>
  );
}
