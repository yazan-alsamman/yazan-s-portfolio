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

  return (
    <>
      <PageIntro label={identity.name} title={t('title')} />
      {available ? (
        <Container className="pb-24 md:pb-32">
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
