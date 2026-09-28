import { describe, expect, it } from 'vitest';
import { signRevalidation, verifyRevalidation } from '@/lib/revalidate-signature';

const secret = 'x'.repeat(64);
const body = '{"sources":["projects"]}';
const now = 1_800_000_000;

describe('revalidation signature', () => {
  it('accepts a correct, fresh signature', () => {
    const signature = signRevalidation(secret, now, body);
    expect(
      verifyRevalidation({ secret, timestamp: String(now), signature, rawBody: body, nowSeconds: now }),
    ).toBe(true);
  });

  it('rejects a wrong secret, a tampered body, and a stale timestamp (replay)', () => {
    const signature = signRevalidation(secret, now, body);
    expect(
      verifyRevalidation({
        secret: 'y'.repeat(64),
        timestamp: String(now),
        signature,
        rawBody: body,
        nowSeconds: now,
      }),
    ).toBe(false);
    expect(
      verifyRevalidation({
        secret,
        timestamp: String(now),
        signature,
        rawBody: '{"sources":["cv"]}',
        nowSeconds: now,
      }),
    ).toBe(false);
    expect(
      verifyRevalidation({ secret, timestamp: String(now), signature, rawBody: body, nowSeconds: now + 301 }),
    ).toBe(false);
  });

  it('rejects missing or malformed headers', () => {
    expect(
      verifyRevalidation({ secret, timestamp: null, signature: null, rawBody: body, nowSeconds: now }),
    ).toBe(false);
    expect(
      verifyRevalidation({ secret, timestamp: 'abc', signature: 'zz', rawBody: body, nowSeconds: now }),
    ).toBe(false);
  });
});
