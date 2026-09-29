import { describe, expect, it } from 'vitest';
import { familyOf, hash, LAYER_ORDER, layerOf, motifOf, orderedDisciplines } from '@/lib/disciplines';

describe('discipline taxonomy (Phase 12)', () => {
  it('orders disciplines with intelligent systems first, keeping CMS order within a family', () => {
    expect(
      orderedDisciplines([
        'mobile',
        'artificial-intelligence',
        'web',
        null,
        'robotics',
        'software-engineering',
        'mobile',
      ]),
    ).toEqual(['artificial-intelligence', 'robotics', 'software-engineering', 'mobile', 'web']);
  });

  it('never drops or invents a discipline: output is a permutation of the unique inputs', () => {
    const input = ['other', 'web', 'unknown-key', 'computer-vision', 'data'];
    const out = orderedDisciplines(input);
    expect([...out].sort()).toEqual([...new Set(input)].sort());
  });

  it('maps unknown categories to safe defaults', () => {
    expect(familyOf('unknown-key')).toBe('other');
    expect(familyOf(null)).toBe('other');
    expect(motifOf('unknown-key')).toBe('modules');
    expect(layerOf('unknown-key')).toBe('adjacent');
  });

  it('places every CMS skill category in exactly one stack layer', () => {
    for (const c of [
      'frontend',
      'programming',
      'backend',
      'mobile',
      'databases',
      'other',
      'ai-ml',
      'tools',
      'architecture',
      'devops-infrastructure',
      'security',
      'practice',
    ])
      expect(LAYER_ORDER).toContain(layerOf(c));
  });

  it('follows the expertise model: intelligence → systems → application → data → infrastructure → discipline', () => {
    expect(layerOf('ai-ml')).toBe('intelligence');
    expect(layerOf('architecture')).toBe('systems');
    expect(layerOf('backend')).toBe('systems');
    expect(layerOf('frontend')).toBe('application');
    expect(layerOf('databases')).toBe('data');
    expect(layerOf('devops-infrastructure')).toBe('infrastructure');
    expect(layerOf('security')).toBe('discipline');
    expect(layerOf('practice')).toBe('discipline');
    expect(LAYER_ORDER.at(-1)).toBe('adjacent');
  });

  it('lets the CMS schematic override win, ignoring unknown values', () => {
    expect(motifOf('software-engineering', 'tenancy')).toBe('tenancy');
    expect(motifOf('artificial-intelligence', 'pipeline')).toBe('pipeline');
    expect(motifOf('robotics', 'not-a-motif')).toBe('kinematic');
    expect(motifOf('web', null)).toBe('browser');
  });

  it('picks a discipline-specific schematic motif', () => {
    expect(motifOf('artificial-intelligence')).toBe('network');
    expect(motifOf('robotics')).toBe('kinematic');
    expect(motifOf('computer-vision')).toBe('vision');
    expect(motifOf('mobile')).toBe('device');
    expect(motifOf('web')).toBe('browser');
    expect(motifOf('software-engineering')).toBe('modules');
  });

  it('hashes deterministically (the same slug always draws the same schematic)', () => {
    expect(hash('robot-obstacles-avoidance-system')).toBe(hash('robot-obstacles-avoidance-system'));
    expect(hash('a')).not.toBe(hash('b'));
  });
});
