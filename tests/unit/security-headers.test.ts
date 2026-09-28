import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, securityHeaders } from '@/lib/security-headers';

const header = (name: string, siteUrl = 'https://yazanalsamman.com') =>
  securityHeaders({ siteUrl }).find((h) => h.key === name)?.value;

describe('security headers (Phase 9)', () => {
  it('sends the baseline hardening headers', () => {
    expect(header('X-Content-Type-Options')).toBe('nosniff');
    expect(header('X-Frame-Options')).toBe('DENY');
    expect(header('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(header('Permissions-Policy')).toContain('camera=()');
    expect(header('Cross-Origin-Opener-Policy')).toBe('same-origin');
  });

  it('CSP allows only this origin and forbids framing, plugins and eval', () => {
    const csp = contentSecurityPolicy({ https: true });
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).not.toMatch(/https?:\/\//); // no third-party origin
  });

  it('upgrades insecure requests only on an https origin', () => {
    expect(header('Content-Security-Policy')).toContain('upgrade-insecure-requests');
    expect(header('Content-Security-Policy', 'http://localhost:3217')).not.toContain(
      'upgrade-insecure-requests',
    );
  });

  it('leaves HSTS to the TLS proxy', () => {
    expect(header('Strict-Transport-Security')).toBeUndefined();
  });
});
