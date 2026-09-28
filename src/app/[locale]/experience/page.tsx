import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getExperience, getRouteAvailability } from '@/content/repository';
import { gateContentRoute } from '@/lib/route-gate';
import { contentRouteMetadata, pageIdentity } from '@/lib/seo/page-metadata';
import { Container } from '@/components/ui/layout';
import { PageIntro } from '@/components/pages/PageIntro';
import { DevEmptyNotice } from '@/components/pages/DevEmptyNotice';
import { ExperienceList } from '@/components/portfolio/ExperienceList';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return contentRouteMetadata(locale, 'experience');
}

export default async function ExperiencePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const available = await gateContentRoute(locale, 'experience');
  const [t, common, identity, items, routes] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.experience' }),
    getTranslations({ locale, namespace: 'pages.common' }),
    pageIdentity(locale),
    getExperience(locale),
    getRouteAvailability(locale),
  ]);

  return (
    <>
      <PageIntro label={identity.name} title={t('title')} />
      {available ? (
        <Container className="pb-24 md:pb-32">
          <ExperienceList
            items={items}
            locale={locale}
            linkToSkills={routes.skills}
            labels={{
              present: common('present'),
              technologies: t('technologies'),
              projects: t('projects'),
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
