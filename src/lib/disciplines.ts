/**
 * Discipline taxonomy (Phase 12): how CMS category keys are presented — never which categories a
 * project or skill has (that is CMS data). Pure, unit-tested.
 *
 * - `family` orders disciplines so intelligent systems lead (AI Engineer positioning, without
 *   adding or renaming any fact);
 * - `motif` picks the schematic drawn for a project that has no published imagery;
 * - `layer` places a skill category in the capability stack (a system architecture, bottom-up).
 */

export type Family = 'intelligent' | 'systems' | 'applications' | 'other';
export type Motif = 'network' | 'vision' | 'kinematic' | 'modules' | 'device' | 'browser';
export type Layer =
  'intelligence' | 'interfaces' | 'services' | 'data' | 'infrastructure' | 'foundations' | 'adjacent';

const FAMILY: Record<string, Family> = {
  'artificial-intelligence': 'intelligent',
  'ai-ml': 'intelligent',
  'machine-learning': 'intelligent',
  'computer-vision': 'intelligent',
  robotics: 'intelligent',
  data: 'systems',
  'software-engineering': 'systems',
  backend: 'systems',
  databases: 'systems',
  'devops-infrastructure': 'systems',
  programming: 'systems',
  mobile: 'applications',
  web: 'applications',
  frontend: 'applications',
};

const MOTIF: Record<string, Motif> = {
  'artificial-intelligence': 'network',
  'ai-ml': 'network',
  'machine-learning': 'network',
  data: 'network',
  'computer-vision': 'vision',
  robotics: 'kinematic',
  mobile: 'device',
  web: 'browser',
  frontend: 'browser',
};

const LAYER: Record<string, Layer> = {
  'artificial-intelligence': 'intelligence',
  'ai-ml': 'intelligence',
  'machine-learning': 'intelligence',
  'computer-vision': 'intelligence',
  robotics: 'intelligence',
  frontend: 'interfaces',
  mobile: 'interfaces',
  web: 'interfaces',
  backend: 'services',
  'software-engineering': 'services',
  databases: 'data',
  data: 'data',
  'devops-infrastructure': 'infrastructure',
  programming: 'foundations',
  tools: 'adjacent',
  other: 'adjacent',
};

const FAMILY_ORDER: readonly Family[] = ['intelligent', 'systems', 'applications', 'other'];

/** Top of the stack first, like an architecture diagram; adjacent disciplines stand apart. */
export const LAYER_ORDER: readonly Layer[] = [
  'intelligence',
  'interfaces',
  'services',
  'data',
  'infrastructure',
  'foundations',
  'adjacent',
];

export const familyOf = (category: string | null): Family => (category && FAMILY[category]) || 'other';
export const motifOf = (category: string | null): Motif => (category && MOTIF[category]) || 'modules';
export const layerOf = (category: string): Layer => LAYER[category] ?? 'adjacent';

/**
 * Categories of the given items, deduplicated and ordered by family (intelligent systems first),
 * keeping the CMS order within a family.
 */
export function orderedDisciplines(categories: (string | null)[]): string[] {
  const unique = [...new Set(categories.filter((c): c is string => Boolean(c)))];
  return FAMILY_ORDER.flatMap((f) => unique.filter((c) => familyOf(c) === f));
}

/** Stable 32-bit hash (FNV-1a) — deterministic schematic variation per project slug. */
export function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
