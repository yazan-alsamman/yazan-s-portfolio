'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { actEnvelope, actProgress, smoothstep } from '../timeline';
import { PALETTE, sceneState } from '../state';

/**
 * ACT V (systems) → ACT VI (human intent): the connective tissue. Curves drawn by scroll:
 *   graph outputs → actuator (intelligence becomes engineered action), then
 *   every subsystem → the portrait (the whole system traces back to its human origin).
 */
function curves(pairs: [THREE.Vector3, THREE.Vector3][], lift: number, stage: number) {
  const positions: number[] = [];
  const draw: number[] = [];
  const stages: number[] = [];
  const SEG = 40;
  for (const [a, b] of pairs) {
    const mid = a.clone().lerp(b, 0.5);
    mid.y += lift + a.distanceTo(b) * 0.12;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const pts = curve.getPoints(SEG);
    for (let i = 1; i < pts.length; i++) {
      positions.push(pts[i - 1]!.x, pts[i - 1]!.y, pts[i - 1]!.z, pts[i]!.x, pts[i]!.y, pts[i]!.z);
      draw.push((i - 1) / SEG, i / SEG);
      stages.push(stage, stage);
    }
  }
  return { positions, draw, stages };
}

export function Links({
  graphOutputs,
  effector,
  portrait,
}: {
  graphOutputs: THREE.Vector3[];
  effector: THREE.Vector3;
  portrait: THREE.Vector3;
}) {
  const { geometry, material } = useMemo(() => {
    const toArm = curves(
      graphOutputs.map((o) => [o, effector] as [THREE.Vector3, THREE.Vector3]),
      0.6,
      0,
    );
    const sources = [
      ...graphOutputs.slice(0, 3),
      effector,
      new THREE.Vector3(0.5, -1.98, 0.4),
      new THREE.Vector3(-3.4, 1, 0),
    ];
    const toHuman = curves(
      sources.map(
        (s, i) =>
          [s, portrait.clone().add(new THREE.Vector3(1.1, -0.6 + i * 0.28, 0.1))] as [
            THREE.Vector3,
            THREE.Vector3,
          ],
      ),
      0.4,
      1,
    );
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([...toArm.positions, ...toHuman.positions], 3),
    );
    geometry.setAttribute('aDraw', new THREE.Float32BufferAttribute([...toArm.draw, ...toHuman.draw], 1));
    geometry.setAttribute(
      'aStage',
      new THREE.Float32BufferAttribute([...toArm.stages, ...toHuman.stages], 1),
    );
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uDraw0: { value: 0 },
        uDraw1: { value: 0 },
        uOpacity: { value: 0 },
        uA: { value: new THREE.Color(PALETTE.blue) },
        uB: { value: new THREE.Color(PALETTE.cyan) },
      },
      vertexShader: /* glsl */ `
        attribute float aDraw; attribute float aStage; varying float vDraw; varying float vStage;
        void main() { vDraw = aDraw; vStage = aStage; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uDraw0; uniform float uDraw1; uniform float uOpacity; uniform vec3 uA; uniform vec3 uB;
        varying float vDraw; varying float vStage;
        void main() {
          float drawn = vStage < 0.5 ? uDraw0 : uDraw1;
          float on = step(vDraw, drawn);
          float head = smoothstep(0.08, 0.0, abs(vDraw - drawn)) * step(drawn, 0.999);
          vec3 col = mix(uA, uB, vStage) * (0.45 + head);
          gl_FragColor = vec4(col, uOpacity * (on * 0.55 + head * 0.6));
        }`,
    });
    return { geometry, material };
  }, [graphOutputs, effector, portrait]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(() => {
    const p = sceneState.p;
    material.uniforms.uDraw0!.value = smoothstep(actProgress(p, 'systems') * 1.25);
    material.uniforms.uDraw1!.value = smoothstep(actProgress(p, 'human') * 1.6);
    material.uniforms.uOpacity!.value =
      actEnvelope(p, 'systems', 'human', 0.05) * (1 - smoothstep(actProgress(p, 'identity') * 2));
  });

  return <lineSegments geometry={geometry} material={material} frustumCulled={false} />;
}
