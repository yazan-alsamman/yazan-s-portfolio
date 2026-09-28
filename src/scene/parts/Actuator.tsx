'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { actEnvelope, actProgress, remap, smoothstep } from '../timeline';
import { PALETTE, sceneState } from '../state';

export const ACTUATOR_BASE = new THREE.Vector3(7, -2, -1);

/** Machined link: rounded-rectangle profile extruded along +Y with a small chamfer. */
function linkGeometry(width: number, depth: number, length: number, radius: number) {
  const s = new THREE.Shape();
  const w = width / 2;
  const d = depth / 2;
  s.moveTo(-w + radius, -d);
  s.lineTo(w - radius, -d);
  s.quadraticCurveTo(w, -d, w, -d + radius);
  s.lineTo(w, d - radius);
  s.quadraticCurveTo(w, d, w - radius, d);
  s.lineTo(-w + radius, d);
  s.quadraticCurveTo(-w, d, -w, d - radius);
  s.lineTo(-w, -d + radius);
  s.quadraticCurveTo(-w, -d, -w + radius, -d);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: length,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.014,
    bevelSegments: 2,
    curveSegments: 6,
  });
  g.rotateX(-Math.PI / 2); // extrude along +Y
  return g;
}

/** 2×2 twill carbon weave, generated procedurally (no external texture). */
function carbonTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cell = size / 8;
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const on = (x + y) % 4 < 2;
      const grad = ctx.createLinearGradient(
        x * cell,
        y * cell,
        (x + (on ? 1 : 0)) * cell,
        (y + (on ? 0 : 1)) * cell,
      );
      grad.addColorStop(0, on ? '#1b1f25' : '#0c0e11');
      grad.addColorStop(1, on ? '#0e1115' : '#1a1d22');
      ctx.fillStyle = grad;
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 8);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * ACT IV (engineering): a restrained six-axis-style actuator. It assembles from an exploded
 * state (first half of the act), then articulates through physically plausible poses —
 * every angle is a function of scroll progress. No sci-fi ornament: anodized aluminium,
 * brushed steel, carbon fibre, one thin signal ring per joint.
 */
export function Actuator({ shadows }: { shadows: boolean }) {
  const root = useRef<THREE.Group>(null);
  const yaw = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const wrist = useRef<THREE.Group>(null);
  const exploded = useRef<THREE.Object3D[]>([]);

  const assets = useMemo(() => {
    const carbon = carbonTexture();
    const anodized = new THREE.MeshPhysicalMaterial({
      color: '#262b33',
      metalness: 0.85,
      roughness: 0.38,
      clearcoat: 0.35,
      clearcoatRoughness: 0.4,
      transparent: true,
    });
    const brushed = new THREE.MeshPhysicalMaterial({
      color: '#9aa3ad',
      metalness: 1,
      roughness: 0.26,
      transparent: true,
    });
    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      map: carbon,
      metalness: 0.2,
      roughness: 0.42,
      clearcoat: 0.8,
      clearcoatRoughness: 0.12,
      transparent: true,
    });
    const signal = new THREE.MeshBasicMaterial({ color: PALETTE.cyan, transparent: true });
    const geos = {
      base: new THREE.CylinderGeometry(0.95, 1.05, 0.36, 48),
      turntable: new THREE.CylinderGeometry(0.72, 0.78, 0.28, 48),
      housing: new THREE.CylinderGeometry(0.34, 0.34, 0.74, 40),
      housingSmall: new THREE.CylinderGeometry(0.26, 0.26, 0.6, 36),
      ring: new THREE.TorusGeometry(0.345, 0.008, 8, 64),
      ringSmall: new THREE.TorusGeometry(0.265, 0.007, 8, 48),
      upper: linkGeometry(0.36, 0.28, 2.05, 0.07),
      fore: linkGeometry(0.28, 0.22, 1.7, 0.06),
      inlayUpper: new THREE.BoxGeometry(0.2, 1.5, 0.012),
      inlayFore: new THREE.BoxGeometry(0.15, 1.2, 0.012),
      wrist: new THREE.CylinderGeometry(0.16, 0.18, 0.34, 32),
      finger: new THREE.BoxGeometry(0.06, 0.34, 0.1),
      floor: new THREE.CircleGeometry(4, 48),
    };
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.4, transparent: true });
    return { carbon, anodized, brushed, carbonMat, signal, geos, shadowMat };
  }, []);

  useEffect(
    () => () => {
      assets.carbon.dispose();
      [assets.anodized, assets.brushed, assets.carbonMat, assets.signal, assets.shadowMat].forEach((m) =>
        m.dispose(),
      );
      Object.values(assets.geos).forEach((g) => g.dispose());
    },
    [assets],
  );

  useFrame(() => {
    if (!root.current || !yaw.current || !shoulder.current || !elbow.current || !wrist.current) return;
    const p = sceneState.p;
    const eng = actProgress(p, 'engineering');
    const sys = actProgress(p, 'systems');
    const visible = actEnvelope(p, 'engineering', 'systems', 0.05);
    root.current.visible = visible > 0.001;
    const opacity = visible * (1 - 0.6 * actProgress(p, 'human'));
    [assets.anodized, assets.brushed, assets.carbonMat].forEach((m) => (m.opacity = opacity));
    assets.signal.opacity = opacity * (0.35 + 0.65 * smoothstep(remap(eng, 0.45, 0.6)));

    // Assembly: parts travel from exploded offsets into place.
    const assemble = smoothstep(remap(eng, 0, 0.5));
    exploded.current.forEach((o) => {
      const off = o.userData.explode as THREE.Vector3;
      const home = o.userData.home as THREE.Vector3;
      o.position.set(
        home.x + off.x * (1 - assemble),
        home.y + off.y * (1 - assemble),
        home.z + off.z * (1 - assemble),
      );
    });

    // Articulation (radians): slow, eased, within plausible joint limits.
    const move = smoothstep(remap(eng, 0.5, 1));
    const settle = smoothstep(sys);
    yaw.current.rotation.y = -0.9 + move * 0.75 + settle * 0.35;
    shoulder.current.rotation.z = 0.15 - move * 0.55 + settle * 0.1;
    elbow.current.rotation.z = 1.25 - move * 0.6 - settle * 0.15;
    wrist.current.rotation.z = -0.4 + move * 0.5;
    wrist.current.rotation.y = move * 1.2;
  });

  const reg = (explode: [number, number, number]) => (o: THREE.Object3D | null) => {
    if (!o || exploded.current.includes(o)) return;
    o.userData.home = o.position.clone();
    o.userData.explode = new THREE.Vector3(...explode);
    exploded.current.push(o);
  };

  const { geos, anodized, brushed, carbonMat, signal, shadowMat } = assets;
  return (
    <group ref={root} position={ACTUATOR_BASE}>
      {shadows ? (
        <mesh
          geometry={geos.floor}
          material={shadowMat}
          rotation-x={-Math.PI / 2}
          position-y={0.001}
          receiveShadow
        />
      ) : null}
      <group ref={reg([0, -0.6, 0])}>
        <mesh geometry={geos.base} material={anodized} position-y={0.18} castShadow={shadows} />
      </group>
      <group ref={yaw} position-y={0.36}>
        <group ref={reg([0, 0.8, 0])}>
          <mesh geometry={geos.turntable} material={brushed} position-y={0.14} castShadow={shadows} />
        </group>
        <group ref={shoulder} position-y={0.62}>
          <group ref={reg([-1.2, 0.4, 0])}>
            <mesh geometry={geos.housing} material={anodized} rotation-x={Math.PI / 2} castShadow={shadows} />
            <mesh geometry={geos.ring} material={signal} position-z={0.37} />
          </group>
          <group ref={reg([0.9, 1.6, 0.4])}>
            <mesh geometry={geos.upper} material={anodized} castShadow={shadows} />
            <mesh geometry={geos.inlayUpper} material={carbonMat} position={[0, 1.05, 0.156]} />
          </group>
          <group ref={elbow} position-y={2.05}>
            <group ref={reg([1.4, 0.9, -0.3])}>
              <mesh
                geometry={geos.housingSmall}
                material={brushed}
                rotation-x={Math.PI / 2}
                castShadow={shadows}
              />
              <mesh geometry={geos.ringSmall} material={signal} position-z={0.305} />
            </group>
            <group ref={reg([1.8, 1.8, 0.6])}>
              <mesh geometry={geos.fore} material={anodized} castShadow={shadows} />
              <mesh geometry={geos.inlayFore} material={carbonMat} position={[0, 0.85, 0.126]} />
            </group>
            <group ref={wrist} position-y={1.72}>
              <group ref={reg([2.2, 2.4, -0.4])}>
                <mesh geometry={geos.wrist} material={brushed} position-y={0.17} castShadow={shadows} />
                <mesh
                  geometry={geos.finger}
                  material={anodized}
                  position={[0.09, 0.5, 0]}
                  castShadow={shadows}
                />
                <mesh
                  geometry={geos.finger}
                  material={anodized}
                  position={[-0.09, 0.5, 0]}
                  castShadow={shadows}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
