import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import en from '../../messages/en.json';
import ar from '../../messages/ar.json';
import { findPlaceholders } from '@/i18n/messages';
import { computePublicationBlockers } from '@/lib/i18n/publishability';
import { confirmedIdentity } from '@/cms/seed-data';
import { getLiveRoutes, getPrimaryNav, NO_ROUTES } from '@/config/navigation';

function keys(value: unknown, prefix = ''): string[] {
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

function lookup(catalog: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], catalog);
}

describe('message catalogs', () => {
  it('Arabic and English have exactly the same keys (no fallback possible)', () => {
    expect(keys(ar).sort()).toEqual(keys(en).sort());
  });

  it('no Arabic value is silently identical to English (except language and format names)', () => {
    // "PDF" is a file-format name, written the same in both languages.
    const allowed = new Set(['language.en', 'language.ar', 'a11y.titleSeparator', 'pages.common.pdf']);
    const duplicates = keys(ar).filter((k) => !allowed.has(k) && lookup(ar, k) === lookup(en, k));
    expect(duplicates).toEqual([]);
  });

  it('English has no owner-input placeholders', () => {
    expect(findPlaceholders(en)).toEqual([]);
    expect(computePublicationBlockers('en', { hasApprovedProfile: true })).toEqual([]);
  });

  it('seeds exactly the owner-confirmed identity in both languages (D-6)', () => {
    expect(confirmedIdentity.name).toEqual({ en: 'Yazan Al Samman', ar: 'يزن السمان' });
    expect(confirmedIdentity.title).toEqual({
      en: 'Artificial Intelligence Engineer',
      ar: 'مهندس ذكاء صنعي',
    });
  });

  it('Arabic has no placeholders left, but stays unpublishable until a real reviewer approves the copy', () => {
    expect(findPlaceholders(ar)).toEqual([]);
    expect(computePublicationBlockers('ar', { hasApprovedProfile: true })).toEqual(['copyReview']);
  });

  it('a locale without an approved CMS profile is never publishable (no fallback)', () => {
    expect(computePublicationBlockers('en', { hasApprovedProfile: false })).toEqual(['profile']);
  });
});

describe('navigation', () => {
  it('with no CMS content, production navigation is Home only (no empty header landmark)', () => {
    const production = getPrimaryNav({ available: NO_ROUTES, includeUnavailable: false });
    expect(production.map((i) => i.href)).toEqual(['/']);
    expect(production.filter((item) => item.inHeader)).toEqual([]);
    expect(getLiveRoutes(NO_ROUTES)).toEqual(['/']);
  });

  it('a route becomes live exactly when its content exists', () => {
    const available = { ...NO_ROUTES, projects: true, cv: true };
    expect(getPrimaryNav({ available, includeUnavailable: false }).map((i) => i.href)).toEqual([
      '/',
      '/projects',
      '/cv',
    ]);
    expect(getLiveRoutes(available)).toEqual(['/', '/projects', '/cv']);
  });

  it('development lists every route so the architecture stays visible', () => {
    expect(getPrimaryNav({ available: NO_ROUTES, includeUnavailable: true })).toHaveLength(8);
  });
});

describe('canonical identity (ADR-017)', () => {
  const forbidden = [/Yazan Alsamman/, /Yazan AL Samman/, /Al-Samman/, /Yaz Al-Samman/, /YAZAN ALSAMMAN/];

  function files(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? files(path) : /\.(tsx?|json|css)$/.test(name) ? [path] : [];
    });
  }

  it('source and messages never use non-canonical name spellings', () => {
    const offenders = [...files('src'), ...files('messages')].filter((file) => {
      const text = readFileSync(file, 'utf8');
      return forbidden.some((re) => re.test(text));
    });
    expect(offenders).toEqual([]);
  });
});
