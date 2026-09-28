import { revalidateTag } from 'next/cache';

/**
 * Cache tags shared by the CMS hooks (writers) and the content repository (readers).
 * One tag per CMS collection/global + a catch-all, so a publish invalidates exactly the
 * public data that depends on it (SEO: sitemap and metadata read through the same cache).
 */
export const CMS_TAG_ALL = 'cms';

export function cmsTag(source: string): string {
  return `cms:${source}`;
}

export type RevalidationResult = { revalidated: string[]; skipped?: string };

/**
 * Invalidate tagged caches. Outside a Next.js request/runtime context (CLI scripts, Vitest)
 * `revalidateTag` throws; that is expected there and reported instead of failing the write.
 */
export function revalidateCmsTags(
  sources: string[],
  logger?: { payload?: { logger?: { info: (m: string) => void } } },
): RevalidationResult {
  const tags = [...sources.map(cmsTag), CMS_TAG_ALL];
  try {
    // { expire: 0 }: the next request after a publish is fresh, never stale (Next 16 docs: webhooks/route handlers).
    for (const tag of tags) revalidateTag(tag, { expire: 0 });
    return { revalidated: tags };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    logger?.payload?.logger?.info(`[revalidate] skipped outside Next runtime: ${reason}`);
    return { revalidated: [], skipped: reason };
  }
}
