import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getProjects } from '@/content/repository';
import { gateContentRoute } from '@/lib/route-gate';
import { contentRouteMetadata, pageIdentity } from '@/lib/seo/page-metadata';
import { Container } from '@/components/ui/layout';
import { PageIntro } from '@/components/pages/PageIntro';
import { DevEmptyNotice } from '@/components/pages/DevEmptyNotice';
import { ProjectIndex } from '@/components/portfolio/ProjectIndex';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return contentRouteMetadata(locale, 'projects');
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const available = await gateContentRoute(locale, 'projects');
  const [t, tc, common, portfolio, identity, projects] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.projects' }),
    getTranslations({ locale, namespace: 'pages.categories' }),
    getTranslations({ locale, namespace: 'pages.common' }),
    getTranslations({ locale, namespace: 'pages.portfolio' }),
    pageIdentity(locale),
    getProjects(locale),
  ]);
  const categoryLabels = Object.fromEntries(
    [...new Set(projects.map((p) => p.category).filter((c): c is string => !!c))].map((c) => [c, tc(c)]),
  );
  const counts = Object.fromEntries(
    Array.from({ length: projects.length + 1 }, (_, n) => [String(n), t('count', { count: n })]),
  );

  return (
    <>
      <PageIntro label={identity.name} title={t('title')} lead={t('lead', identity)} />
      {available ? (
        <Container className="pb-24 md:pb-32">
          <ProjectIndex
            projects={projects}
            categoryLabels={categoryLabels}
            labels={{ filter: t('filter'), all: t('all'), counts, stack: portfolio('stack') }}
          />
        </Container>
      ) : (
        <DevEmptyNotice message={common('devEmpty')} />
      )}
    </>
  );
}
