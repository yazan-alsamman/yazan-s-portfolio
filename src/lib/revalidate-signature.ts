import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Signature scheme for out-of-process revalidation requests (cron, scripts, a future worker).
 *   signature = hex(HMAC-SHA256(REVALIDATE_SECRET, `${timestamp}.${rawBody}`))
 * Timestamps outside ±5 minutes are rejected (replay protection); comparison is constant-time.
 */
export const REVALIDATE_TOLERANCE_SECONDS = 300;

export function signRevalidation(secret: string, timestamp: number, rawBody: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
}

export function verifyRevalidation(args: {
  secret: string;
  timestamp: string | null;
  signature: string | null;
  rawBody: string;
  nowSeconds?: number;
}): boolean {
  const { secret, timestamp, signature, rawBody } = args;
  if (!timestamp || !signature || !/^\d+$/.test(timestamp) || !/^[0-9a-f]{64}$/.test(signature)) return false;
  const now = args.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > REVALIDATE_TOLERANCE_SECONDS) return false;
  const expected = Buffer.from(signRevalidation(secret, Number(timestamp), rawBody), 'hex');
  const given = Buffer.from(signature, 'hex');
  return expected.length === given.length && timingSafeEqual(expected, given);
}
