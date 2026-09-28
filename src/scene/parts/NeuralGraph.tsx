'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { seeded } from '../random';
import { actEnvelope, actProgress, remap, smoothstep } from '../timeline';
import { PALETTE, sceneState } from '../state';

export const GRAPH_CENTER = new THREE.Vector3(0, 1, 0);
const LAYERS = 5;

export type GraphLayout = { targets: THREE.Vector3[]; layerOf: number[]; outputs: THREE.Vector3[] };

export function buildGraph(nodesPerLayer: number): GraphLayout {
  const rand = seeded(37);
  const targets: THREE.Vector3[] = [];
  const layerOf: number[] = [];
  for (let l = 0; l < LAYERS; l++) {
    const x = -3.4 + (l / (LAYERS - 1)) * 6.8;
    // Inner layers wider than input/output: an abstract, non-literal "model" silhouette.
    const count = l === 0 || l === LAYERS - 1 ? Math.max(4, Math.round(nodesPerLayer * 0.55)) : nodesPerLayer;
    const radius = 0.9 + Math.sin((l / (LAYERS - 1)) * Math.PI) * 0.9;
    for (let n = 0; n < count; n++) {
      const a = (n / count) * Math.PI * 2 + l * 0.37;
      targets.push(
        new THREE.Vector3(
          x + (rand() - 0.5) * 0.25,
          GRAPH_CENTER.y + Math.sin(a) * radius * 0.82,
          Math.cos(a) * radius,
        ),
      );
      layerOf.push(l);
    }
  }
  const outputs = targets.filter((_, i) => layerOf[i] === LAYERS - 1);
  return { targets, layerOf, outputs };
}

/**
 * ACT III (intelligence): an abstract layered graph. Nodes assemble out of scattered data
 * (scroll-driven), then connections appear and an activation wave travels input → output.
 * No brain, no head, no glow-orb: topology only. Persists (dimmed) through SYSTEMS.
 */
export function NeuralGraph({ layout }: { layout: GraphLayout }) {
  const nodes = useRef<THREE.InstancedMesh>(null);
  const { starts, edgeGeometry, edgeMaterial, nodeGeometry, nodeMaterial } = useMemo(() => {
    const rand = seeded(41);
    const starts = layout.targets.map(
      () => new THREE.Vector3((rand() - 0.5) * 30, -1.5 + rand() * 10, -6 - rand() * 18),
    );
    const positions: number[] = [];
    const wave: number[] = [];
    layout.targets.forEach((from, i) => {
      const l = layout.layerOf[i]!;
      if (l === LAYERS - 1) return;
      const next = layout.targets.map((t, j) => ({ t, j })).filter(({ j }) => layout.layerOf[j] === l + 1);
      const fanOut = 2 + Math.floor(rand() * 2);
      for (let k = 0; k < fanOut; k++) {
        const to = next[Math.floor(rand() * next.length)]!.t;
        positions.push(from.x, from.y, from.z, to.x, to.y, to.z);
        wave.push(l / (LAYERS - 1), (l + 1) / (LAYERS - 1));
      }
    });
    const edgeGeometry = new THREE.BufferGeometry();
    edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    edgeGeometry.setAttribute('aWave', new THREE.Float32BufferAttribute(wave, 1));
    const edgeMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uOpacity: { value: 0 },
        uWave: { value: -1 },
        uBase: { value: new THREE.Color(PALETTE.mist) },
        uSignal: { value: new THREE.Color(PALETTE.violet) },
      },
      vertexShader: /* glsl */ `
        attribute float aWave; varying float vWave;
        void main() { vWave = aWave; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uOpacity; uniform float uWave; uniform vec3 uBase; uniform vec3 uSignal; varying float vWave;
        void main() {
          float pulse = smoothstep(0.16, 0.0, abs(vWave - uWave));
          vec3 col = uBase * 0.22 + uSignal * pulse * 0.9;
          gl_FragColor = vec4(col, uOpacity * (0.28 + pulse * 0.72));
        }`,
    });
    const nodeGeometry = new THREE.IcosahedronGeometry(0.032, 1);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: PALETTE.cloud, transparent: true, opacity: 0 });
    return { starts, edgeGeometry, edgeMaterial, nodeGeometry, nodeMaterial };
  }, [layout]);

  useEffect(
    () => () => {
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
    },
    [edgeGeometry, edgeMaterial, nodeGeometry, nodeMaterial],
  );

  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), v: new THREE.Vector3() }), []);

  useFrame(() => {
    const mesh = nodes.current;
    if (!mesh) return;
    const p = sceneState.p;
    const intel = actProgress(p, 'intelligence');
    const visible = actEnvelope(p, 'intelligence', 'human', 0.05);
    const formation = remap(intel, 0, 0.55); // nodes assemble in the first half of the act
    layout.targets.forEach((target, i) => {
      // Staggered by layer: structure forms input → output.
      const local = smoothstep(
        remap(formation, (layout.layerOf[i]! / LAYERS) * 0.5, 0.5 + (layout.layerOf[i]! / LAYERS) * 0.5),
      );
      tmp.v.copy(starts[i]!).lerp(target, local);
      tmp.m.makeTranslation(tmp.v.x, tmp.v.y, tmp.v.z);
      mesh.setMatrixAt(i, tmp.m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    // Human intent: the model recedes so the person carries the frame.
    const recede = 1 - 0.9 * smoothstep(actProgress(p, 'human') * 3);
    nodeMaterial.opacity = visible * (0.35 + 0.65 * formation) * recede;
    // Connections only once the structure exists; the wave then travels through the layers.
    const connected = smoothstep(remap(intel, 0.5, 0.75));
    const systems = actProgress(p, 'systems');
    edgeMaterial.uniforms.uOpacity!.value = visible * connected * recede;
    edgeMaterial.uniforms.uWave!.value =
      systems > 0 ? ((systems * 2) % 1.3) - 0.15 : remap(intel, 0.6, 1) * 1.3 - 0.15;
  });

  return (
    <group>
      <lineSegments geometry={edgeGeometry} material={edgeMaterial} frustumCulled={false} />
      <instancedMesh
        ref={nodes}
        args={[nodeGeometry, nodeMaterial, layout.targets.length]}
        frustumCulled={false}
      />
    </group>
  );
}
