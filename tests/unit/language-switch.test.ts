import { describe, expect, it } from 'vitest';
import { resolveSwitchTarget } from '@/lib/i18n/switch-target';

/**
 * R-47 — the language switcher is page-aware: same page when it exists in the target language,
 * else its nearest existing parent, else home. Inputs are the target locale's existing pages.
 */
const arabic = ['/', '/about', '/projects', '/projects/shared-project', '/contact'];
const english = ['/', '/about', '/projects', '/projects/shared-project', '/projects/english-only', '/cv'];

describe('resolveSwitchTarget', () => {
  it('keeps static pages in both directions (EN → AR and AR → EN)', () => {
    expect(resolveSwitchTarget('/about', arabic)).toBe('/about');
    expect(resolveSwitchTarget('/about', english)).toBe('/about');
  });

  it('keeps project pages that exist in both languages (same slug)', () => {
    expect(resolveSwitchTarget('/projects/shared-project', arabic)).toBe('/projects/shared-project');
    expect(resolveSwitchTarget('/projects/shared-project', english)).toBe('/projects/shared-project');
  });

  it('falls back to the section index when the project has no page in the target language', () => {
    expect(resolveSwitchTarget('/projects/english-only', arabic)).toBe('/projects');
  });

  it('falls back to home when neither the page nor its section exists (unpublished / gated content)', () => {
    expect(resolveSwitchTarget('/cv', arabic)).toBe('/');
    expect(resolveSwitchTarget('/projects/x', ['/'])).toBe('/');
    expect(resolveSwitchTarget('/contact', english)).toBe('/');
  });

  it('maps unknown routes (a 404 page) to an existing page, never to another 404', () => {
    expect(resolveSwitchTarget('/does-not-exist', arabic)).toBe('/');
    expect(resolveSwitchTarget('/projects/unknown/deeper', arabic)).toBe('/projects');
  });

  it('home maps to home; trailing slashes, queries and hashes are ignored', () => {
    expect(resolveSwitchTarget('/', arabic)).toBe('/');
    expect(resolveSwitchTarget('', arabic)).toBe('/');
    expect(resolveSwitchTarget('/about/', arabic)).toBe('/about');
    expect(resolveSwitchTarget('/about?x=1#top', arabic)).toBe('/about');
  });

  it('with no known pages for the target language, only home is offered', () => {
    expect(resolveSwitchTarget('/about', [])).toBe('/');
  });
});
