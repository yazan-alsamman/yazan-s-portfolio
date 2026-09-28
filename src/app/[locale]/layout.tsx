import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeDirection, routing, type Locale } from '@/i18n/routing';
import { env } from '@/lib/env';
import { getProfile } from '@/content/repository';
import { OWNER_INPUT_PLACEHOLDER } from '@/i18n/messages';
import { isLocaleAvailable } from '@/lib/i18n/publication';
import '../globals.css';
import { fontVariables } from '../fonts';
import { SiteHeader } from '@/components/shell/SiteHeader';
import { SiteFooter } from '@/components/shell/SiteFooter';
import { SkipLink } from '@/components/shell/SkipLink';
import { themeInitScript } from '@/components/shell/ThemeToggle';

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

/**
 * R-45: CMS publishes invalidate pages immediately (tag revalidation), but Next keeps those
 * invalidations in memory only. An edit not requested before a restart would otherwise stay
 * stale until the next edit; this window bounds it (with the repository's data window: ≤ ~1 h).
 * Must equal CMS_REVALIDATE_SECONDS (a segment config has to be a literal).
 */
export const revalidate = 1800;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const name = (await getProfile(locale))?.name ?? OWNER_INPUT_PLACEHOLDER;
  return {
    metadataBase: new URL(env.siteUrl),
    // SEO_MASTER §9: page/topic first, identity second.
    title: { default: name, template: `%s — ${name}` },
    applicationName: name,
    authors: [{ name, url: env.siteUrl }],
    creator: name,
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Never disable zoom (accessibility).
  themeColor: '#07090d', // Obsidian — dark is the default brand expression
  colorScheme: 'dark light',
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // ADR-006: in production an incomplete locale is not served at all (no silent fallback).
  if (!(await isLocaleAvailable(locale))) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'a11y' });

  return (
    <html
      lang={locale}
      dir={localeDirection[locale as Locale]}
      data-theme="dark"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        {/* Applies a stored theme preference before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-bg font-body text-fg">
        {/* Client islands receive locale only; UI strings are passed as props from the server (no message payload). */}
        <NextIntlClientProvider locale={locale} messages={null}>
          <SkipLink label={t('skipToContent')} />
          <SiteHeader locale={locale} />
          <main id="main" tabIndex={-1} className="focus:outline-none">
            {children}
          </main>
          <SiteFooter locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
