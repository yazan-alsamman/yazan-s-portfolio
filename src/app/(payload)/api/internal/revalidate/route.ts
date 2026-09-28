import { z } from 'zod';
import { revalidateCmsTags } from '@/content/cache-tags';
import { verifyRevalidation } from '@/lib/revalidate-signature';

/**
 * POST /api/internal/revalidate — signed, out-of-process cache invalidation.
 * In-process CMS publishes revalidate directly via hooks; this route is for external triggers.
 * Headers: x-revalidate-timestamp (unix seconds), x-revalidate-signature (hex HMAC-SHA256).
 * Body: {"sources": ["projects", ...]} — only known CMS sources are accepted.
 */
const SOURCES = [
  'profile',
  'site-settings',
  'cv',
  'projects',
  'experience',
  'education',
  'certificates',
  'skills',
  'media',
  'documents',
  'redirects',
] as const;
const Body = z.object({ sources: z.array(z.enum(SOURCES)).min(1).max(SOURCES.length) });

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || secret.length < 32)
    return Response.json({ error: 'Revalidation not configured' }, { status: 503 });

  const rawBody = await request.text();
  const ok = verifyRevalidation({
    secret,
    timestamp: request.headers.get('x-revalidate-timestamp'),
    signature: request.headers.get('x-revalidate-signature'),
    rawBody,
  });
  if (!ok) return Response.json({ error: 'Invalid signature' }, { status: 401 });

  let parsed;
  try {
    parsed = Body.safeParse(JSON.parse(rawBody));
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!parsed.success) return Response.json({ error: 'Invalid body' }, { status: 400 });

  const result = revalidateCmsTags(parsed.data.sources);
  return Response.json({ revalidated: result.revalidated }, { status: result.skipped ? 500 : 200 });
}
