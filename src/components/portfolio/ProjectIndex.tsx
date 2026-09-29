'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { ProjectSummary } from '@/content/types';
import { cn } from '@/lib/cn';
import { ProjectRow, type CaseLabels } from './ProjectRow';

const PARAM = 'discipline';

/**
 * Projects index with a discipline filter (IA §2: client-side filter; every project is linked in
 * plain HTML). The server render contains all rows; the filter only hides rows after hydration,
 * so crawlers and no-JS visitors always get the complete list. The filter appears only when
 * there are at least two disciplines. Phase 12: disciplines are listed in the server-provided
 * order (intelligent systems first) and the active one is deep-linkable (`?discipline=`), kept in
 * the URL with `replaceState` (no history spam, shareable, restored on load).
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
  labels: { filter: string; all: string; counts: Record<string, string>; case: CaseLabels };
  /** Server-rendered schematics for projects without a cover, keyed by project id. */
  figures: Record<string, ReactNode>;
}) {
  const [active, setActive] = useState<string | null>(null);

  // Restore a deep-linked discipline after hydration (the server render is always unfiltered).
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get(PARAM);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL state exists only in the browser
    if (wanted && categories.includes(wanted)) setActive(wanted);
  }, [categories]);

  const select = (category: string | null) => {
    setActive(category);
    const url = new URL(window.location.href);
    if (category) url.searchParams.set(PARAM, category);
    else url.searchParams.delete(PARAM);
    window.history.replaceState(window.history.state, '', url);
  };

  const visible = active ? projects.filter((p) => p.category === active) : projects;
  const countKey = String(visible.length);

  return (
    <div className="flex flex-col gap-8">
      {categories.length > 1 ? (
        <div className="flex flex-col gap-3">
          <div role="group" aria-label={labels.filter} className="flex flex-wrap gap-2">
            {[null, ...categories].map((category) => {
              const pressed = active === category;
              return (
                <button
                  key={category ?? 'all'}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => select(category)}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2.5 rounded-sm border px-4 font-label text-sm',
                    'transition-colors duration-(--duration-base) ease-standard active:translate-y-px',
                    pressed
                      ? 'border-fg-strong bg-fg-strong text-bg'
                      : 'border-line-strong text-fg-muted hover:border-fg hover:text-fg',
                  )}
                >
                  {category ? (categoryLabels[category] ?? category) : labels.all}
                  {/* Per-discipline count, from the rendered list itself (decorative; the live
                      region below announces the filtered total). */}
                  <span aria-hidden="true" className="font-mono text-meta tabular-nums">
                    {String(
                      category ? projects.filter((p) => p.category === category).length : projects.length,
                    ).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>
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
