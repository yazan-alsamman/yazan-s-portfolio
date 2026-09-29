import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import {
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getRouteAvailability,
} from '@/content/repository';
import { orderedDisciplines } from '@/lib/disciplines';
import { gateContentRoute } from '@/lib/route-gate';
import { contentRouteMetadata, pageIdentity } from '@/lib/seo/page-metadata';
import { Container } from '@/components/ui/layout';
import { TextLink } from '@/components/ui/actions';
import { RichText } from '@/components/content/RichText';
import { PageIntro } from '@/components/pages/PageIntro';
import { DevEmptyNotice } from '@/components/pages/DevEmptyNotice';
import { EducationList } from '@/components/portfolio/EducationList';
// The owner-approved authoritative portrait (D-5), the same asset the approved Phase 3 scene uses.
import portrait from '../../../../portrait.jpg';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return contentRouteMetadata(locale, 'about');
}

/**
 * About (IA §2): long biography (CMS), portrait, education, and links onward to the other live
 * routes (IA §5: About → Projects, Experience, CV, Contact). The portrait prefers a CMS portrait
 * when the owner uploads one; otherwise the approved `portrait.jpg`, shown with the same crop
 * as the landing (third-party hand excluded), never enlarged beyond its 538 px source width.
 */
export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const available = await gateContentRoute(locale, 'about');
  const [t, nav, common, tc, identity, profile, education, experience, projects, routes] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.about' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'pages.common' }),
    getTranslations({ locale, namespace: 'pages.categories' }),
    pageIdentity(locale),
    getProfile(locale),
    getEducation(locale),
    getExperience(locale),
    getProjects(locale),
    getRouteAvailability(locale),
  ]);
  const role = experience[0];
  const degree = education[0];
  const focus = orderedDisciplines(projects.filter((p) => p.featured).map((p) => p.category)).map((c) =>
    tc(c),
  );
  const facts: [string, string][] = [
    ...(profile?.title ? [[t('facts.title'), profile.title] as [string, string]] : []),
    ...(role ? [[t('facts.role'), `${role.title} · ${role.organization}`] as [string, string]] : []),
    ...(degree
      ? [
          [
            t('facts.education'),
            [degree.degree, degree.institution, degree.endDate?.slice(0, 4)].filter(Boolean).join(' · '),
          ] as [string, string],
        ]
      : []),
    ...(focus.length ? [[t('facts.focus'), focus.join(' · ')] as [string, string]] : []),
  ];
  const onward = (['projects', 'experience', 'cv', 'contact'] as const).filter((key) => routes[key]);
  const portraitAlt = t('portraitAlt', { name: identity.name });

  return (
    <>
      <PageIntro label={identity.name} title={t('title')} lead={profile?.shortBio ?? undefined} />
      {available ? (
        <Container className="flex flex-col gap-20 pb-24 md:pb-32">
          <div className="grid gap-12 md:grid-cols-12 md:gap-8">
            <figure className="flex flex-col gap-4 self-start md:sticky md:top-[calc(var(--header-height)+2rem)] md:col-span-4 md:col-start-1">
              {profile?.portrait ? (
                <Image
                  src={profile.portrait.url}
                  alt={profile.portrait.alt || portraitAlt}
                  width={profile.portrait.width}
                  height={profile.portrait.height}
                  sizes="(min-width: 48rem) 22rem, 80vw"
                  className="fig-marks h-auto w-full max-w-[22rem] rounded-sm border border-line"
                />
              ) : (
                <div className="fig-marks max-w-[22rem]">
                  <div className="cine-portrait-crop">
                    <Image
                      src={portrait}
                      alt={portraitAlt}
                      sizes="(min-width: 48rem) 22rem, 80vw"
                      placeholder="blur"
                      className="cine-portrait-img"
                    />
                  </div>
                </div>
              )}
              {/* Caption: the confirmed identity only (CMS Profile), set as a figure label. */}
              <figcaption className="flex max-w-[22rem] flex-col gap-1 border-t border-line pt-3">
                <span className="font-label text-sm text-fg-strong">{identity.name}</span>
                {identity.title ? (
                  <span className="font-mono text-meta text-fg-muted">{identity.title}</span>
                ) : null}
              </figcaption>
            </figure>
            <div className="flex flex-col gap-12 md:col-span-7 md:col-start-6">
              {/* Engineer's profile sheet (Phase 12): verified CMS facts only; empty facts omitted. */}
              {facts.length ? (
                <section aria-labelledby="about-profile" className="flex flex-col gap-4">
                  <h2 id="about-profile" className="font-label text-label text-fg-muted uppercase">
                    {t('profile')}
                  </h2>
                  <dl className={facts.length > 1 ? 'matrix sm:grid-cols-2' : 'matrix'}>
                    {facts.map(([term, value]) => (
                      <div key={term} className="flex flex-col gap-2 p-5">
                        <dt className="font-label text-label text-fg-muted uppercase">{term}</dt>
                        <dd className="text-body text-fg-strong">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}
              <RichText value={profile?.longBio} headingBase={2} className="text-lead" />
            </div>
          </div>

          {education.length ? (
            <section aria-labelledby="about-education">
              <h2 id="about-education" className="mb-6 font-label text-label text-fg-muted uppercase">
                {t('education')}
              </h2>
              <EducationList
                items={education}
                locale={locale}
                labels={{ present: common('present'), document: common('document') }}
              />
            </section>
          ) : null}

          {onward.length ? (
            <nav aria-label={t('continue')} className="flex flex-col gap-4">
              <p className="font-label text-label text-fg-muted uppercase">{t('continue')}</p>
              <ul className="flex flex-wrap gap-x-8 gap-y-3 text-lead">
                {onward.map((key) => (
                  <li key={key}>
                    <TextLink href={`/${key}`}>{nav(key)}</TextLink>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </Container>
      ) : (
        <DevEmptyNotice message={common('devEmpty')} />
      )}
    </>
  );
}
