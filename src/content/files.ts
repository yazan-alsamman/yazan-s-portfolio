import { PUBLIC_SOURCE_ORDER, type DerivativeName } from '@/cms/media-policy';

/**
 * Payload builds file URLs on its `serverURL` (= SITE_URL). Files are served by this same app,
 * so the public contract uses the site-relative path: next/image then treats it as a local
 * image, and the URL stays correct behind any host/port (preview, container, production).
 */
export function fileUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith('/api/') ? `${parsed.pathname}${parsed.search}` : url;
  } catch {
    return url; // already relative
  }
}

type SizeLike = { url?: string | null; width?: number | null; height?: number | null } | null | undefined;

export type MediaLike = {
  archived?: boolean | null;
  decorative?: boolean | null;
  alt?: string | null;
  sizes?: Record<string, SizeLike> | null;
};

/**
 * Public image selection (Phase 6, ADR-008): an optimized derivative in `prefer` order — never
 * the private original — and never a meaningful image without alt text in the current locale
 * (it is omitted instead of being rendered as if decorative; no cross-locale fallback).
 */
export function publicImage(
  media: MediaLike | null | undefined,
  prefer: readonly DerivativeName[] = PUBLIC_SOURCE_ORDER,
): { url: string; width: number; height: number; alt: string } | null {
  if (!media || media.archived) return null;
  const alt = media.decorative ? '' : (media.alt ?? '').trim();
  if (!media.decorative && !alt) return null;
  for (const name of prefer) {
    const size = media.sizes?.[name];
    if (size?.url && size.width && size.height) {
      return { url: fileUrl(size.url), width: size.width, height: size.height, alt };
    }
  }
  return null;
}
