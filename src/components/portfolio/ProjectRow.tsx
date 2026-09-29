import Image from 'next/image';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import type { ProjectDossier, ProjectSummary } from '@/content/types';
import { cn } from '@/lib/cn';
import { frameFit } from '@/lib/image-fit';

/** Translated labels for the case-file facts (plain strings: the row also renders client-side). */
export type CaseLabels = {
  stack: string;
  source: string;
  documented: string;
  /** "4 figures", keyed by count (ICU plural resolved on the server). */
  figures: Record<string, string>;
  sections: Record<ProjectDossier['sections'][number], string>;
};

/**
 * Project as an engineering case file (Phase 12): a rail (index, discipline, year), the title as
 * the single link (stretched over the row: one tab stop, accessible name = title), the summary,
 * the stack, and a dossier line — source available, figures, documented sections — all derived
 * from the CMS document (`ProjectSummary.dossier`), omitted when absent. The figure column always
 * carries something honest: the cover when one is published, otherwise the server-rendered
 * discipline schematic passed in as `figure` (desktop only; phones keep the list compact).
 * Hover/focus draws the top hairline and widens the figure marks — feedback, never content.
 */
export function ProjectRow({
  project,
  index,
  categoryLabel,
  labels,
  figure,
  headingLevel = 2,
  className,
}: {
  project: ProjectSummary;
  index: number;
  categoryLabel: string | null;
  labels?: CaseLabels;
  /** Schematic for projects without a cover (rendered on the server). */
  figure?: ReactNode;
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const H = `h${headingLevel}` as const;
  const dossier = project.dossier;
  const facts: string[] = [];
  if (labels && dossier) {
    if (dossier.source) facts.push(labels.source);
    if (dossier.figures > 0) facts.push(labels.figures[String(dossier.figures)] ?? String(dossier.figures));
    if (dossier.sections.length)
      facts.push(`${labels.documented}: ${dossier.sections.map((s) => labels.sections[s]).join(', ')}`);
  }
  return (
    <article
      className={cn(
        'group/row case-row spot relative grid gap-5 border-t border-line py-10 md:grid-cols-12 md:gap-8 md:py-12',
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 md:col-span-2 md:flex-col md:gap-3">
        <p aria-hidden="true" className="font-mono text-meta text-accent-text tabular-nums">
          {String(index).padStart(2, '0')}
        </p>
        {categoryLabel ? (
          <p className="font-label text-label text-fg-muted uppercase">{categoryLabel}</p>
        ) : null}
        {dossier?.year ? (
          <p className="font-mono text-meta text-fg-muted tabular-nums">
            <time dateTime={dossier.year}>{dossier.year}</time>
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-4 md:col-span-6">
        <H className="font-display text-h3 font-medium text-fg-strong">
          <Link
            href={`/projects/${project.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-focus"
          >
            <span className="link-underline">{project.title}</span>
          </Link>
        </H>
        <p className="max-w-(--container-prose) text-body text-fg-muted">{project.summary}</p>
        {project.technologies.length ? (
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            {labels ? <p className="font-label text-label text-fg-muted uppercase">{labels.stack}</p> : null}
            <ul className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-meta text-fg">
              {project.technologies.map((tech, i) => (
                <li key={tech.id} dir="ltr" className="flex items-baseline gap-3">
                  {i > 0 ? (
                    <span aria-hidden="true" className="text-fg-muted">
                      /
                    </span>
                  ) : null}
                  {tech.label ?? tech.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {facts.length ? (
          <ul className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-meta text-fg-muted">
            {facts.map((fact) => (
              <li key={fact} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1 bg-accent" />
                {fact}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {project.cover ? (
        <figure className="fig-marks md:col-span-4">
          <div className="relative aspect-[3/2] overflow-hidden rounded-sm border border-line bg-surface">
            <Image
              src={project.cover.url}
              alt={project.cover.alt}
              fill
              sizes="(min-width: 48rem) 30vw, 100vw"
              className={cn(
                frameFit(project.cover),
                'transition-transform duration-(--duration-slow) ease-emphasized group-hover/row:scale-[1.03]',
              )}
            />
          </div>
        </figure>
      ) : figure ? (
        <div className="fig-marks hidden md:col-span-4 md:block">{figure}</div>
      ) : null}
    </article>
  );
}
