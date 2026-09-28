/**
 * Per-frame scene state shared by all scene parts. Written once per frame by the Director
 * (first useFrame subscriber), read by every part. Plain mutable object: no React updates in
 * the render loop (ADR-007: no business logic or state churn inside render loops).
 */
export const sceneState = {
  /** Damped cinematic progress 0–1 (the only clock the scene uses; no wall-clock animation). */
  p: 0,
  /** Portrait (mobile) framing active. */
  portrait: false,
};

export const PALETTE = {
  obsidian: '#07090d',
  carbon: '#0d1117',
  graphite: '#171c24',
  steel: '#2a313b',
  mist: '#b8c1cc',
  cloud: '#e8edf2',
  white: '#f7f9fb',
  cyan: '#65e6ff',
  violet: '#8c7cff',
  blue: '#4ea1ff',
} as const;
