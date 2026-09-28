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
  labels: { filter: string; all: string; counts: Record<string, string> };
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
                    'inline-flex min-h-11 items-center rounded-sm border px-4 font-label text-sm',
                    'transition-colors duration-(--duration-base) ease-standard',
                    pressed
                      ? 'border-fg-strong bg-fg-strong text-bg'
                      : 'border-line-strong text-fg-muted hover:border-fg hover:text-fg',
                  )}
                >
                  {category ? (categoryLabels[category] ?? category) : labels.all}
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className="font-label text-xs text-fg-muted">
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
            className={visible.includes(project) ? undefined : 'hidden'}
          />
        ))}
      </div>
    </div>
  );
}
