/**
 * Admin wordmark (login screen + navigation). Neutral and typographic — the dashboard is the
 * operational product and must not compete with the cinematic public site (DASHBOARD_SPEC).
 */
export function Logo() {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, lineHeight: 1.1 }}>
      <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        Yazan Al Samman
      </span>
      <span style={{ fontSize: 13, color: 'var(--theme-elevation-650)', letterSpacing: '0.04em' }}>
        Portfolio CMS
      </span>
    </span>
  );
}

/**
 * Navigation icon: a neutral mark (the site's signal dot + a measured rule), deliberately not a
 * monogram — the YA monogram is an open owner decision (Pre-Phase 2).
 */
export function Icon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" role="img" aria-label="Portfolio CMS">
      <circle cx="5" cy="11" r="3" fill="currentColor" />
      <path d="M11 11h9M11 8v6M20 8v6" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
