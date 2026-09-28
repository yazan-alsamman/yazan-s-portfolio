import { getPayload } from 'payload';
import config from '@payload-config';

/**
 * GET /api/internal/health — liveness + database readiness for the container healthcheck and
 * uptime monitoring (Phase 9, deploy/docker-compose.prod.yml). Answers only "ok" or
 * "unavailable": no versions, counts or error details (they would help an attacker, not an operator —
 * the server log has the cause). Not cached; `/api/*` is noindex (next.config.ts).
 */
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const payload = await getPayload({ config });
    await payload.db.drizzle.execute('select 1');
    return Response.json({ status: 'ok' }, { headers });
  } catch (error) {
    console.error('[health] database check failed:', error instanceof Error ? error.message : error);
    return Response.json({ status: 'unavailable' }, { status: 503, headers });
  }
}
