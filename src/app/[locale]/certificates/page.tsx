import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getCertificates } from '@/content/repository';
import { gateContentRoute } from '@/lib/route-gate';
import { contentRouteMetadata, pageIdentity } from '@/lib/seo/page-metadata';
import { Container } from '@/components/ui/layout';
import { PageIntro } from '@/components/pages/PageIntro';
import { DevEmptyNotice } from '@/components/pages/DevEmptyNotice';
import { CertificateList } from '@/components/portfolio/CertificateList';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return contentRouteMetadata(locale, 'certificates');
}

export default async function CertificatesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const available = await gateContentRoute(locale, 'certificates');
  const [t, common, identity, items] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.certificates' }),
    getTranslations({ locale, namespace: 'pages.common' }),
    pageIdentity(locale),
    getCertificates(locale),
  ]);
  const issuers = [
    ...items.reduce((m, c) => m.set(c.issuer, (m.get(c.issuer) ?? 0) + 1), new Map<string, number>()),
  ];

  return (
    <>
      <PageIntro label={identity.name} title={t('title')} />
      {available ? (
        <Container className="flex flex-col gap-12 pb-24 md:pb-32">
          {/* Issuer index (Phase 13): the register's structure at a glance — jump links with counts,
              in the same order and ids as the grouped register below. */}
          {issuers.length > 1 ? (
            <nav aria-label={t('issuers')} className="flex flex-col gap-3">
              <p className="font-label text-label text-fg-muted uppercase">{t('issuers')}</p>
              <ul className="flex flex-wrap gap-2">
                {issuers.map(([issuer, count], gi) => (
                  <li key={issuer}>
                    <a
                      href={`#issuer-${gi}`}
                      className="inline-flex min-h-11 items-center gap-2.5 rounded-sm border border-line-strong px-4 font-label text-sm text-fg-muted transition-colors duration-(--duration-base) ease-standard hover:border-fg hover:text-fg"
                    >
                      {issuer}
                      <span aria-hidden="true" className="font-mono text-meta tabular-nums">
                        {String(count).padStart(2, '0')}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          <CertificateList
            items={items}
            locale={locale}
            grouped
            labels={{
              issued: t('issued'),
              credentialId: t('credentialId'),
              verify: t('verify'),
              viewPdf: t('viewPdf'),
              externalHint: common('externalHint'),
            }}
          />
        </Container>
      ) : (
        <DevEmptyNotice message={common('devEmpty')} />
      )}
    </>
  );
}
