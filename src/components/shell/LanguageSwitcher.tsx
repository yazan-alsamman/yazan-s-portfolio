'use client';

import NextLink from 'next/link';
import { getPathname, usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { resolveSwitchTarget } from '@/lib/i18n/switch-target';

type Props = {
  locale: Locale;
  /** Locales that may be offered (production: publishable locales only — ADR-006). */
  locales: readonly Locale[];
  /** Language names in their own language, e.g. { en: 'English', ar: 'العربية' }. */
  names: Record<Locale, string>;
  /** Pages that exist in each offered locale (server-computed, R-47). */
  targets: Partial<Record<Locale, readonly string[]>>;
  label: string;
  /** `nav` landmark (header) or a labelled group (secondary placements) — avoids duplicate landmarks. */
  landmark?: boolean;
  className?: string;
  size?: 'compact' | 'large';
};

/**
 * Switches to the SAME page in the other language when it exists there; otherwise to its nearest
 * existing parent page or the home page — never to a page that would 404 (R-47).
 * Each option carries `lang` + `hrefLang` so screen readers pronounce it correctly.
 * No automatic detection or redirect exists anywhere (ADR-006) — this is the only switch.
 * Renders nothing when only one locale is available.
 */
export function LanguageSwitcher({
  locale,
  locales,
  names,
  targets,
  label,
  landmark = true,
  className,
  size = 'compact',
}: Props) {
  const pathname = usePathname();
  if (locales.length < 2) return null;
  const Wrapper = landmark ? 'nav' : 'div';
  return (
    <Wrapper aria-label={label} role={landmark ? undefined : 'group'} className={className}>
      <ul className="flex items-center gap-1">
        {locales.map((option) => {
          const active = option === locale;
          const classes = cn(
            'font-label inline-flex min-h-11 items-center rounded-sm px-3 transition-colors duration-(--duration-base)',
            size === 'compact' ? 'text-nav' : 'text-lead',
            active ? 'text-fg-strong' : 'text-fg-muted hover:text-fg hover:bg-surface',
          );
          return (
            <li key={option} className="flex items-center">
              {active ? (
                <span lang={option} aria-current="true" className={classes}>
                  <span aria-hidden="true" className="me-2 inline-block size-1 rounded-full bg-accent" />
                  {names[option]}
                </span>
              ) : (
                // The final canonical URL (`/about`, `/ar/about`): next-intl's <Link locale> would
                // force `/en/…` for the default locale (a redirect hop meant for its locale cookie,
                // which this site disables — ADR-006). No prefetch: switching language is rare, and
                // an RSC prefetch across the locale root layouts is answered with a 404 (R-54).
                <NextLink
                  prefetch={false}
                  href={getPathname({
                    href: resolveSwitchTarget(pathname, targets[option] ?? ['/']),
                    locale: option,
                  })}
                  lang={option}
                  hrefLang={option}
                  className={classes}
                >
                  {names[option]}
                </NextLink>
              )}
            </li>
          );
        })}
      </ul>
    </Wrapper>
  );
}
