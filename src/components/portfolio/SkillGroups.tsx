import { Link } from '@/i18n/navigation';
import type { SkillDetail } from '@/content/types';
import { cn } from '@/lib/cn';

/**
 * Skills as a capability matrix (design evolution): one hairline cell per CMS category, in CMS
 * display order — index, discipline and a measured count, then the capabilities. No percentages
 * or bars (CONTENT_MODEL); a proficiency label only when the owner supplied one. Each skill links
 * to the projects that demonstrate it (IA §5) and carries a stable anchor (`#skill-<id>`).
 */
export function SkillGroups({
  skills,
  categoryLabels,
  labels,
  headingLevel = 2,
  compact = false,
}: {
  skills: SkillDetail[];
  categoryLabels: Record<string, string>;
  labels: { evidence: string };
  headingLevel?: 2 | 3;
  compact?: boolean;
}) {
  const groups = new Map<string, SkillDetail[]>();
  for (const skill of skills) groups.set(skill.category, [...(groups.get(skill.category) ?? []), skill]);
  const H = `h${headingLevel}` as const;

  return (
    <div className={cn('matrix sm:grid-cols-2', groups.size > 2 && 'lg:grid-cols-3')}>
      {[...groups.entries()].map(([category, items], gi) => (
        <section
          key={category}
          aria-labelledby={`skills-${category}`}
          className="spot flex flex-col gap-6 p-6 md:p-8"
        >
          <div className="flex items-baseline justify-between gap-4">
            <H
              id={`skills-${category}`}
              className="flex items-baseline gap-3 font-label text-label font-normal text-fg-muted uppercase"
            >
              <span aria-hidden="true" className="font-mono text-meta text-accent-text tabular-nums">
                {String(gi + 1).padStart(2, '0')}
              </span>
              {categoryLabels[category] ?? category}
            </H>
            <span aria-hidden="true" className="font-mono text-meta text-fg-muted tabular-nums">
              {String(items.length).padStart(2, '0')}
            </span>
          </div>
          <ul className={compact ? 'flex flex-wrap gap-x-5 gap-y-2' : 'flex flex-col gap-5'}>
            {items.map((skill) => (
              <li key={skill.id} id={compact ? undefined : `skill-${skill.id}`} className="scroll-mt-28">
                <p dir="ltr" className="font-display text-lead text-fg-strong ar:text-end">
                  {skill.label ?? skill.name}
                </p>
                {!compact && skill.proficiencyLabel ? (
                  <p className="text-sm text-fg-muted">{skill.proficiencyLabel}</p>
                ) : null}
                {!compact && skill.evidence.length ? (
                  <p className="mt-1 text-sm text-fg-muted">
                    {labels.evidence}{' '}
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
        </section>
      ))}
    </div>
  );
}
