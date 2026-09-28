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
import { ProjectRow } from './ProjectRow';
import { SkillGroups } from './SkillGroups';
import { ExperienceList } from './ExperienceList';
import { CertificateList } from './CertificateList';

/**
 * The portfolio that follows the approved cinematic landing (Phase 4, inside `#portfolio`).
 * Homepage contract order (homeSectionOrder); each section renders only with verified content
 * and links onward to its full route (IA §5: Home → Projects, About, Experience, …).
 */
export async function HomeSections({
  locale,
  sections,
}: {
  locale: Locale;
  sections: Record<HomeSectionKey, boolean>;
}) {
  const [t, tc, tx, tcert, common, profile, projects, skills, experience, certificates, routes] =
    await Promise.all([
      getTranslations({ locale, namespace: 'pages.portfolio' }),
      getTranslations({ locale, namespace: 'pages.categories' }),
      getTranslations({ locale, namespace: 'pages.experience' }),
      getTranslations({ locale, namespace: 'pages.certificates' }),
      getTranslations({ locale, namespace: 'pages.common' }),
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
  const skillCategories = Object.fromEntries(
    [...new Set(skills.map((s) => s.category))].map((c) => [c, tc(c)]),
  );

  return (
    <>
      {sections.introduction && profile?.shortBio ? (
        <HomeSection id="introduction" index={index('introduction')} title={t('introduction')}>
          <p className="max-w-[40ch] font-display text-h2 font-medium text-fg-strong">{profile.shortBio}</p>
          {routes.about ? (
            <p className="mt-8 text-lead">
              <TextLink href="/about">{t('readMore', { name })}</TextLink>
            </p>
          ) : null}
        </HomeSection>
      ) : null}

      {sections.selectedWork && featured.length ? (
        <HomeSection
          id="selected-work"
          index={index('selectedWork')}
          title={t('selectedWork')}
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
          action={{ href: '/certificates', label: t('allCertificates') }}
        >
          <CertificateList
            items={certificates.slice(0, 4)}
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
        <HomeSection id="contact" index={index('contact')} title={t('contact')}>
          <div className="flex flex-col items-start gap-8">
            <p className="font-display text-h1 font-medium text-fg-strong">{t('contactLead')}</p>
            <ButtonLink href="/contact">{t('contactCta')}</ButtonLink>
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
  action,
  children,
}: {
  id: string;
  index: string;
  title: string;
  action?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`home-${id}`} className="py-20 md:py-28">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2
            id={`home-${id}`}
            className="flex items-center gap-3 font-label text-label font-normal text-fg-muted uppercase"
          >
            <span className="text-accent-text tabular-nums">{index}</span>
            <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
            <span>{title}</span>
          </h2>
          {action ? <TextLink href={action.href}>{action.label}</TextLink> : null}
        </div>
        <div className="reveal">{children}</div>
      </Container>
    </section>
  );
}
