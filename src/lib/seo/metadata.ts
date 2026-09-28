import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { env } from '@/lib/env';
import { isLocalePublishable, publishableLocales } from '@/lib/i18n/publication';
import { getProfile, getSiteSettings } from '@/content/repository';
import { OWNER_INPUT_PLACEHOLDER } from '@/i18n/messages';
import { routing, type Locale } from '@/i18n/routing';
import { canonicalUrl, languageAlternates } from './urls';
import { defaultShareImage } from './share-image';

const OG_LOCALE: Record<Locale, string> = { en: 'en_US', ar: 'ar_AR' };

type PageMetadataInput = {
  locale: Locale;
  /** Route path without locale prefix, e.g. `/` or `/projects/example`. */
  path: string;
  /**
   * Page topic. Rendered through the layout template "<title> — <name>" unless `absoluteTitle` is set
   * (SEO_MASTER §9: page/topic first, then identity).
   */
  title: string;
  absoluteTitle?: boolean;
  /** Human-written, unique, accurate (SEO_MASTER §10). */
  description: string;
  /** Force noindex (private/preview/utility pages). Unpublishable locales are noindexed automatically. */
  noindex?: boolean;
  /**
   * Locales in which this exact page exists (content is per-locale). hreflang alternates are
   * limited to these ∩ publishable locales. Omit for pages that exist in every locale.
   */
  availableIn?: readonly Locale[];
  /** Share image (e.g. a project cover). Site-relative URLs are made absolute on SITE_URL. */
  image?: { url: string; width: number; height: number; alt: string };
  /** Open Graph type; project case studies are articles. */
  ogType?: 'website' | 'article';
};

/**
 * Single entry point for page metadata. Guarantees for every page:
 * unique title + description, self-referencing canonical on SITE_URL, hreflang for publishable
 * locales only (+ x-default → English), Open Graph/Twitter basics, and correct robots.
 */
export async function buildPageMetadata(input: PageMetadataInput): Promise<Metadata> {
  const { locale, path, title, absoluteTitle, description, noindex, availableIn, image, ogType } = input;
  // Page metadata runs alongside the layout's locale check: an unknown `[locale]` segment
  // (e.g. `/xx/about`) is a 404 rendered by the layout — no metadata is built for it.
  if (!hasLocale(routing.locales, locale)) return {};
  const canonical = canonicalUrl(env.siteUrl, locale, path);
  const [publishable, allPublishable, profile, settings] = await Promise.all([
    isLocalePublishable(locale),
    publishableLocales(),
    getProfile(locale),
    getSiteSettings(locale),
  ]);
  const locales = availableIn ? allPublishable.filter((l) => availableIn.includes(l)) : allPublishable;
  // Share image: the page's own (e.g. a project cover) → the Site Settings default → the
  // generated brand image for this locale (Phase 7, SEO_MASTER §35). Never a private original.
  const share = image ?? settings.shareImage ?? defaultShareImage(locale, profile);
  const images = [
    {
      // File paths are case-sensitive: joined verbatim, never normalized like page paths.
      url: share.url.startsWith('/') ? `${env.siteUrl}${share.url}` : share.url,
      width: share.width,
      height: share.height,
      alt: share.alt,
    },
  ];
  const indexable = !noindex && env.isProduction && publishable;
  // No cross-language fallback: an unapproved profile only occurs on unpublishable (noindex/404) locales.
  const siteName = profile?.name ?? OWNER_INPUT_PLACEHOLDER;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      // hreflang only inside the publishable cluster: a noindex page or a page of an unpublishable
      // locale (gated Arabic) declares no alternates — they could never be reciprocal.
      languages: noindex || !publishable ? undefined : languageAlternates(env.siteUrl, path, locales),
    },
    openGraph: {
      type: ogType ?? 'website',
      url: canonical,
      siteName,
      title: absoluteTitle ? title : `${title} — ${siteName}`,
      description,
      locale: OG_LOCALE[locale],
      alternateLocale: publishable ? locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]) : [],
      images,
    },
    twitter: {
      card: 'summary_large_image',
      images: images.map((i) => ({ url: i.url, alt: i.alt })),
      title: absoluteTitle ? title : `${title} — ${siteName}`,
      description,
    },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: !noindex, googleBot: { index: false, follow: !noindex } },
  };
}
