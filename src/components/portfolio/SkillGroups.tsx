import { Link } from '@/i18n/navigation';
import type { SkillDetail } from '@/content/types';

/**
 * Skills grouped by category, in CMS display order. No percentages or bars (CONTENT_MODEL);
 * a proficiency label only when the owner supplied one. Each skill links to the projects that
 * demonstrate it (IA §5) and carries a stable anchor (`#skill-<id>`) for project pages.
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
    <div className="border-b border-line">
      {[...groups.entries()].map(([category, items], gi) => (
        <section
          key={category}
          aria-labelledby={`skills-${category}`}
          className="grid gap-6 border-t border-line py-10 md:grid-cols-12 md:gap-8"
        >
          <H
            id={`skills-${category}`}
            className="flex items-baseline gap-3 font-label text-label text-fg-muted uppercase md:col-span-3"
          >
            <span aria-hidden="true" className="text-accent-text tabular-nums">
              {String(gi + 1).padStart(2, '0')}
            </span>
            {categoryLabels[category] ?? category}
          </H>
          <ul
            className={
              compact
                ? 'flex flex-wrap gap-x-6 gap-y-3 md:col-span-9'
                : 'grid gap-x-8 gap-y-6 sm:grid-cols-2 md:col-span-9 xl:grid-cols-3'
            }
          >
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
