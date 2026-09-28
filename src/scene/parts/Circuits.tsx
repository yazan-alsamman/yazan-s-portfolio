'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { seeded } from '../random';
import { actEnvelope, actProgress, smoothstep } from '../timeline';
import { PALETTE, sceneState } from '../state';

/**
 * ACT II (ignition): orthogonal computational paths etched into the floor, radiating from the
 * origin like routed traces. Energy propagates outward strictly as a function of scroll
 * (each vertex carries its normalized distance along its path; the lit front is uFront).
 */
export function Circuits({ paths }: { paths: number }) {
  const { geometry, material } = useMemo(() => {
    const rand = seeded(23);
    const positions: number[] = [];
    const dists: number[] = [];
    const y = -1.985;
    for (let i = 0; i < paths; i++) {
      const angle = (i / paths) * Math.PI * 2 + rand() * 0.3;
      let x = Math.cos(angle) * 0.6;
      let z = Math.sin(angle) * 0.6;
      const pts: [number, number][] = [[x, z]];
      const segments = 3 + Math.floor(rand() * 4);
      let horizontal = rand() > 0.5;
      for (let s = 0; s < segments; s++) {
        const len = 1.2 + rand() * 3.2;
        if (horizontal) x += Math.sign(Math.cos(angle) || 1) * len;
        else z += Math.sign(Math.sin(angle) || 1) * len;
        pts.push([x, z]);
        horizontal = !horizontal;
      }
      // Cumulative length → normalized distance along the path.
      const lens = [0];
      for (let k = 1; k < pts.length; k++)
        lens.push(lens[k - 1]! + Math.hypot(pts[k]![0] - pts[k - 1]![0], pts[k]![1] - pts[k - 1]![1]));
      const total = lens.at(-1)!;
      const offset = rand() * 0.25; // staggered start per path
      for (let k = 1; k < pts.length; k++) {
        positions.push(pts[k - 1]![0], y, pts[k - 1]![1], pts[k]![0], y, pts[k]![1]);
        dists.push(offset + (lens[k - 1]! / total) * 0.75, offset + (lens[k]! / total) * 0.75);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aDist', new THREE.Float32BufferAttribute(dists, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uFront: { value: 0 },
        uOpacity: { value: 0 },
        uBase: { value: new THREE.Color(PALETTE.steel) },
        uSignal: { value: new THREE.Color(PALETTE.cyan) },
      },
      vertexShader: /* glsl */ `
        attribute float aDist; varying float vDist; varying float vDepth;
        void main() {
          vDist = aDist;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vDepth = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uFront; uniform float uOpacity; uniform vec3 uBase; uniform vec3 uSignal;
        varying float vDist; varying float vDepth;
        void main() {
          float lit = step(vDist, uFront);
          float edge = smoothstep(0.06, 0.0, abs(uFront - vDist)) * step(uFront, 1.02);
          vec3 col = mix(uBase * 0.6, uSignal * 0.55, lit) + uSignal * edge * 1.4;
          float fog = exp(-vDepth * 0.04);
          gl_FragColor = vec4(col, uOpacity * fog * (0.35 + 0.65 * max(lit, edge)));
        }`,
    });
    return { geometry, material };
  }, [paths]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(() => {
    const p = sceneState.p;
    material.uniforms.uFront!.value = smoothstep(actProgress(p, 'ignition')) * 1.08;
    material.uniforms.uOpacity!.value = actEnvelope(p, 'ignition', 'systems', 0.05);
  });

  return <lineSegments geometry={geometry} material={material} frustumCulled={false} />;
}
