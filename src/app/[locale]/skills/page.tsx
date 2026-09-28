import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getSkills } from '@/content/repository';
import { gateContentRoute } from '@/lib/route-gate';
import { contentRouteMetadata, pageIdentity } from '@/lib/seo/page-metadata';
import { Container } from '@/components/ui/layout';
import { PageIntro } from '@/components/pages/PageIntro';
import { DevEmptyNotice } from '@/components/pages/DevEmptyNotice';
import { SkillGroups } from '@/components/portfolio/SkillGroups';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return contentRouteMetadata(locale, 'skills');
}

export default async function SkillsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const available = await gateContentRoute(locale, 'skills');
  const [t, tc, common, identity, skills] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.skills' }),
    getTranslations({ locale, namespace: 'pages.categories' }),
    getTranslations({ locale, namespace: 'pages.common' }),
    pageIdentity(locale),
    getSkills(locale),
  ]);
  const categoryLabels = Object.fromEntries(
    [...new Set(skills.map((s) => s.category))].map((c) => [c, tc(c)]),
  );

  return (
    <>
      <PageIntro label={identity.name} title={t('title')} lead={t('lead')} />
      {available ? (
        <Container className="pb-24 md:pb-32">
          <SkillGroups skills={skills} categoryLabels={categoryLabels} labels={{ evidence: t('evidence') }} />
        </Container>
      ) : (
        <DevEmptyNotice message={common('devEmpty')} />
      )}
    </>
  );
}
