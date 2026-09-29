'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { ProjectSummary } from '@/content/types';
import { cn } from '@/lib/cn';
import { ProjectRow, type CaseLabels } from './ProjectRow';

const PARAM = 'discipline';
const EVIDENCE_PARAM = 'evidence';
type Evidence = 'verified' | 'concept';
const evidenceOf = (p: ProjectSummary): Evidence => (p.provenance === 'concept' ? 'concept' : 'verified');

/**
 * Projects index with a discipline filter (IA §2: client-side filter; every project is linked in
 * plain HTML). The server render contains all rows; the filter only hides rows after hydration,
 * so crawlers and no-JS visitors always get the complete list. The filter appears only when
 * there are at least two disciplines. Phase 12: disciplines are listed in the server-provided
 * order (intelligent systems first) and the active one is deep-linkable (`?discipline=`), kept in
 * the URL with `replaceState` (no history spam, shareable, restored on load). Phase 14: a second,
 * independent evidence filter (verified work / concept systems, `?evidence=`) when both exist.
 */
export function ProjectIndex({
  projects,
  categories,
  categoryLabels,
  labels,
  figures,
}: {
  projects: ProjectSummary[];
  /** Disciplines present, in display order (computed on the server). */
  categories: string[];
  categoryLabels: Record<string, string>;
  labels: {
    filter: string;
    all: string;
    counts: Record<string, string>;
    case: CaseLabels;
    evidenceFilter: string;
    evidence: Record<Evidence, string>;
  };
  /** Server-rendered schematics for projects without a cover, keyed by project id. */
  figures: Record<string, ReactNode>;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const kinds = (['verified', 'concept'] as const).filter((k) => projects.some((p) => evidenceOf(p) === k));

  // Restore deep-linked filters after hydration (the server render is always unfiltered).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get(PARAM);
    const wantedEvidence = params.get(EVIDENCE_PARAM);
    /* eslint-disable react-hooks/set-state-in-effect -- URL state exists only in the browser */
    if (wanted && categories.includes(wanted)) setActive(wanted);
    if (wantedEvidence === 'verified' || wantedEvidence === 'concept') setEvidence(wantedEvidence);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [categories]);

  const writeParam = (name: string, value: string | null) => {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(name, value);
    else url.searchParams.delete(name);
    window.history.replaceState(window.history.state, '', url);
  };
  const select = (category: string | null) => {
    setActive(category);
    writeParam(PARAM, category);
  };
  const selectEvidence = (value: Evidence | null) => {
    setEvidence(value);
    writeParam(EVIDENCE_PARAM, value);
  };

  const inEvidence = (p: ProjectSummary) => !evidence || evidenceOf(p) === evidence;
  const visible = projects.filter((p) => inEvidence(p) && (!active || p.category === active));
  const countKey = String(visible.length);

  const chip = (pressed: boolean) =>
    cn(
      'inline-flex min-h-11 items-center gap-2.5 rounded-sm border px-4 font-label text-sm',
      'transition-colors duration-(--duration-base) ease-standard active:translate-y-px',
      pressed
        ? 'border-fg-strong bg-fg-strong text-bg'
        : 'border-line-strong text-fg-muted hover:border-fg hover:text-fg',
    );
  // Per-option count (decorative; the live region below announces the filtered total).
  const count = (n: number) => (
    <span aria-hidden="true" className="font-mono text-meta tabular-nums">
      {String(n).padStart(2, '0')}
    </span>
  );

  return (
    <div className="flex flex-col gap-8">
      {categories.length > 1 || kinds.length > 1 ? (
        <div className="flex flex-col gap-3">
          {categories.length > 1 ? (
            <div role="group" aria-label={labels.filter} className="flex flex-wrap gap-2">
              {[null, ...categories].map((category) => (
                <button
                  key={category ?? 'all'}
                  type="button"
                  aria-pressed={active === category}
                  onClick={() => select(category)}
                  className={chip(active === category)}
                >
                  {category ? (categoryLabels[category] ?? category) : labels.all}
                  {count(
                    projects.filter((p) => inEvidence(p) && (!category || p.category === category)).length,
                  )}
                </button>
              ))}
            </div>
          ) : null}
          {kinds.length > 1 ? (
            <div role="group" aria-label={labels.evidenceFilter} className="flex flex-wrap gap-2">
              {kinds.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={evidence === kind}
                  // A second press clears the evidence filter (both kinds shown).
                  onClick={() => selectEvidence(evidence === kind ? null : kind)}
                  className={cn(chip(evidence === kind), kind === 'concept' && 'border-dashed')}
                >
                  {labels.evidence[kind]}
                  {count(projects.filter((p) => evidenceOf(p) === kind).length)}
                </button>
              ))}
            </div>
          ) : null}
          <p aria-live="polite" className="font-mono text-meta text-fg-muted">
            {labels.counts[countKey] ?? countKey}
          </p>
        </div>
      ) : null}
      <div className="border-b border-line">
        {projects.map((project, i) => (
          <ProjectRow
            key={project.id}
            project={project}
            index={i + 1}
            categoryLabel={project.category ? (categoryLabels[project.category] ?? null) : null}
            labels={labels.case}
            figure={figures[project.id]}
            className={visible.includes(project) ? undefined : 'hidden'}
          />
        ))}
      </div>
    </div>
  );
}
