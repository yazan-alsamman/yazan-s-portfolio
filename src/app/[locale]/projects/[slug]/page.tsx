import type { Metadata } from 'next';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing, type Locale } from '@/i18n/routing';
import type { Project, ProjectSummary } from '@/content/types';
import { getProjectBySlug, getProjects, getRedirect, getRouteAvailability } from '@/content/repository';
import { env } from '@/lib/env';
import { formatPeriod } from '@/lib/format';
import { publishableLocales } from '@/lib/i18n/publication';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { frameFit, isPortrait } from '@/lib/image-fit';
import { breadcrumbStructuredData, projectStructuredData, serializeJsonLd } from '@/lib/seo/structured-data';
import { localizedPath } from '@/lib/seo/urls';
import { cn } from '@/lib/cn';
import { Container } from '@/components/ui/layout';
import { Label } from '@/components/ui/typography';
import { ButtonLink, TextLink } from '@/components/ui/actions';
import { RichText } from '@/components/content/RichText';
import { Breadcrumbs } from '@/components/pages/Breadcrumbs';
import { ProjectRow } from '@/components/portfolio/ProjectRow';
import { TechnologyList } from '@/components/portfolio/TechnologyList';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

/** Published projects are prerendered; a project published later renders on first request (dynamicParams). */
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!hasLocale(routing.locales, params.locale)) return [];
  const projects = await getProjects(params.locale);
  return projects.map((p) => ({ slug: p.slug }));
}

/** Project absent in this locale: a retired slug redirects (T9), anything else is a 404. */
async function resolveProject(locale: Locale, slug: string): Promise<Project> {
  const project = await getProjectBySlug(locale, slug);
  if (project) return project;
  const moved = await getRedirect(`/projects/${slug}`);
  if (moved) {
    const target = localizedPath(locale, moved.to);
    if (moved.status === 308) permanentRedirect(target);
    redirect(target);
  }
  notFound();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(locale, slug);
  if (!project) return {};
  const locales = await publishableLocales();
  const existing = await Promise.all(locales.map((l) => getProjectBySlug(l, slug)));
  return buildPageMetadata({
    locale,
    path: `/projects/${slug}`,
    title: project.seo.title,
    description: project.seo.description,
    availableIn: locales.filter((_, i) => existing[i] !== null),
    image: project.cover ?? undefined,
    ogType: 'article',
  });
}

/** Up to three related projects: same category first, then shared technologies. */
function related(project: Project, all: ProjectSummary[]): ProjectSummary[] {
  const techIds = new Set(project.technologies.map((t) => t.id));
  return all
    .filter((p) => p.slug !== project.slug)
    .map((p) => ({
      p,
      score:
        (project.category && p.category === project.category ? 2 : 0) +
        p.technologies.filter((t) => techIds.has(t.id)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ p }) => p);
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = await resolveProject(locale, slug);
  const [t, tc, common, nav, portfolio, all, routes] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.project' }),
    getTranslations({ locale, namespace: 'pages.categories' }),
    getTranslations({ locale, namespace: 'pages.common' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'pages.portfolio' }),
    getProjects(locale),
    getRouteAvailability(locale),
  ]);
  const category = project.category ? tc(project.category) : null;
  const period = formatPeriod(project.timeline.start, project.timeline.end, locale, null);
  const relatedProjects = related(project, all);
  const body: [string, unknown][] = [
    [t('overview'), project.body.description],
    [t('problem'), project.body.problem],
    [t('approach'), project.body.solution],
    [t('architecture'), project.body.architecture],
    [t('results'), project.body.results],
  ];
  const details: [string, ReactNode][] = [
    ...(project.role ? [[t('role'), project.role] as [string, ReactNode]] : []),
    ...(period ? [[t('timeline'), period] as [string, ReactNode]] : []),
    ...(category ? [[t('category'), category] as [string, ReactNode]] : []),
    ...(project.experience
      ? [
          [t('context'), `${project.experience.title} · ${project.experience.organization}`] as [
            string,
            ReactNode,
          ],
        ]
      : []),
  ];

  const jsonLd = [
    breadcrumbStructuredData(env.siteUrl, locale, [
      [common('home'), '/'],
      [nav('projects'), '/projects'],
      [project.title, `/projects/${project.slug}`],
    ]),
    projectStructuredData(env.siteUrl, locale, {
      path: `/projects/${project.slug}`,
      name: project.title,
      description: project.seo.description,
      dateModified: project.updatedAt,
      image: project.cover ? `${env.siteUrl}${project.cover.url}` : undefined,
    }),
  ];

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      <header className="pt-10 pb-12 md:pt-14 md:pb-16">
        <Container className="flex flex-col gap-8">
          <Breadcrumbs
            label={common('breadcrumb')}
            items={[
              { name: common('home'), href: '/' },
              { name: nav('projects'), href: '/projects' },
              { name: project.title },
            ]}
          />
          <div className="flex flex-col gap-6">
            {category ? <Label>{category}</Label> : null}
            <h1 className="max-w-[22ch] font-display text-h1 font-medium text-fg-strong">{project.title}</h1>
            <p className="max-w-(--container-prose) text-lead text-fg-muted">{project.summary}</p>
          </div>
          {details.length ? (
            // Spec sheet: every cell is a CMS field; empty fields produce no cell.
            <dl className={cn('matrix sm:grid-cols-2', details.length > 2 && 'lg:grid-cols-4')}>
              {details.map(([term, value]) => (
                <div key={term} className="flex flex-col gap-2 p-5 md:p-6">
                  <dt className="font-label text-label text-fg-muted uppercase">{term}</dt>
                  <dd className="text-body text-fg-strong">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Container>
      </header>

      {project.cover ? (
        <Container className="pb-16">
          <div className="fig-marks">
            <div className="relative aspect-video overflow-hidden rounded-sm border border-line bg-surface">
              <Image
                src={project.cover.url}
                alt={project.cover.alt}
                fill
                priority
                sizes="(min-width: 90rem) 84rem, 100vw"
                className={frameFit(project.cover)}
              />
            </div>
          </div>
        </Container>
      ) : null}

      <Container className="flex flex-col pb-16">
        {body
          .filter(([, value]) => value)
          .map(([heading, value], i) => (
            <CaseSection key={heading} heading={heading} index={i + 1}>
              <RichText value={value} />
            </CaseSection>
          ))}

        {project.technologies.length ? (
          <CaseSection heading={t('technologies')}>
            <TechnologyList technologies={project.technologies} linkToSkills={routes.skills} />
          </CaseSection>
        ) : null}

        {project.gallery.length || project.videoUrl ? (
          <CaseSection heading={t('media')}>
            <div className="flex flex-col gap-8">
              {project.gallery.map((img) => (
                <figure key={img.url} className="overflow-hidden rounded-md border border-line bg-surface">
                  <Image
                    src={img.url}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    sizes={
                      isPortrait(img) ? '(min-width: 48rem) 20rem, 80vw' : '(min-width: 64rem) 56rem, 100vw'
                    }
                    // Portrait screens are capped in height and centred; landscape fills the width.
                    className={isPortrait(img) ? 'mx-auto h-auto max-h-176 w-auto' : 'h-auto w-full'}
                  />
                </figure>
              ))}
              {project.videoUrl ? (
                <p>
                  <TextLink href={project.videoUrl}>
                    {t('video')} <span className="sr-only">{common('externalHint')}</span>
                  </TextLink>
                </p>
              ) : null}
            </div>
          </CaseSection>
        ) : null}

        {project.links.length ? (
          <CaseSection heading={t('links')}>
            <ul className="flex flex-col gap-2">
              {project.links.map((link) => (
                <li key={link.url}>
                  <TextLink href={link.url}>
                    {link.label} <span className="sr-only">{common('externalHint')}</span>
                  </TextLink>
                </li>
              ))}
            </ul>
          </CaseSection>
        ) : null}
      </Container>

      {relatedProjects.length ? (
        <section aria-labelledby="related-heading" className="pb-16">
          <Container>
            <h2 id="related-heading" className="mb-6 font-label text-label text-fg-muted uppercase">
              {t('related')}
            </h2>
            <div className="border-b border-line">
              {relatedProjects.map((p, i) => (
                <ProjectRow
                  key={p.id}
                  project={p}
                  index={i + 1}
                  headingLevel={3}
                  categoryLabel={p.category ? tc(p.category) : null}
                  stackLabel={portfolio('stack')}
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <Container className="flex flex-wrap items-center gap-4 pb-24 md:pb-32">
        <ButtonLink href="/projects" variant="secondary">
          {t('allProjects')}
        </ButtonLink>
        {routes.contact ? (
          <ButtonLink href="/contact" variant="primary">
            {t('contactCta')}
          </ButtonLink>
        ) : null}
      </Container>
    </article>
  );
}

/**
 * Case-study section: label column + reading column on desktop, stacked on mobile. Narrative
 * sections carry an index (01 overview → 05 results) so the case reads as one engineered document.
 */
function CaseSection({ heading, index, children }: { heading: string; index?: number; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-10 md:grid-cols-12 md:gap-8 md:py-14">
      <h2 className="flex items-baseline gap-3 font-label text-label text-fg-muted uppercase md:col-span-3 md:flex-col md:gap-2">
        {index ? (
          <span aria-hidden="true" className="font-mono text-meta text-accent-text tabular-nums">
            {String(index).padStart(2, '0')}
          </span>
        ) : null}
        <span>{heading}</span>
      </h2>
      <div className="md:col-span-8 lg:col-span-7">{children}</div>
    </section>
  );
}
