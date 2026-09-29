import type { Metadata } from 'next';
import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { env } from '@/lib/env';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { homeStructuredData, serializeJsonLd } from '@/lib/seo/structured-data';
import {
  getCertificates,
  getHomeSectionAvailability,
  getProfile,
  getProjects,
  getRouteAvailability,
  getSiteSettings,
  getSkills,
} from '@/content/repository';
import { homeSectionOrder } from '@/content/types';
import { OWNER_INPUT_PLACEHOLDER } from '@/i18n/messages';
import { Container, Section } from '@/components/ui/layout';
import { Label } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/actions';
import { orderedDisciplines } from '@/lib/disciplines';
import { DevPlaceholder } from '@/components/shell/DevPlaceholder';
import { HomeSections } from '@/components/portfolio/HomeSections';
import { CinematicStage } from '@/components/cinematic/CinematicStage';
import { StaticComposition } from '@/components/cinematic/StaticComposition';
import { StaticCore } from '@/components/cinematic/StaticCore';
import { ACTS, type ActId } from '@/scene/timeline';
// Build-time hashed copy of the authoritative 538×661 portrait; the source file is never modified.
import portrait from '../../../portrait.jpg';

type Props = { params: Promise<{ locale: Locale }> };

/** Acts that carry a caption chapter (arrival, identity and transition have bespoke layouts). */
const CAPTIONED = ['ignition', 'intelligence', 'engineering', 'systems', 'human'] as const;

/** Caption placement keeps copy clear of the act's 3D subject (world-space → physical side). */
const captionSide: Record<(typeof CAPTIONED)[number], string> = {
  ignition: 'lg:mx-auto lg:text-center',
  intelligence: 'lg:mr-auto',
  engineering: 'lg:mr-auto',
  systems: 'lg:mr-auto',
  human: 'lg:ml-auto',
};

/** Act label as a real heading (same visual language as <Label>, which renders a <p>). */
function ActHeading({ id, index, children }: { id: string; index: string; children: ReactNode }) {
  return (
    <h2 id={id} className="flex items-center gap-3 font-label text-label font-normal text-fg-muted uppercase">
      <span className="text-accent-text tabular-nums">{index}</span>
      <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
      <span>{children}</span>
    </h2>
  );
}

const chapterStyle = (id: ActId): CSSProperties =>
  ({
    '--act-length': ACTS.find((a) => a.id === id)!.length,
  }) as CSSProperties;

/**
 * Home title/description: the owner's Site Settings ("SEO & sharing", approved in this locale)
 * when set; otherwise the defaults built from the confirmed identity (Phase 7, R-48).
 */
async function homeSeo(locale: Locale) {
  const [t, profile, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getProfile(locale),
    getSiteSettings(locale),
  ]);
  const name = profile?.name ?? OWNER_INPUT_PLACEHOLDER;
  const title = profile?.title ?? null;
  return {
    // H1 contract: "<name> — <title>", both from the CMS Profile approved in this locale.
    title: settings.homeTitle ?? (title ? `${name} — ${title}` : name),
    description:
      settings.homeDescription ?? t('homeDescription', { name, title: title ?? OWNER_INPUT_PLACEHOLDER }),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const seo = await homeSeo(locale);
  return buildPageMetadata({
    locale,
    path: '/',
    title: seo.title,
    absoluteTitle: true,
    description: seo.description,
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const [profile, entity, sections, seo, projects, skills, certificates, routes] = await Promise.all([
    getProfile(locale),
    getProfile('en'), // canonical entity name for JSON-LD (identical on every locale)
    getHomeSectionAvailability(locale),
    homeSeo(locale),
    getProjects(locale),
    getSkills(locale),
    getCertificates(locale),
    getRouteAvailability(locale),
  ]);
  // Focus: the disciplines of the owner's featured projects, intelligent systems first.
  const focus = orderedDisciplines(projects.filter((p) => p.featured).map((p) => p.category)).map((c) =>
    t(`pages.categories.${c}`),
  );
  // Hero readout: counts of verified, published CMS content only (nothing is typed in by hand).
  const readout = (
    [
      ['projects', projects.length],
      ['skills', skills.length],
      ['certificates', certificates.length],
    ] as const
  ).filter(([, count]) => count > 0);
  const name = profile?.name ?? null;
  const title = profile?.title ?? null;
  const pending = homeSectionOrder.filter((key) => !sections[key]);

  return (
    <>
      {entity ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              homeStructuredData(env.siteUrl, locale, {
                entityName: entity.name,
                jobTitle: title,
                sameAs: (profile?.socialLinks ?? []).map((l) => l.url),
                siteDescription: seo.description,
              }),
            ),
          }}
        />
      ) : null}

      {/*
        Cinematic landing (Phase 3). Two layers share one timeline (src/scene/timeline.ts):
        - the chapters below: server-rendered, crawlable, accessible — authoritative content;
        - the sticky stage: a static CSS composition, progressively upgraded to WebGL.
        The 3D layer never carries text and never replaces the HTML identity.
      */}
      <section id="cinematic" className="cine" data-cinematic="pending" aria-labelledby="home-title">
        <div className="cine-stage" data-theme="dark" aria-hidden="true">
          <StaticComposition />
          <CinematicStage rootId="cinematic" portraitSrc={portrait.src} />
        </div>

        <div className="cine-chapters" data-theme="dark">
          {/* ACT I — Arrival: the identity is present in the first paint, no loader. */}
          <div className="cine-chapter cine-arrival" data-act="arrival" style={chapterStyle('arrival')}>
            {/* The hero object as a drawing: first paint and the static tier; yields to the 3D core. */}
            <StaticCore />
            {/*
              Phase 12 — the arrival reads as one drawing sheet: identity at the lower left (who,
              what), the discipline focus and the single primary action beneath it (what is built,
              where to go), and a title block under the core at the lower right (what the object
              is, what the archive holds). Every value is CMS data.
            */}
            <Container className="hero-sheet relative flex min-h-svh flex-col justify-end gap-8 pb-[10svh]">
              <h1 id="home-title" className="flex flex-col items-start gap-5">
                <span className="block font-display text-display font-medium text-fg-strong">
                  {name ?? <DevPlaceholder show={!env.isProduction} />}
                </span>
                {title ? (
                  <>
                    <span className="sr-only">{t('a11y.titleSeparator')}</span>
                    <span className="block font-label text-h3 font-normal text-fg-muted">{title}</span>
                  </>
                ) : (
                  <DevPlaceholder show={!env.isProduction} />
                )}
              </h1>
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col items-start gap-6">
                  {focus.length ? (
                    <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="font-label text-label text-fg-muted uppercase">
                        {t('cinematic.focus')}
                      </span>
                      <span className="font-mono text-meta text-fg">{focus.join(' · ')}</span>
                    </p>
                  ) : null}
                  {routes.projects ? <ButtonLink href="/projects">{t('cinematic.cta')}</ButtonLink> : null}
                </div>
                {readout.length ? (
                  <div className="title-block w-full lg:w-[min(27rem,36vw)]">
                    <p
                      aria-hidden="true"
                      className="hidden border-b border-line px-4 py-3 font-mono text-meta text-fg-muted lg:block"
                    >
                      {t('cinematic.figure')}
                    </p>
                    <dl aria-label={t('cinematic.readout')} className="grid grid-cols-3">
                      {readout.map(([key, count]) => (
                        <div key={key} className="flex min-w-0 flex-col gap-1 px-3 py-3 sm:px-4">
                          <dt className="order-2 font-label text-label text-fg-muted uppercase max-sm:tracking-[0.06em]">
                            {t(`nav.${key}`)}
                          </dt>
                          <dd className="order-1 font-mono text-lead text-fg-strong tabular-nums sm:text-h3">
                            {String(count).padStart(2, '0')}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-6">
                <p className="cine-cue font-label text-label text-fg-muted uppercase">
                  {t('cinematic.scrollCue')}
                </p>
                <a
                  href="#portfolio"
                  className="inline-flex min-h-11 items-center font-label text-label text-fg uppercase"
                >
                  <span className="link-underline">{t('cinematic.skipIntro')}</span>
                </a>
              </div>
            </Container>
          </div>

          {/* ACTS II–VI — one caption per act; the scene illustrates, the text states. */}
          {CAPTIONED.map((id, index) => (
            <div
              key={id}
              className="cine-chapter"
              data-act={id}
              style={chapterStyle(id)}
              aria-labelledby={`act-${id}`}
              role="group"
            >
              <Container className="flex h-full items-center">
                <div className={`cine-copy reveal max-w-(--container-prose) ${captionSide[id]}`}>
                  <ActHeading id={`act-${id}`} index={String(index + 2).padStart(2, '0')}>
                    {t(`cinematic.acts.${id}.label`)}
                  </ActHeading>
                  <p className="mt-5 font-display text-h2 font-medium text-fg-strong">
                    {t(`cinematic.acts.${id}.line`)}
                  </p>
                  {id === 'human' ? (
                    // HTML portrait: the visible portrait in static mode; in WebGL mode it stays in
                    // the accessibility tree (the canvas is aria-hidden) but is visually yielded.
                    <figure className="cine-portrait-fallback mt-10">
                      <div className="cine-portrait-crop">
                        <Image
                          src={portrait}
                          alt={name ? t('cinematic.portraitAlt', { name }) : ''}
                          sizes="(min-width: 64rem) 20rem, 70vw"
                          placeholder="blur"
                          className="cine-portrait-img"
                        />
                      </div>
                    </figure>
                  ) : null}
                </div>
              </Container>
            </div>
          ))}

          {/* ACT VII — Identity: display composition (the H1 above remains the semantic heading). */}
          <div
            className="cine-chapter"
            data-act="identity"
            style={chapterStyle('identity')}
            aria-hidden="true"
          >
            <Container className="flex h-full flex-col items-start justify-center gap-4 pb-[26svh]">
              <p className="cine-identity font-display text-display font-medium text-fg-strong">{name}</p>
              {title ? <p className="font-label text-h3 text-accent-text">{title}</p> : null}
            </Container>
          </div>

          {/* ACT VIII — Transition: the scene yields to the portfolio. */}
          <div
            className="cine-chapter cine-transition"
            data-act="transition"
            style={chapterStyle('transition')}
            role="group"
            aria-labelledby="act-transition"
          >
            <Container className="flex h-full flex-col justify-center">
              <div className="reveal">
                <ActHeading id="act-transition" index="08">
                  {t('cinematic.transition.label')}
                </ActHeading>
                <p className="mt-5 font-display text-h2 font-medium text-fg-strong">
                  {t('cinematic.transition.line')}
                </p>
              </div>
            </Container>
          </div>
        </div>
      </section>

      {/* The portfolio proper. Remaining sections render only with verified content;
          development builds list what is pending so the homepage contract stays visible. */}
      <div id="portfolio" tabIndex={-1} className="outline-none">
        {/* Phase 4: the portfolio sections (each only with verified content). */}
        <HomeSections locale={locale} sections={sections} />
        {!env.isProduction && pending.length > 0 ? (
          <Section spacing="compact" aria-labelledby="home-pending">
            <Container>
              <div className="rounded-md border border-dashed border-warning/40 p-6 md:p-8">
                <h2 id="home-pending" className="mb-6 font-label text-label text-warning uppercase">
                  {t('home.devNotice')}
                </h2>
                <ol className="grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pending.map((key) => (
                    <li key={key}>
                      <Label index={String(homeSectionOrder.indexOf(key) + 1).padStart(2, '0')}>
                        {t(`home.sections.${key}`)}
                      </Label>
                      <p className="mt-1 ps-12 text-xs text-fg-muted">{t('home.devPending')}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Container>
          </Section>
        ) : null}
      </div>
    </>
  );
}
