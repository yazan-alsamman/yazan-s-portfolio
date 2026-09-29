import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getCertificates, getSkills } from '@/content/repository';
import { Link } from '@/i18n/navigation';
import { gateContentRoute } from '@/lib/route-gate';
import { contentRouteMetadata, pageIdentity } from '@/lib/seo/page-metadata';
import { Container } from '@/components/ui/layout';
import { PageIntro } from '@/components/pages/PageIntro';
import { DevEmptyNotice } from '@/components/pages/DevEmptyNotice';
import { SkillGroups } from '@/components/portfolio/SkillGroups';
import { layerLabels } from '@/components/portfolio/case-files';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return contentRouteMetadata(locale, 'skills');
}

export default async function SkillsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const available = await gateContentRoute(locale, 'skills');
  const [t, tc, common, identity, skills, layers, certificateList] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.skills' }),
    getTranslations({ locale, namespace: 'pages.categories' }),
    getTranslations({ locale, namespace: 'pages.common' }),
    pageIdentity(locale),
    getSkills(locale),
    layerLabels(locale),
    getCertificates(locale),
  ]);
  // Skill → certificate evidence: exact (case-insensitive) name matches only.
  const norm = (v: string) => v.trim().toLowerCase();
  const certified = Object.fromEntries(
    skills.map((s) => [
      s.id,
      certificateList
        .filter((c) => norm(c.name) === norm(s.name))
        .map((c) => ({ name: c.name, issuer: c.issuer })),
    ]),
  );
  const categoryLabels = Object.fromEntries(
    [...new Set(skills.map((s) => s.category))].map((c) => [c, tc(c)]),
  );
  const verified = skills.filter((s) => s.provenance !== 'exploration');
  const exploration = skills.filter((s) => s.provenance === 'exploration');

  return (
    <>
      <PageIntro label={identity.name} title={t('title')} lead={t('lead')} />
      {available ? (
        <Container className="pb-24 md:pb-32">
          <SkillGroups
            skills={verified}
            categoryLabels={categoryLabels}
            layerLabels={layers}
            labels={{ evidence: t('evidence'), certified: t('certified') }}
            certificates={certified}
          />
          {exploration.length ? (
            // Phase 14: exploration is set apart (dashed rule) and never mixed into the stack above.
            <section
              aria-labelledby="skills-exploration"
              className="mt-16 grid gap-5 border-t border-dashed border-line-strong pt-8 md:grid-cols-12 md:gap-8"
            >
              <div className="flex flex-col gap-2 md:col-span-3">
                <p aria-hidden="true" className="font-mono text-meta text-accent-text">
                  ~
                </p>
                <h2 id="skills-exploration" className="font-display text-lead font-medium text-fg-strong">
                  {t('exploration')}
                </h2>
              </div>
              <div className="flex flex-col gap-5 md:col-span-9">
                <p className="max-w-(--container-prose) text-body text-fg-muted">{t('explorationLead')}</p>
                <ul className="flex flex-col gap-4">
                  {exploration.map((skill) => (
                    <li key={skill.id} id={`skill-${skill.id}`} className="scroll-mt-28">
                      <p dir="ltr" className="font-display text-lead text-fg-strong ar:text-end">
                        {skill.label ?? skill.name}
                      </p>
                      {skill.evidence.length ? (
                        <p className="mt-1 text-sm text-fg-muted">
                          {t('evidence')}{' '}
                          {skill.evidence.map((p, i) => (
                            <span key={p.slug}>
                              {i > 0 ? ', ' : null}
                              <Link href={`/projects/${p.slug}`} className="text-link hover:text-fg-strong">
                                <span className="link-underline">{p.title}</span>
                              </Link>
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}
        </Container>
      ) : (
        <DevEmptyNotice message={common('devEmpty')} />
      )}
    </>
  );
}
