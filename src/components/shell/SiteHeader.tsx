import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getPrimaryNav } from '@/config/navigation';
import { env } from '@/lib/env';
import { getProfile, getRouteAvailability } from '@/content/repository';
import { OWNER_INPUT_PLACEHOLDER } from '@/i18n/messages';
import { availableLocales } from '@/lib/i18n/publication';
import { existingPathsByLocale } from '@/lib/i18n/switch-paths';
import { Container } from '@/components/ui/layout';
import { HeaderNav } from './HeaderNav';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';
import { Wordmark } from './Wordmark';

/**
 * Public header (Server Component). Only three small client islands: desktop nav (aria-current),
 * language switcher (current path), theme toggle, and the mobile menu dialog.
 * Scroll-state styling is pure CSS (.site-header).
 */
export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const nav = getPrimaryNav({
    available: await getRouteAvailability(locale),
    includeUnavailable: !env.isProduction,
  });
  const items = nav.map((item) => ({ href: item.href, label: t(`nav.${item.key}`) }));
  const headerItems = nav
    .filter((item) => item.inHeader)
    .map((item) => ({ href: item.href, label: t(`nav.${item.key}`) }));
  const [locales, profile] = await Promise.all([availableLocales(), getProfile(locale)]);
  const targets = await existingPathsByLocale(locales);
  const name = profile?.name ?? OWNER_INPUT_PLACEHOLDER;
  const languageNames = { en: t('language.en'), ar: t('language.ar') };
  const themeLabels = { toLight: t('a11y.themeToLight'), toDark: t('a11y.themeToDark') };

  return (
    <header className="site-header sticky top-0 z-(--z-header)">
      <Container className="flex h-(--header-height) items-center justify-between gap-3 sm:gap-6">
        <Wordmark name={name} label={t('a11y.wordmarkLabel', { name })} />

        <HeaderNav items={headerItems} label={t('a11y.primaryNav')} className="hidden lg:block" />

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <LanguageSwitcher
            locale={locale}
            locales={locales}
            names={languageNames}
            targets={targets}
            label={t('a11y.languageNav')}
            className="hidden md:block"
          />
          <ThemeToggle labels={themeLabels} />
          <MobileMenu
            className="lg:hidden"
            items={items}
            labels={{
              menu: t('nav.menu'),
              close: t('nav.close'),
              dialog: t('a11y.menuDialog'),
              nav: t('a11y.primaryNav'),
            }}
            brand={
              <span className="font-display text-wordmark font-semibold tracking-(--tracking-wordmark) text-fg-strong uppercase ar:text-base">
                {name}
              </span>
            }
            footer={
              <>
                <LanguageSwitcher
                  locale={locale}
                  locales={locales}
                  names={languageNames}
                  targets={targets}
                  label={t('a11y.languageNav')}
                  landmark={false}
                />
                <ThemeToggle labels={themeLabels} />
              </>
            }
          />
        </div>
      </Container>
    </header>
  );
}
