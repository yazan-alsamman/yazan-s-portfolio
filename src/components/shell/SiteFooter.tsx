import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getPrimaryNav } from '@/config/navigation';
import { getCv, getProfile, getRouteAvailability } from '@/content/repository';
import { socialLabel } from '@/lib/social';
import { OWNER_INPUT_PLACEHOLDER } from '@/i18n/messages';
import { env } from '@/lib/env';
import { availableLocales } from '@/lib/i18n/publication';
import { existingPathsByLocale } from '@/lib/i18n/switch-paths';
import { Container } from '@/components/ui/layout';
import { Divider } from '@/components/ui/surfaces';
import { DevPlaceholder } from './DevPlaceholder';
import { LanguageSwitcher } from './LanguageSwitcher';

/**
 * Footer — full crawlable navigation (SEO_MASTER §15), identity from the profile source,
 * social/contact slots that render only confirmed data. No invented links, emails or phones.
 */
export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const [profile, locales, available, cv] = await Promise.all([
    getProfile(locale),
    availableLocales(),
    getRouteAvailability(locale),
    getCv(locale),
  ]);
  const nav = getPrimaryNav({ available, includeUnavailable: !env.isProduction });
  const targets = await existingPathsByLocale(locales);
  const name = profile?.name ?? OWNER_INPUT_PLACEHOLDER;
  const title = profile?.title ?? null;
  const socialLinks = profile?.socialLinks ?? [];
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-bg-raised">
      <Container className="py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <section aria-labelledby="footer-identity" className="md:col-span-5">
            <h2 id="footer-identity" className="sr-only">
              {t('footer.identity')}
            </h2>
            <p className="font-display text-h3 font-medium text-fg-strong">{name}</p>
            <p className="mt-2 text-sm text-fg-muted">
              {title ?? <DevPlaceholder show={!env.isProduction} />}
            </p>
          </section>

          <nav aria-labelledby="footer-site" className="md:col-span-4">
            <h2 id="footer-site" className="mb-4 font-label text-label text-fg-muted uppercase">
              {t('footer.site')}
            </h2>
            <ul className="grid grid-cols-2 gap-x-6">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-sm text-fg-muted transition-colors duration-(--duration-base) hover:text-fg"
                  >
                    <span className="link-underline">{t(`nav.${item.key}`)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-elsewhere" className="md:col-span-3">
            <h2 id="footer-elsewhere" className="mb-4 font-label text-label text-fg-muted uppercase">
              {t('footer.elsewhere')}
            </h2>
            {socialLinks.length > 0 || cv?.url ? (
              <ul className="flex flex-col">
                {socialLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      rel="me noopener noreferrer"
                      className="inline-flex min-h-11 items-center text-sm text-fg-muted hover:text-fg"
                    >
                      <span className="link-underline">{socialLabel(link)}</span>
                    </a>
                  </li>
                ))}
                {cv?.url ? (
                  <li>
                    <a
                      href={cv.url}
                      download
                      className="inline-flex min-h-11 items-center text-sm text-fg-muted hover:text-fg"
                    >
                      <span className="link-underline">{t('footer.cvDownload')}</span>
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : !env.isProduction ? (
              <p className="rounded-sm border border-dashed border-line px-3 py-2 text-xs text-fg-muted">
                {t('footer.socialPending')}
              </p>
            ) : null}
          </section>
        </div>

        <Divider variant="measured" className="my-10" />

        <div className="flex flex-col-reverse items-start justify-between gap-4 md:flex-row md:items-center">
          <p className="text-xs text-fg-muted">
            © {year} {name}. {t('footer.rights')}
          </p>
          <LanguageSwitcher
            locale={locale}
            locales={locales}
            names={{ en: t('language.en'), ar: t('language.ar') }}
            targets={targets}
            label={t('a11y.languageNav')}
            landmark={false}
          />
        </div>
      </Container>
    </footer>
  );
}
