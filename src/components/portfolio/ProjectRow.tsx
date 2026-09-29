import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { ProjectSummary } from '@/content/types';
import { ArrowIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { frameFit } from '@/lib/image-fit';

/**
 * Project as a case file (design evolution; still an editorial row, not a card grid):
 * a rail with the index and discipline, the title as the single link (stretched over the row:
 * one tab stop, accessible name = title), the summary, the stack as a measured mono line, and the
 * cover as a registered figure when one exists. Hover/focus draws an accent hairline along the
 * top edge, widens the figure marks and advances the arrow — feedback only, never content.
 * Works in server and client trees; every value comes from the CMS summary.
 */
export function ProjectRow({
  project,
  index,
  categoryLabel,
  stackLabel,
  headingLevel = 2,
  className,
}: {
  project: ProjectSummary;
  index: number;
  categoryLabel: string | null;
  /** Visible label for the technology line ("Stack"); omitted → the list stands alone. */
  stackLabel?: string;
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const H = `h${headingLevel}` as const;
  return (
    <article
      className={cn(
        'group/row case-row spot relative grid gap-5 border-t border-line py-10 md:grid-cols-12 md:gap-8 md:py-12',
        className,
      )}
    >
      <div className="flex items-baseline gap-4 md:col-span-2 md:flex-col md:gap-3">
        <p aria-hidden="true" className="font-mono text-meta text-accent-text tabular-nums">
          {String(index).padStart(2, '0')}
        </p>
        {categoryLabel ? (
          <p className="font-label text-label text-fg-muted uppercase">{categoryLabel}</p>
        ) : null}
      </div>
      <div className={cn('flex flex-col gap-4', project.cover ? 'md:col-span-6' : 'md:col-span-9')}>
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
            {stackLabel ? (
              <p className="font-label text-label text-fg-muted uppercase">{stackLabel}</p>
            ) : null}
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
      ) : (
        <div aria-hidden="true" className="hidden items-start justify-end md:col-span-1 md:flex">
          <ArrowIcon className="size-5 text-fg-muted transition-[translate,color] duration-(--duration-base) ease-emphasized group-hover/row:translate-x-1 group-hover/row:text-accent-text rtl:-scale-x-100 rtl:group-hover/row:-translate-x-1" />
        </div>
      )}
    </article>
  );
}
