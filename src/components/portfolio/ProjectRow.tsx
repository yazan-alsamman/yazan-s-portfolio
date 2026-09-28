import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { ProjectSummary } from '@/content/types';
import { cn } from '@/lib/cn';
import { frameFit } from '@/lib/image-fit';

/**
 * Editorial project row (not a card grid — PHASE 4 visual brief): index numeral, title as the
 * single link (stretched over the row: one tab stop, accessible name = title), summary,
 * category and technologies, and the cover when one exists. Works in server and client trees.
 */
export function ProjectRow({
  project,
  index,
  categoryLabel,
  headingLevel = 2,
  className,
}: {
  project: ProjectSummary;
  index: number;
  categoryLabel: string | null;
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const H = `h${headingLevel}` as const;
  return (
    <article
      className={cn(
        'group/row relative grid gap-6 border-t border-line py-10 md:grid-cols-12 md:gap-8',
        'transition-colors duration-(--duration-base) ease-standard hover:border-line-strong',
        className,
      )}
    >
      <p aria-hidden="true" className="font-label text-label text-accent-text tabular-nums md:col-span-1">
        {String(index).padStart(2, '0')}
      </p>
      <div className={cn('flex flex-col gap-4', project.cover ? 'md:col-span-7' : 'md:col-span-11')}>
        <H className="font-display text-h3 font-medium text-fg-strong">
          <Link
            href={`/projects/${project.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-focus"
          >
            <span className="link-underline">{project.title}</span>
          </Link>
        </H>
        <p className="max-w-(--container-prose) text-body text-fg-muted">{project.summary}</p>
        {categoryLabel || project.technologies.length ? (
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 font-label text-xs text-fg-muted">
            {categoryLabel ? <li className="text-accent-text">{categoryLabel}</li> : null}
            {project.technologies.map((tech) => (
              <li key={tech.id} dir="ltr">
                {tech.label ?? tech.name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {project.cover ? (
        <div className="relative aspect-[3/2] overflow-hidden rounded-md border border-line bg-surface md:col-span-4">
          <Image
            src={project.cover.url}
            alt={project.cover.alt}
            fill
            sizes="(min-width: 48rem) 30vw, 100vw"
            className={cn(
              frameFit(project.cover),
              'transition-transform duration-(--duration-slow) ease-emphasized group-hover/row:scale-[1.02]',
            )}
          />
        </div>
      ) : null}
    </article>
  );
}
