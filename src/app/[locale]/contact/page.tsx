import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getProfile } from '@/content/repository';
import { gateContentRoute } from '@/lib/route-gate';
import { contentRouteMetadata, pageIdentity } from '@/lib/seo/page-metadata';
import { socialLabel } from '@/lib/social';
import { Container } from '@/components/ui/layout';
import { PageIntro } from '@/components/pages/PageIntro';
import { DevEmptyNotice } from '@/components/pages/DevEmptyNotice';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return contentRouteMetadata(locale, 'contact');
}

/**
 * ADR-013 (v1): no contact form — only the owner-approved email and social profiles from the
 * CMS Profile. Nothing is invented: a channel appears only when the owner has supplied it.
 */
export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const available = await gateContentRoute(locale, 'contact');
  const [t, common, identity, profile] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.contact' }),
    getTranslations({ locale, namespace: 'pages.common' }),
    pageIdentity(locale),
    getProfile(locale),
  ]);
  const email = profile?.email ?? null;
  const social = profile?.socialLinks ?? [];

  return (
    <>
      <PageIntro
        label={identity.name}
        title={t('title')}
        lead={available ? t('lead', identity) : undefined}
      />
      {available ? (
        <Container className="grid gap-12 pb-24 md:grid-cols-12 md:pb-32">
          {email ? (
            <section aria-labelledby="contact-email" className="md:col-span-7">
              <h2 id="contact-email" className="mb-4 font-label text-label text-fg-muted uppercase">
                {t('email')}
              </h2>
              <a
                href={`mailto:${email}`}
                dir="ltr"
                className="inline-flex min-h-11 items-center font-display text-h2 font-medium break-all text-fg-strong hover:text-accent-text"
              >
                <span className="link-underline">{email}</span>
              </a>
            </section>
          ) : null}
          {social.length ? (
            <section
              aria-labelledby="contact-profiles"
              className={email ? 'md:col-span-5' : 'md:col-span-12'}
            >
              <h2 id="contact-profiles" className="mb-4 font-label text-label text-fg-muted uppercase">
                {t('profiles')}
              </h2>
              <ul className="border-b border-line">
                {social.map((link) => (
                  <li key={link.url} className="border-t border-line">
                    <a
                      href={link.url}
                      rel="me noopener noreferrer"
                      className="flex min-h-14 items-center justify-between gap-4 py-3 text-lead text-fg hover:text-fg-strong"
                    >
                      <span className="link-underline">{socialLabel(link)}</span>
                      <span className="sr-only">{common('externalHint')}</span>
                      <span aria-hidden="true" className="text-fg-muted rtl:-scale-x-100">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </Container>
      ) : (
        <DevEmptyNotice message={common('devEmpty')} />
      )}
    </>
  );
}
