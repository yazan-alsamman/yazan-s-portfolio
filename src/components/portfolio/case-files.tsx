import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import type { ProjectSummary } from '@/content/types';
import { LAYER_ORDER, type Layer } from '@/lib/disciplines';
import type { CaseLabels } from './ProjectRow';
import { ProjectSchematic } from './ProjectSchematic';

/** Translated names of the capability-stack layers (SkillGroups). */
export async function layerLabels(locale: Locale): Promise<Record<Layer, string>> {
  const t = await getTranslations({ locale, namespace: 'pages.skills.layers' });
  return Object.fromEntries(LAYER_ORDER.map((l) => [l, t(l)])) as Record<Layer, string>;
}

/**
 * Server-side preparation for case-file rows (Phase 12): translated labels (ICU plurals resolved
 * here, so rows stay plain-props for the client project index) and the schematic figure for every
 * project without a cover — passed down as markup, so no schematic code ships to the browser.
 */
export async function caseFiles(
  locale: Locale,
  projects: ProjectSummary[],
): Promise<{ labels: CaseLabels; figures: Record<string, ReactNode> }> {
  const [t, tp] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.portfolio' }),
    getTranslations({ locale, namespace: 'pages.project' }),
  ]);
  const counts = [...new Set(projects.map((p) => p.dossier?.figures ?? 0))];
  const labels: CaseLabels = {
    stack: t('stack'),
    source: t('dossier.source'),
    documented: t('dossier.documented'),
    concept: t('concept'),
    designObjective: tp('designObjective'),
    figures: Object.fromEntries(counts.map((n) => [String(n), t('dossier.figures', { count: n })])),
    sections: {
      problem: tp('problem'),
      solution: tp('approach'),
      architecture: tp('architecture'),
      intelligence: tp('intelligence'),
      results: tp('results'),
    },
  };
  const figures = Object.fromEntries(
    projects
      .filter((p) => !p.cover)
      .map((p) => [
        p.id,
        <ProjectSchematic
          key={p.id}
          slug={p.slug}
          category={p.category}
          motif={p.schematic}
          index={projects.indexOf(p) + 1}
          caption={t(p.provenance === 'concept' ? 'dossier.schematicConcept' : 'dossier.schematic')}
        />,
      ]),
  );
  return { labels, figures };
}
