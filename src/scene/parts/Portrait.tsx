'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { actEnvelope, actProgress, remap, smoothstep } from '../timeline';
import { PALETTE, sceneState } from '../state';

export const PORTRAIT_POSITION = new THREE.Vector3(-5, 0.9, 2);

/**
 * Crop (UV space, origin bottom-left) — excludes the third party's hand/pen at the
 * bottom-right edge of the source (Phase 0.1 audit) and keeps the subject centred.
 * Source 538×661 → cropped ≈ 506×582 px, aspect ≈ 0.87.
 */
export const PORTRAIT_CROP = { u0: 0, u1: 0.94, v0: 0.12, v1: 1 };
const ASPECT = ((PORTRAIT_CROP.u1 - PORTRAIT_CROP.u0) * 538) / ((PORTRAIT_CROP.v1 - PORTRAIT_CROP.v0) * 661);
const HEIGHT = 2.7;
const WIDTH = HEIGHT * ASPECT;
const SOURCE_CSS_HEIGHT = (PORTRAIT_CROP.v1 - PORTRAIT_CROP.v0) * 661;

/**
 * ACT VI (human intent): the owner's portrait as the human origin of the system.
 * - Rendered at a controlled size (never full-screen) → the 538×661 source is not stretched.
 * - Two layers for honest 2.5D depth separation: a blurred, darkened atmosphere layer behind
 *   and the graded subject in front. No face reconstruction, no generative upscale.
 * - A scroll-driven "sampling" scan reveals the image: the machine perceiving its origin.
 * The source file is never modified; only its build-hashed copy is read as a texture.
 */
export function Portrait({ src }: { src: string }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    let disposed = false;
    const loader = new THREE.TextureLoader();
    loader.load(src, (t) => {
      if (disposed) return t.dispose();
      t.colorSpace = THREE.SRGBColorSpace;
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.anisotropy = 4;
      setTexture(t);
    });
    return () => {
      disposed = true;
    };
  }, [src]);

  const { front, back, geometry } = useMemo(() => {
    const shared = {
      uMap: { value: null as THREE.Texture | null },
      uCrop: {
        value: new THREE.Vector4(PORTRAIT_CROP.u0, PORTRAIT_CROP.v0, PORTRAIT_CROP.u1, PORTRAIT_CROP.v1),
      },
      uShadow: { value: new THREE.Color(PALETTE.obsidian) },
      uLight: { value: new THREE.Color(PALETTE.cloud) },
      uRim: { value: new THREE.Color(PALETTE.cyan) },
    };
    const vertexShader = /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
    const front = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { ...shared, uOpacity: { value: 0 }, uReveal: { value: 0 } },
      vertexShader,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap; uniform vec4 uCrop; uniform vec3 uShadow; uniform vec3 uLight; uniform vec3 uRim;
        uniform float uOpacity; uniform float uReveal; varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main() {
          vec2 uv = mix(uCrop.xy, uCrop.zw, vUv);
          vec3 src = texture2D(uMap, uv).rgb;
          float lum = dot(src, vec3(0.2126, 0.7152, 0.0722));
          // Restrained duotone grade; highlights pick up a cool rim (studio light, not neon).
          float tone = smoothstep(0.08, 0.92, lum);
          vec3 col = mix(uShadow, uLight, tone);
          col += uRim * smoothstep(0.72, 1.0, lum) * 0.10;
          // Keep a trace of natural colour so the person stays authentic.
          col = mix(col, src, 0.18);
          // Soft vignette mask: edges dissolve into the environment (no pasted rectangle).
          vec2 c = vUv - vec2(0.5, 0.55);
          float mask = smoothstep(0.5, 0.24, length(c * vec2(1.0, 0.85)));
          mask *= smoothstep(0.0, 0.22, vUv.y);
          // Scroll-driven sampling scan (bottom → top) with a thin signal line at the front.
          float n = hash(floor(vUv * vec2(90.0, 110.0))) * 0.012;
          float front = uReveal * 1.12 - 0.06;
          float revealed = smoothstep(front, front - 0.05, vUv.y + n);
          float scan = smoothstep(0.012, 0.0, abs(vUv.y - front)) * step(uReveal, 0.999);
          // Faint sampling grid over the revealed image.
          vec2 g = abs(fract(vUv * vec2(26.0, 30.0)) - 0.5);
          float grid = (1.0 - smoothstep(0.47, 0.5, max(g.x, g.y))) * 0.05 * (1.0 - uReveal * 0.6);
          vec3 outCol = col + uRim * (scan * 0.8 + grid);
          gl_FragColor = vec4(outCol, uOpacity * mask * max(revealed, scan * 0.9));
        }`,
    });
    const back = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { ...shared, uOpacity: { value: 0 } },
      vertexShader,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap; uniform vec4 uCrop; uniform vec3 uShadow; uniform vec3 uRim; uniform float uOpacity; varying vec2 vUv;
        void main() {
          vec2 uv = mix(uCrop.xy, uCrop.zw, vUv);
          vec3 src = texture2D(uMap, uv, 5.0).rgb; // heavy mip blur: atmosphere, not detail
          float lum = dot(src, vec3(0.2126, 0.7152, 0.0722));
          vec3 col = mix(uShadow, uRim * 0.35, lum * 0.5);
          float mask = smoothstep(0.5, 0.1, length((vUv - 0.5) * vec2(1.0, 0.85)));
          gl_FragColor = vec4(col, uOpacity * mask * 0.55);
        }`,
    });
    const geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
    return { front, back, geometry };
  }, []);

  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    front.uniforms.uMap!.value = texture;
    back.uniforms.uMap!.value = texture;
    invalidate(); // demand rendering: show the texture as soon as it exists
  }, [texture, front, back, invalidate]);

  useEffect(
    () => () => {
      front.dispose();
      back.dispose();
      geometry.dispose();
      texture?.dispose();
    },
    [front, back, geometry, texture],
  );

  useFrame(({ camera, size }) => {
    const p = sceneState.p;
    const human = actProgress(p, 'human');
    const visible = texture
      ? actEnvelope(p, 'human', 'identity', 0.05) * (1 - smoothstep(actProgress(p, 'identity') * 3))
      : 0;
    front.uniforms.uOpacity!.value = visible;
    front.uniforms.uReveal!.value = smoothstep(remap(human, 0, 0.4));
    back.uniforms.uOpacity!.value = visible;
    // Never display the portrait larger than its source: cap the projected height at the
    // cropped source height in CSS pixels (538×661 source → 582 px after the crop).
    const group = groupRef.current;
    if (group) {
      const cam = camera as THREE.PerspectiveCamera;
      const distance = cam.position.distanceTo(PORTRAIT_POSITION);
      const pxPerUnit = size.height / (2 * distance * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
      group.scale.setScalar(Math.min(1, SOURCE_CSS_HEIGHT / (HEIGHT * pxPerUnit)));
    }
  });

  return (
    <group ref={groupRef} position={PORTRAIT_POSITION}>
      <mesh geometry={geometry} material={back} position={[0.35, 0.05, -0.9]} scale={1.45} renderOrder={1} />
      <mesh geometry={geometry} material={front} renderOrder={2} />
    </group>
  );
}
