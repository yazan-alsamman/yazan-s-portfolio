'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Tier } from '../quality';
import { seeded } from '../random';
import { actProgress, damp, remap, smoothstep } from '../timeline';
import { PALETTE, sceneState } from '../state';
import { corePose } from '../core-path';

/**
 * ACT I (arrival) → ACT II (ignition) → ACT III (intelligence): the Inference Core — the hero
 * object of the landing (design evolution phase). A manufactured AI module read bottom → top:
 *
 *   substrate + contact pins      the machine's interface to the world
 *   heat-spreader frame           engineering constraint (power, heat)
 *   three silicon die layers      the model: layered computation, traces routed in silicon
 *   optical sensor                perception: where data enters the system
 *
 * Scroll narrative (every value is a function of the damped progress — no wall clock):
 *   arrival      sensor wakes, the assembly opens into an exploded axonometric (its architecture)
 *   ignition     it re-assembles, docks at the origin of the floor and fires: an activation front
 *                crosses each die (sensor → data → processing) and continues into the floor
 *                circuits, which already radiate from this origin (approved Phase 3 act)
 *   intelligence it dims while the neural graph above it takes the frame (inference), then yields
 * A fine pointer tilts it slightly (desktop, arrival only); frames render on demand only.
 *
 * Budget (design evolution report §19): 10 draw calls, < 6k triangles, 2 × 256² + 1 × 128²
 * canvas textures, no lights added (the scene's lights and environment are shared).
 */

/** Rounded square in the XZ plane, `height` thick along +Y, with a machined bevel. */
function plate(size: number, height: number, radius: number, bevel: number, hole?: number) {
  const s = new THREE.Shape();
  const h = size / 2;
  s.moveTo(-h + radius, -h);
  s.lineTo(h - radius, -h);
  s.quadraticCurveTo(h, -h, h, -h + radius);
  s.lineTo(h, h - radius);
  s.quadraticCurveTo(h, h, h - radius, h);
  s.lineTo(-h + radius, h);
  s.quadraticCurveTo(-h, h, -h, h - radius);
  s.lineTo(-h, -h + radius);
  s.quadraticCurveTo(-h, -h, -h + radius, -h);
  if (hole) {
    const q = hole / 2;
    const path = new THREE.Path();
    path.moveTo(-q, -q);
    path.lineTo(-q, q);
    path.lineTo(q, q);
    path.lineTo(q, -q);
    path.lineTo(-q, -q);
    s.holes.push(path);
  }
  const g = new THREE.ExtrudeGeometry(s, {
    depth: Math.max(height - bevel * 2, 0.001),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 5,
  });
  g.rotateX(-Math.PI / 2); // extrude along +Y
  g.translate(0, bevel, 0);
  // Planar UVs (0–1 across the plate's top face) so textures map square on every layer.
  const pos = g.attributes.position!;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / size + 0.5;
    uv[i * 2 + 1] = pos.getZ(i) / size + 0.5;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

/** Silicon routing: Manhattan traces, pads and cell blocks (emissive map, generated). */
function traceTexture(seed: number, density: number) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = seeded(seed);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  // Cell blocks: the compute fabric (dim).
  for (let i = 0; i < 26 * density; i++) {
    const w = 8 + Math.floor(rand() * 26);
    const h = 6 + Math.floor(rand() * 18);
    const x = 14 + Math.floor(rand() * (size - 28 - w));
    const y = 14 + Math.floor(rand() * (size - 28 - h));
    ctx.fillStyle = `rgba(255,255,255,${0.05 + rand() * 0.07})`;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }
  // Routed traces (bright), always orthogonal, ending on a pad.
  ctx.lineCap = 'square';
  for (let i = 0; i < 60 * density; i++) {
    let x = 10 + Math.floor(rand() * (size - 20));
    let y = 10 + Math.floor(rand() * (size - 20));
    ctx.strokeStyle = `rgba(255,255,255,${0.35 + rand() * 0.55})`;
    ctx.lineWidth = rand() > 0.85 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x + 0.5, y + 0.5);
    const turns = 2 + Math.floor(rand() * 3);
    for (let t = 0; t < turns; t++) {
      const len = 10 + rand() * 60;
      if (t % 2 === 0) x = Math.min(size - 8, Math.max(8, x + (rand() > 0.5 ? len : -len)));
      else y = Math.min(size - 8, Math.max(8, y + (rand() > 0.5 ? len : -len)));
      ctx.lineTo(Math.round(x) + 0.5, Math.round(y) + 0.5);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(Math.round(x) - 1.5, Math.round(y) - 1.5, 3, 3);
  }
  // Seal ring around the die edge.
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.strokeRect(4.5, 4.5, size - 9, size - 9);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Brushed-metal roughness: fine directional streaks (subtle machining imperfection). */
function brushedTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = seeded(5);
  ctx.fillStyle = 'rgb(118,118,118)';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 420; i++) {
    const v = 90 + Math.floor(rand() * 70);
    ctx.fillStyle = `rgba(${v},${v},${v},0.5)`;
    ctx.fillRect(0, Math.floor(rand() * size), size, 1);
  }
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

const LAYERS = [
  { size: 1.62, y: 0.3, explode: 0.42, seed: 71, density: 1.2 },
  { size: 1.26, y: 0.39, explode: 0.84, seed: 73, density: 1 },
  { size: 0.92, y: 0.48, explode: 1.26, seed: 79, density: 0.8 },
] as const;
const DIE_THICKNESS = 0.055;
const FRAME_EXPLODE = 0.2;
const SENSOR_Y = 0.535;
const SENSOR_EXPLODE = 1.72;

/** Activation front across a die (radial from the centre), injected into the physical shader. */
function withActivation(material: THREE.MeshPhysicalMaterial) {
  const front = { value: 0 };
  const idle = { value: 0 };
  material.userData.front = front;
  material.userData.idle = idle;
  material.customProgramCacheKey = () => 'inference-core-die';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFront = front;
    shader.uniforms.uIdle = idle;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uFront;\nuniform float uIdle;')
      .replace(
        '#include <emissivemap_fragment>',
        /* glsl */ `#include <emissivemap_fragment>
        float coreR = length(vEmissiveMapUv - 0.5) * 1.4142;
        float coreLit = smoothstep(uFront, uFront - 0.3, coreR);
        float coreEdge = smoothstep(0.07, 0.0, abs(coreR - uFront)) * step(uFront, 1.05);
        totalEmissiveRadiance *= max(uIdle, 0.1 + 0.9 * coreLit) + coreEdge * 2.4;`,
      );
  };
  return front;
}

export function InferenceCore({ tier }: { tier: Exclude<Tier, 'static'> }) {
  const root = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const frame = useRef<THREE.Mesh>(null);
  const dies = useRef<(THREE.Mesh | null)[]>([]);
  const sensor = useRef<THREE.Group>(null);
  const pointer = useMemo(() => ({ tx: 0, ty: 0, x: 0, y: 0 }), []);
  const invalidate = useThree((s) => s.invalidate);
  // RTL layouts put the identity on the right: the core takes the mirrored side (read once).
  const rtl = useMemo(() => document.documentElement.dir === 'rtl', []);

  const assets = useMemo(() => {
    const rich = tier !== 'low';
    const brushed = brushedTexture();
    const substrateMat = new THREE.MeshPhysicalMaterial({
      color: '#1b2027',
      metalness: 0.82,
      roughness: 0.44,
      roughnessMap: brushed,
      clearcoat: 0.35,
      clearcoatRoughness: 0.35,
      transparent: true,
    });
    const steelMat = new THREE.MeshPhysicalMaterial({
      color: '#a3abb5',
      metalness: 1,
      roughness: 0.3,
      roughnessMap: brushed,
      transparent: true,
    });
    // Contacts: a restrained warm nickel-gold — the one warm note in the object.
    const contactMat = new THREE.MeshPhysicalMaterial({
      color: '#bfae8a',
      metalness: 1,
      roughness: 0.28,
      transparent: true,
    });
    const traces = LAYERS.map((l) => traceTexture(l.seed, l.density));
    const dieMats = LAYERS.map((_, i) => {
      const m = new THREE.MeshPhysicalMaterial({
        color: '#06080b',
        metalness: 0.15,
        roughness: 0.34,
        clearcoat: 0.2,
        clearcoatRoughness: 0.2,
        // Silicon stays dark under the key light and the studio environment: a mirror-white plate
        // reads as bare aluminium, not as a die.
        specularIntensity: 0.2,
        envMapIntensity: 0.35,
        // Thin-film interference: the faint spectral sheen of a real silicon wafer (not neon).
        iridescence: rich ? 0.35 : 0,
        iridescenceIOR: 1.35,
        iridescenceThicknessRange: [180, 420],
        emissive: new THREE.Color(PALETTE.cyan),
        emissiveMap: traces[i]!,
        emissiveIntensity: 0,
        transparent: true,
      });
      withActivation(m);
      return m;
    });
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: '#04060a',
      metalness: 0.1,
      roughness: 0.04,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.6,
      transparent: true,
    });
    const irisMat = new THREE.MeshBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0 });

    const seg = rich ? 64 : 40;
    const housingProfile = [
      [0.2, 0],
      [0.44, 0],
      [0.44, 0.07],
      [0.4, 0.085],
      [0.4, 0.15],
      [0.37, 0.165],
      [0.35, 0.24],
      [0.29, 0.25],
      [0.28, 0.2],
    ].map(([x, y]) => new THREE.Vector2(x!, y!));

    const pin = new THREE.BoxGeometry(0.045, 0.03, 0.14);
    const geos = {
      substrate: plate(2.4, 0.16, 0.12, 0.02),
      frame: plate(1.9, 0.09, 0.08, 0.012, 1.7),
      die: LAYERS.map((l) => plate(l.size, DIE_THICKNESS, 0.035, 0.008)),
      housing: new THREE.LatheGeometry(housingProfile, seg),
      lens: new THREE.SphereGeometry(0.29, seg, rich ? 24 : 14, 0, Math.PI * 2, 0, Math.PI / 2),
      iris: new THREE.TorusGeometry(0.2, 0.006, 6, seg),
      pin,
      screw: new THREE.CylinderGeometry(0.06, 0.06, 0.05, 20),
    };
    geos.lens.scale(1, 0.42, 1);

    // 4 edges × 16 contacts, one instanced draw.
    const PER_EDGE = 16;
    const pins = new THREE.InstancedMesh(geos.pin, contactMat, PER_EDGE * 4);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    let k = 0;
    for (let e = 0; e < 4; e++) {
      q.setFromAxisAngle(up, (e * Math.PI) / 2);
      for (let i = 0; i < PER_EDGE; i++) {
        const along = -1.02 + (i / (PER_EDGE - 1)) * 2.04;
        const v = new THREE.Vector3(along, 0.05, 1.24).applyQuaternion(q);
        m.compose(v, q, new THREE.Vector3(1, 1, 1));
        pins.setMatrixAt(k++, m);
      }
    }
    pins.instanceMatrix.needsUpdate = true;

    const screws = new THREE.InstancedMesh(geos.screw, steelMat, 4);
    [
      [-1.02, -1.02],
      [1.02, -1.02],
      [1.02, 1.02],
      [-1.02, 1.02],
    ].forEach(([x, z], i) => {
      m.makeTranslation(x!, 0.185, z!);
      screws.setMatrixAt(i, m);
    });
    screws.instanceMatrix.needsUpdate = true;

    return {
      brushed,
      traces,
      substrateMat,
      steelMat,
      contactMat,
      dieMats,
      lensMat,
      irisMat,
      geos,
      pins,
      screws,
    };
  }, [tier]);

  useEffect(
    () => () => {
      assets.brushed.dispose();
      assets.traces.forEach((t) => t.dispose());
      [assets.substrateMat, assets.steelMat, assets.contactMat, assets.lensMat, assets.irisMat].forEach((m) =>
        m.dispose(),
      );
      assets.dieMats.forEach((m) => m.dispose());
      const { die, ...rest } = assets.geos;
      die.forEach((g) => g.dispose());
      Object.values(rest).forEach((g) => g.dispose());
      assets.pins.dispose();
      assets.screws.dispose();
    },
    [assets],
  );

  // Pointer tilt: fine pointers only, and only while the core is the hero (arrival act).
  useEffect(() => {
    if (tier === 'low' || !window.matchMedia('(pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (sceneState.p < 0.16) invalidate();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [tier, pointer, invalidate]);

  useFrame((_, delta) => {
    const g = root.current;
    if (!g || !tilt.current || !sensor.current || !frame.current) return;
    const p = sceneState.p;
    const arrival = actProgress(p, 'arrival');
    const ignition = actProgress(p, 'ignition');
    const intel = actProgress(p, 'intelligence');

    const visible = 1 - smoothstep(remap(intel, 0.35, 0.8));
    g.visible = visible > 0.002;
    if (!g.visible) return;

    const pose = corePose(p, sceneState.portrait, rtl);
    g.position.set(pose.position[0], pose.position[1], pose.position[2]);
    g.rotation.set(pose.rotation[0], pose.rotation[1], pose.rotation[2]);
    g.scale.setScalar(pose.scale);

    // Exploded axonometric during arrival; re-assembled for docking in the first half of ignition.
    const open = smoothstep(remap(arrival, 0.2, 0.95)) * (1 - smoothstep(remap(ignition, 0, 0.45)));
    frame.current.position.y = 0.16 + FRAME_EXPLODE * open;
    LAYERS.forEach((l, i) => {
      const d = dies.current[i];
      if (d) d.position.y = l.y + l.explode * open;
    });
    sensor.current.position.y = SENSOR_Y + SENSOR_EXPLODE * open;

    // Perception → processing: the sensor wakes on arrival; activation crosses the dies bottom-up
    // (top die first: data enters at the sensor) during ignition, in step with the floor circuits.
    const wake = 0.35 + 0.65 * smoothstep(remap(arrival, 0, 0.6));
    const dim = 1 - 0.75 * smoothstep(remap(intel, 0, 0.5));
    assets.irisMat.opacity = visible * wake * (0.55 + 0.45 * (1 - open * 0.5)) * dim;
    assets.dieMats.forEach((m, i) => {
      const order = LAYERS.length - 1 - i; // top die (sensor side) activates first
      const front = remap(ignition, 0.3 + order * 0.12, 0.72 + order * 0.1) * 1.15;
      (m.userData.front as { value: number }).value = front;
      (m.userData.idle as { value: number }).value = open; // exploded: the whole routing is visible
      // A faint idle glow shows the routing in the exploded view before the system fires.
      m.emissiveIntensity = (0.9 * open + 1.25 * smoothstep(remap(ignition, 0.25, 0.5))) * dim;
    });
    const opacity = visible;
    [assets.substrateMat, assets.steelMat, assets.contactMat, assets.lensMat, ...assets.dieMats].forEach(
      (m) => (m.opacity = opacity),
    );

    // Pointer tilt, damped; fades out once the core leaves the hero position.
    const hero = 1 - smoothstep(remap(p, 0.08, 0.16));
    pointer.x = damp(pointer.x, pointer.tx * hero, 4, delta);
    pointer.y = damp(pointer.y, pointer.ty * hero, 4, delta);
    tilt.current.rotation.set(pointer.y * 0.09, pointer.x * 0.14, 0);
    if (Math.abs(pointer.x - pointer.tx * hero) + Math.abs(pointer.y - pointer.ty * hero) > 1e-3)
      invalidate();
  });

  const { geos, substrateMat, steelMat, dieMats, lensMat, irisMat, pins, screws } = assets;
  return (
    <group ref={root}>
      <group ref={tilt}>
        <mesh geometry={geos.substrate} material={substrateMat} />
        <primitive object={pins} />
        <primitive object={screws} />
        <mesh ref={frame} geometry={geos.frame} material={steelMat} position-y={0.16} />
        {LAYERS.map((l, i) => (
          <mesh
            key={l.seed}
            ref={(m) => {
              dies.current[i] = m;
            }}
            geometry={geos.die[i]}
            material={dieMats[i]}
            position-y={l.y}
          />
        ))}
        <group ref={sensor} position-y={SENSOR_Y}>
          <mesh geometry={geos.housing} material={steelMat} />
          <mesh geometry={geos.lens} material={lensMat} position-y={0.2} />
          <mesh geometry={geos.iris} material={irisMat} position-y={0.292} rotation-x={-Math.PI / 2} />
        </group>
      </group>
    </group>
  );
}
