import { Link } from '@/i18n/navigation';
import type { SkillDetail } from '@/content/types';
import { cn } from '@/lib/cn';
import { LAYER_ORDER, layerOf, type Layer } from '@/lib/disciplines';

/**
 * Skills as a capability stack (Phase 12): the CMS categories placed in the layers of a system
 * architecture, drawn top-down like one (L4 interfaces … L1 foundations), with adjacent
 * disciplines set apart. Structure, not self-assessment: no percentages or bars (CONTENT_MODEL);
 * a proficiency label only when the owner supplied one. Layers without skills are not drawn.
 * Within a layer, each category is a hairline cell (index, discipline, measured count) in CMS
 * display order. Each skill links to the projects that demonstrate it (IA §5) and keeps its
 * stable anchor (`#skill-<id>`).
 */
export function SkillGroups({
  skills,
  categoryLabels,
  layerLabels,
  labels,
  certificates = {},
  headingLevel = 2,
  compact = false,
}: {
  skills: SkillDetail[];
  categoryLabels: Record<string, string>;
  layerLabels: Record<Layer, string>;
  labels: { evidence: string; certified?: string };
  /**
   * Phase 13: certificates whose name is exactly the skill's name (case-insensitive), keyed by
   * skill id — supporting evidence from the register, never a fuzzy or inferred match.
   */
  certificates?: Record<string, { name: string; issuer: string }[]>;
  headingLevel?: 2 | 3;
  compact?: boolean;
}) {
  const groups = new Map<string, SkillDetail[]>();
  for (const skill of skills) groups.set(skill.category, [...(groups.get(skill.category) ?? []), skill]);
  const categoryIndex = new Map([...groups.keys()].map((c, i) => [c, i + 1]));
  const present = LAYER_ORDER.map((layer) => ({
    layer,
    categories: [...groups.keys()].filter((c) => layerOf(c) === layer),
  })).filter((l) => l.categories.length);
  const stacked = present.filter((l) => l.layer !== 'adjacent').length;
  // Stack numbering counts up from the foundation (L1), like a layered architecture diagram.
  const layers = present.map((l, i) => ({
    ...l,
    level: stacked - present.slice(0, i).filter((x) => x.layer !== 'adjacent').length,
  }));
  const H = `h${headingLevel}` as const;
  const H2 = `h${headingLevel + 1}` as 'h3' | 'h4';

  return (
    <div className="border-b border-line">
      {layers.map(({ layer, categories, level }) => {
        const adjacent = layer === 'adjacent';
        return (
          <section
            key={layer}
            aria-labelledby={`layer-${layer}`}
            className={cn(
              'grid gap-5 border-t border-line py-8 md:grid-cols-12 md:gap-8',
              adjacent && 'border-dashed',
            )}
          >
            <div className="flex items-baseline gap-4 md:col-span-3 md:flex-col md:gap-2">
              <p aria-hidden="true" className="font-mono text-meta text-accent-text tabular-nums">
                {adjacent ? '+' : `L${level}`}
              </p>
              <H id={`layer-${layer}`} className="font-display text-lead font-medium text-fg-strong">
                {layerLabels[layer]}
              </H>
            </div>
            <div className={cn('matrix md:col-span-9', categories.length > 1 && 'sm:grid-cols-2')}>
              {categories.map((category) => {
                const items = groups.get(category)!;
                return (
                  <div key={category} className="spot flex flex-col gap-5 p-5 md:p-6">
                    <div className="flex items-baseline justify-between gap-4">
                      <H2
                        id={`skills-${category}`}
                        className="flex items-baseline gap-3 font-label text-label font-normal text-fg-muted uppercase"
                      >
                        <span
                          aria-hidden="true"
                          className="font-mono text-meta text-accent-text tabular-nums"
                        >
                          {String(categoryIndex.get(category)).padStart(2, '0')}
                        </span>
                        {categoryLabels[category] ?? category}
                      </H2>
                      <span aria-hidden="true" className="font-mono text-meta text-fg-muted tabular-nums">
                        {String(items.length).padStart(2, '0')}
                      </span>
                    </div>
                    <ul className={compact ? 'flex flex-wrap gap-x-5 gap-y-2' : 'flex flex-col gap-5'}>
                      {items.map((skill) => (
                        <li
                          key={skill.id}
                          id={compact ? undefined : `skill-${skill.id}`}
                          className="scroll-mt-28"
                        >
                          <p dir="ltr" className="font-display text-lead text-fg-strong ar:text-end">
                            {skill.label ?? skill.name}
                          </p>
                          {!compact && skill.proficiencyLabel ? (
                            <p className="text-sm text-fg-muted">{skill.proficiencyLabel}</p>
                          ) : null}
                          {!compact && labels.certified && certificates[skill.id]?.length ? (
                            <p className="mt-1 text-sm text-fg-muted">
                              {labels.certified}{' '}
                              <span className="text-fg">
                                {certificates[skill.id]!.map((c) => `${c.name} · ${c.issuer}`).join(', ')}
                              </span>
                            </p>
                          ) : null}
                          {!compact && skill.evidence.length ? (
                            <p className="mt-1 text-sm text-fg-muted">
                              {labels.evidence}{' '}
                              {skill.evidence.map((p, i) => (
                                <span key={p.slug}>
                                  {i > 0 ? ', ' : null}
                                  <Link
                                    href={`/projects/${p.slug}`}
                                    className="text-link hover:text-fg-strong"
                                  >
                                    <span className="link-underline">{p.title}</span>
                                  </Link>
                                </span>
                              ))}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
