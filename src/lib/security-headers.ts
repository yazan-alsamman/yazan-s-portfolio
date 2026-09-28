/**
 * HTTP security headers (Phase 9, SECURITY.md "Headers", R-27). Served by Next for every route,
 * so they are identical behind any reverse proxy; HSTS is added by the TLS proxy (deploy/nginx),
 * the only layer that knows the connection is HTTPS.
 *
 * CSP, verified against the real stack (public pages, the WebGL scene, next/image, the Payload
 * admin — no violations, Phase 9 report):
 * - `script-src 'unsafe-inline'` is required: pages are statically generated, and Next inlines
 *   the RSC payload and our theme-init/JSON-LD scripts. Nonces would make every page dynamic;
 *   `experimental.sri` covers only script files. XSS defence therefore rests on React escaping
 *   and the absence of raw HTML from the CMS (rich text is rendered as React elements). Residual
 *   risk recorded as R-27. No `'unsafe-eval'`, no third-party origin anywhere.
 * - `style-src 'unsafe-inline'`: React `style` attributes, next/font and the Payload admin.
 * - `img-src data: blob:`: next/image placeholders, admin upload previews.
 * - `frame-ancestors 'none'` (+ X-Frame-Options for old browsers): nothing is embeddable.
 */
export type SecurityHeader = { key: string; value: string };

export function contentSecurityPolicy({ https }: { https: boolean }): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  // Only over HTTPS: on a plain-http local production build it would break every subresource.
  if (https) directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

export function securityHeaders({ siteUrl }: { siteUrl: string }): SecurityHeader[] {
  return [
    {
      key: 'Content-Security-Policy',
      value: contentSecurityPolicy({ https: siteUrl.startsWith('https://') }),
    },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    // The site uses none of these capabilities; WebGL and scrolling need no permission.
    {
      key: 'Permissions-Policy',
      value:
        'accelerometer=(), browsing-topics=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), hid=(), magnetometer=(), microphone=(), midi=(), payment=(), serial=(), usb=()',
    },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ];
}
