import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getEducation, getProfile, getRouteAvailability } from '@/content/repository';
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
  const [t, nav, common, identity, profile, education, routes] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.about' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'pages.common' }),
    pageIdentity(locale),
    getProfile(locale),
    getEducation(locale),
    getRouteAvailability(locale),
  ]);
  const onward = (['projects', 'experience', 'cv', 'contact'] as const).filter((key) => routes[key]);
  const portraitAlt = t('portraitAlt', { name: identity.name });

  return (
    <>
      <PageIntro label={identity.name} title={t('title')} lead={profile?.shortBio ?? undefined} />
      {available ? (
        <Container className="flex flex-col gap-20 pb-24 md:pb-32">
          <div className="grid gap-12 md:grid-cols-12 md:gap-8">
            <figure className="md:col-span-4 md:col-start-1">
              {profile?.portrait ? (
                <Image
                  src={profile.portrait.url}
                  alt={profile.portrait.alt || portraitAlt}
                  width={profile.portrait.width}
                  height={profile.portrait.height}
                  sizes="(min-width: 48rem) 22rem, 80vw"
                  className="h-auto w-full max-w-[22rem] rounded-md border border-line"
                />
              ) : (
                <div className="cine-portrait-crop max-w-[22rem]">
                  <Image
                    src={portrait}
                    alt={portraitAlt}
                    sizes="(min-width: 48rem) 22rem, 80vw"
                    placeholder="blur"
                    className="cine-portrait-img"
                  />
                </div>
              )}
            </figure>
            <div className="md:col-span-7 md:col-start-6">
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
