import en from '../../messages/en.json';
import ar from '../../messages/ar.json';
import type { Locale } from './routing';

export type Messages = typeof en;

/**
 * Static message catalogs. `ar` must satisfy the English shape exactly —
 * a missing Arabic key is a type error, so English can never leak in as a fallback.
 */
export const messagesByLocale: Record<Locale, Messages> = { en, ar: ar satisfies Messages };

/** Marker for content the owner has not supplied yet. Never shipped as final copy. */
export const OWNER_INPUT_PLACEHOLDER = 'TODO: OWNER INPUT REQUIRED';

export function findPlaceholders(value: unknown, path: string[] = []): string[] {
  if (typeof value === 'string') {
    return value.includes(OWNER_INPUT_PLACEHOLDER) ? [path.join('.')] : [];
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => findPlaceholders(child, [...path, key]));
  }
  return [];
}

export function isPlaceholder(value: string | null | undefined): boolean {
  return value == null || value.includes(OWNER_INPUT_PLACEHOLDER);
}
