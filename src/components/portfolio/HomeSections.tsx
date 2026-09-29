import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { homeSectionOrder, type HomeSectionKey } from '@/content/types';
import {
  getCertificates,
  getExperience,
  getProfile,
  getProjects,
  getRouteAvailability,
  getSkills,
} from '@/content/repository';
import { Container } from '@/components/ui/layout';
import { ButtonLink, TextLink } from '@/components/ui/actions';
import { cn } from '@/lib/cn';
import { ProjectRow } from './ProjectRow';
import { SkillGroups } from './SkillGroups';
import { ExperienceList } from './ExperienceList';
import { CertificateList } from './CertificateList';

const PIPELINE = ['ideas', 'engineering', 'systems', 'intelligence'] as const;

/**
 * The portfolio that follows the approved cinematic landing (Phase 4, inside `#portfolio`).
 * Homepage contract order (homeSectionOrder); each section renders only with verified content
 * and links onward to its full route (IA §5: Home → Projects, About, Experience, …).
 * Design evolution: every section opens like a chapter of an engineering document — index,
 * "shown of total" measured from the CMS, a display-size title — and the page closes on the
 * pipeline the landing narrated (ideas → engineering → systems → intelligence).
 */
export async function HomeSections({
  locale,
  sections,
}: {
  locale: Locale;
  sections: Record<HomeSectionKey, boolean>;
}) {
  const [t, tc, tx, tcert, common, contact, profile, projects, skills, experience, certificates, routes] =
    await Promise.all([
      getTranslations({ locale, namespace: 'pages.portfolio' }),
      getTranslations({ locale, namespace: 'pages.categories' }),
      getTranslations({ locale, namespace: 'pages.experience' }),
      getTranslations({ locale, namespace: 'pages.certificates' }),
      getTranslations({ locale, namespace: 'pages.common' }),
      getTranslations({ locale, namespace: 'pages.contact' }),
      getProfile(locale),
      getProjects(locale),
      getSkills(locale),
      getExperience(locale),
      getCertificates(locale),
      getRouteAvailability(locale),
    ]);
  const name = profile?.name ?? '';
  const index = (key: HomeSectionKey) => String(homeSectionOrder.indexOf(key) + 1).padStart(2, '0');
  const featured = projects.filter((p) => p.featured).slice(0, 6);
  const shownCertificates = certificates.slice(0, 4);
  const skillCategories = Object.fromEntries(
    [...new Set(skills.map((s) => s.category))].map((c) => [c, tc(c)]),
  );
  const of = (shown: number, total: number) =>
    t('shownOf', { shown: String(shown).padStart(2, '0'), total: String(total).padStart(2, '0') });

  return (
    <>
      {sections.introduction && profile?.shortBio ? (
        <HomeSection
          id="introduction"
          index={index('introduction')}
          title={t('introduction')}
          variant="label"
        >
          <div className="grid gap-8 md:grid-cols-12">
            <p className="font-display text-h2 font-medium text-fg-strong md:col-span-10 xl:col-span-9">
              {profile.shortBio}
            </p>
            {routes.about ? (
              <p className="text-lead md:col-span-12">
                <TextLink href="/about">{t('readMore', { name })}</TextLink>
              </p>
            ) : null}
          </div>
        </HomeSection>
      ) : null}

      {sections.selectedWork && featured.length ? (
        <HomeSection
          id="selected-work"
          index={index('selectedWork')}
          title={t('selectedWork')}
          meta={of(featured.length, projects.length)}
          action={routes.projects ? { href: '/projects', label: t('allProjects') } : undefined}
        >
          <div className="border-b border-line">
            {featured.map((p, i) => (
              <ProjectRow
                key={p.id}
                project={p}
                index={i + 1}
                headingLevel={3}
                categoryLabel={p.category ? tc(p.category) : null}
                stackLabel={t('stack')}
              />
            ))}
          </div>
        </HomeSection>
      ) : null}

      {sections.expertise && skills.length ? (
        <HomeSection
          id="expertise"
          index={index('expertise')}
          title={t('expertise')}
          meta={of(skills.length, skills.length)}
          action={{ href: '/skills', label: t('allSkills') }}
        >
          <SkillGroups
            skills={skills}
            categoryLabels={skillCategories}
            labels={{ evidence: '' }}
            headingLevel={3}
            compact
          />
        </HomeSection>
      ) : null}

      {sections.experience && experience.length ? (
        <HomeSection
          id="experience"
          index={index('experience')}
          title={t('experience')}
          meta={of(Math.min(3, experience.length), experience.length)}
          action={{ href: '/experience', label: t('allExperience') }}
        >
          <ExperienceList
            items={experience.slice(0, 3)}
            locale={locale}
            headingLevel={3}
            compact
            labels={{
              present: common('present'),
              technologies: tx('technologies'),
              projects: tx('projects'),
              externalHint: common('externalHint'),
            }}
          />
        </HomeSection>
      ) : null}

      {sections.credentials && certificates.length ? (
        <HomeSection
          id="credentials"
          index={index('credentials')}
          title={t('credentials')}
          meta={of(shownCertificates.length, certificates.length)}
          action={{ href: '/certificates', label: t('allCertificates') }}
        >
          <CertificateList
            items={shownCertificates}
            locale={locale}
            headingLevel={3}
            compact
            labels={{
              issued: tcert('issued'),
              credentialId: tcert('credentialId'),
              verify: tcert('verify'),
              viewPdf: tcert('viewPdf'),
              externalHint: common('externalHint'),
            }}
          />
        </HomeSection>
      ) : null}

      {sections.contact && routes.contact ? (
        <HomeSection id="contact" index={index('contact')} title={t('contact')} variant="label" closing>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
            {/* The pipeline the landing narrated, restated as the reason to write. */}
            <ol className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:col-span-4 lg:grid-cols-1 lg:gap-y-7">
              {PIPELINE.map((step, i) => (
                <li key={step} className="pipeline-step flex items-baseline gap-4">
                  <span aria-hidden="true" className="font-mono text-meta text-accent-text tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-lead text-fg-strong">{t(`pipeline.${step}`)}</span>
                </li>
              ))}
            </ol>
            <div className="flex flex-col items-start gap-10 lg:col-span-8 lg:col-start-5">
              <p className="font-display text-display font-medium text-fg-strong">{t('contactLead')}</p>
              <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
                <ButtonLink href="/contact">{t('contactCta')}</ButtonLink>
                {profile?.email ? (
                  <p className="flex flex-col gap-1">
                    <span className="font-label text-label text-fg-muted uppercase">{contact('email')}</span>
                    <a
                      href={`mailto:${profile.email}`}
                      dir="ltr"
                      className="inline-flex min-h-11 items-center font-mono text-body break-all text-fg hover:text-accent-text"
                    >
                      <span className="link-underline">{profile.email}</span>
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </HomeSection>
      ) : null}
    </>
  );
}

function HomeSection({
  id,
  index,
  title,
  meta,
  action,
  variant = 'title',
  closing = false,
  children,
}: {
  id: string;
  index: string;
  title: string;
  /** Measured context, e.g. "03 of 14" (from the CMS). */
  meta?: string;
  action?: { href: string; label: string };
  /** `label`: the content itself is display type, so the heading stays a quiet index label. */
  variant?: 'title' | 'label';
  /** The final chapter: extra room and a measured rule above it. */
  closing?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`home-${id}`}
      className={cn('py-20 md:py-28', closing && 'border-t border-line pt-24 pb-28 md:pt-32 md:pb-40')}
    >
      <Container className="flex flex-col gap-10 md:gap-14">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          {variant === 'title' ? (
            <div className="flex flex-col gap-5">
              <p aria-hidden="true" className="flex items-center gap-3 font-mono text-meta tabular-nums">
                <span className="text-accent-text">{index}</span>
                <span className="h-px w-10 bg-line-strong" />
                {meta ? <span className="text-fg-muted">{meta}</span> : null}
              </p>
              <h2 id={`home-${id}`} className="font-display text-h2 font-medium text-fg-strong">
                {title}
              </h2>
            </div>
          ) : (
            <h2
              id={`home-${id}`}
              className="flex items-center gap-3 font-label text-label font-normal text-fg-muted uppercase"
            >
              <span className="font-mono text-meta text-accent-text tabular-nums">{index}</span>
              <span aria-hidden="true" className="h-px w-10 bg-line-strong" />
              <span>{title}</span>
            </h2>
          )}
          {action ? <TextLink href={action.href}>{action.label}</TextLink> : null}
        </div>
        <div className="reveal">{children}</div>
      </Container>
    </section>
  );
}
