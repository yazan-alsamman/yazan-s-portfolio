import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import {
  getCertificates,
  getCv,
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getSkills,
} from '@/content/repository';
import { socialLabel } from '@/lib/social';
import { formatMonthYear } from '@/lib/format';
import { gateContentRoute } from '@/lib/route-gate';
import { contentRouteMetadata, pageIdentity } from '@/lib/seo/page-metadata';
import { Container } from '@/components/ui/layout';
import { PageIntro } from '@/components/pages/PageIntro';
import { DevEmptyNotice } from '@/components/pages/DevEmptyNotice';
import { ExperienceList } from '@/components/portfolio/ExperienceList';
import { EducationList } from '@/components/portfolio/EducationList';
import { SkillGroups } from '@/components/portfolio/SkillGroups';
import { layerLabels } from '@/components/portfolio/case-files';
import { CertificateList } from '@/components/portfolio/CertificateList';
import { SelectedWork } from '@/components/portfolio/SelectedWork';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return contentRouteMetadata(locale, 'cv');
}

/**
 * CV (IA §2): an indexable HTML CV composed from the same CMS entities as the rest of the site
 * (no duplicated facts): identity, summary, experience, education, skills, certificates and
 * contact — plus the per-locale PDF when one is published (served from /api/* with
 * `X-Robots-Tag: noindex`). Without a PDF it is a web-only CV ("Publish the web CV").
 */
export default async function CvPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const available = await gateContentRoute(locale, 'cv');
  const [
    t,
    tx,
    tc,
    tcert,
    tcontact,
    nav,
    common,
    identity,
    cv,
    profile,
    experience,
    education,
    skills,
    certificates,
    projects,
  ] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.cv' }),
    getTranslations({ locale, namespace: 'pages.experience' }),
    getTranslations({ locale, namespace: 'pages.categories' }),
    getTranslations({ locale, namespace: 'pages.certificates' }),
    getTranslations({ locale, namespace: 'pages.contact' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'pages.common' }),
    pageIdentity(locale),
    getCv(locale),
    getProfile(locale),
    getExperience(locale),
    getEducation(locale),
    getSkills(locale),
    getCertificates(locale),
    getProjects(locale),
  ]);
  const social = profile?.socialLinks ?? [];
  const categoryLabels = Object.fromEntries(
    [...new Set(skills.map((s) => s.category))].map((c) => [c, tc(c)]),
  );

  return (
    <>
      <PageIntro label={identity.name} title={t('title')} lead={identity.title}>
        {cv?.url ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={cv.url}
              download
              className="group/btn inline-flex min-h-11 items-center gap-3 rounded-sm bg-fg-strong px-5 font-label text-sm font-medium text-bg transition-colors duration-(--duration-base) hover:bg-accent hover:text-on-accent"
            >
              {cv.label ?? t('download')} <span className="font-normal opacity-70">{common('pdf')}</span>
            </a>
            <p className="font-label text-xs text-fg-muted">
              {cv.version ? t('version', { version: cv.version }) : null}
              {cv.version ? ' · ' : null}
              {t('updated', { date: formatMonthYear(cv.updatedAt, locale) })}
            </p>
          </div>
        ) : null}
      </PageIntro>
      {available ? (
        <Container className="flex flex-col gap-16 pb-24 md:pb-32">
          {profile?.shortBio || profile?.longBio ? (
            <section aria-labelledby="cv-summary" className="max-w-(--container-prose)">
              <h2 id="cv-summary" className="mb-6 font-label text-label text-fg-muted uppercase">
                {nav('about')}
              </h2>
              {profile.shortBio ? <p className="text-lead text-fg">{profile.shortBio}</p> : null}
            </section>
          ) : null}
          {experience.length ? (
            <section aria-labelledby="cv-experience">
              <h2 id="cv-experience" className="mb-6 font-label text-label text-fg-muted uppercase">
                {t('experience')}
              </h2>
              <ExperienceList
                items={experience}
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
            </section>
          ) : null}
          <SelectedWork locale={locale} projects={projects} id="cv-work" />
          {education.length ? (
            <section aria-labelledby="cv-education">
              <h2 id="cv-education" className="mb-6 font-label text-label text-fg-muted uppercase">
                {t('education')}
              </h2>
              <EducationList
                items={education}
                locale={locale}
                compact
                labels={{ present: common('present'), document: common('document') }}
              />
            </section>
          ) : null}
          {skills.length ? (
            <section aria-labelledby="cv-skills">
              <h2 id="cv-skills" className="mb-6 font-label text-label text-fg-muted uppercase">
                {t('skills')}
              </h2>
              <SkillGroups
                skills={skills.filter((s) => s.provenance !== 'exploration')}
                categoryLabels={categoryLabels}
                layerLabels={await layerLabels(locale)}
                labels={{ evidence: '' }}
                headingLevel={3}
                compact
              />
            </section>
          ) : null}
          {certificates.length ? (
            <section aria-labelledby="cv-certificates">
              <h2 id="cv-certificates" className="mb-6 font-label text-label text-fg-muted uppercase">
                {nav('certificates')}
              </h2>
              <CertificateList
                items={certificates}
                locale={locale}
                headingLevel={3}
                compact
                grouped
                labels={{
                  issued: tcert('issued'),
                  credentialId: tcert('credentialId'),
                  verify: tcert('verify'),
                  viewPdf: tcert('viewPdf'),
                  externalHint: common('externalHint'),
                }}
              />
            </section>
          ) : null}
          {profile?.email || social.length ? (
            <section aria-labelledby="cv-contact">
              <h2 id="cv-contact" className="mb-6 font-label text-label text-fg-muted uppercase">
                {nav('contact')}
              </h2>
              <dl className="grid gap-6 border-t border-line pt-8 md:grid-cols-12">
                {profile?.email ? (
                  <div className="md:col-span-5">
                    <dt className="mb-2 font-label text-xs text-fg-muted">{tcontact('email')}</dt>
                    <dd dir="ltr">
                      <a href={`mailto:${profile.email}`} className="text-link hover:text-fg-strong">
                        <span className="link-underline">{profile.email}</span>
                      </a>
                    </dd>
                  </div>
                ) : null}
                {social.length ? (
                  <div className="md:col-span-7">
                    <dt className="mb-2 font-label text-xs text-fg-muted">{tcontact('profiles')}</dt>
                    <dd>
                      <ul className="flex flex-wrap gap-x-6 gap-y-2">
                        {social.map((link) => (
                          <li key={link.url}>
                            <a
                              href={link.url}
                              rel="me noopener noreferrer"
                              className="text-link hover:text-fg-strong"
                            >
                              <span className="link-underline">{socialLabel(link)}</span>{' '}
                              <span className="sr-only">{common('externalHint')}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}
        </Container>
      ) : (
        <DevEmptyNotice message={common('devEmpty')} />
      )}
    </>
  );
}
