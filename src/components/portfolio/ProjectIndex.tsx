'use client';

import { useState } from 'react';
import type { ProjectSummary } from '@/content/types';
import { cn } from '@/lib/cn';
import { ProjectRow } from './ProjectRow';

/**
 * Projects index with a category filter (IA §2: client-side filter; every project is linked in
 * plain HTML). The server render contains all rows; the filter only hides rows after hydration,
 * so crawlers and no-JS visitors always get the complete list. The filter appears only when
 * there are at least two categories to choose from.
 */
export function ProjectIndex({
  projects,
  categoryLabels,
  labels,
}: {
  projects: ProjectSummary[];
  categoryLabels: Record<string, string>;
  labels: { filter: string; all: string; counts: Record<string, string>; stack?: string };
}) {
  const [active, setActive] = useState<string | null>(null);
  const categories = [...new Set(projects.map((p) => p.category).filter((c): c is string => !!c))];
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
                  onClick={() => setActive(category)}
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
            stackLabel={labels.stack}
            className={visible.includes(project) ? undefined : 'hidden'}
          />
        ))}
      </div>
    </div>
  );
}
