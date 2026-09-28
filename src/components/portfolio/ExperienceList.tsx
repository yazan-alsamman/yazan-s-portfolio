import type { Locale } from '@/i18n/routing';
import type { Experience } from '@/content/types';
import { formatPeriod, isoDay } from '@/lib/format';
import { Link } from '@/i18n/navigation';
import { RichText } from '@/components/content/RichText';
import { TextLink } from '@/components/ui/actions';
import { TechnologyList } from './TechnologyList';

/**
 * Experience as a measured timeline: period in the label column, role + organization, then the
 * verified description, technologies and the projects done in that role (IA §5: Experience →
 * Projects). `compact` drops descriptions (homepage and CV summaries).
 */
export function ExperienceList({
  items,
  locale,
  labels,
  headingLevel = 2,
  compact = false,
  linkToSkills = false,
}: {
  items: Experience[];
  locale: Locale;
  labels: { present: string; technologies: string; projects: string; externalHint: string };
  headingLevel?: 2 | 3;
  compact?: boolean;
  linkToSkills?: boolean;
}) {
  const H = `h${headingLevel}` as const;
  return (
    <ol className="border-b border-line">
      {items.map((item) => (
        <li key={item.id} className="grid gap-4 border-t border-line py-10 md:grid-cols-12 md:gap-8">
          <p className="font-label text-label text-fg-muted tabular-nums md:col-span-3">
            {/* No stated start date → no period (the column keeps the layout). */}
            {item.startDate ? (
              <time dateTime={isoDay(item.startDate)}>
                {formatPeriod(item.startDate, item.endDate, locale, labels.present)}
              </time>
            ) : null}
          </p>
          <div className="flex flex-col gap-4 md:col-span-9 lg:col-span-8">
            <H className="font-display text-h3 font-medium text-fg-strong">
              {item.title}
              <span className="block font-body text-body font-normal text-fg-muted">{item.organization}</span>
            </H>
            {!compact && item.description ? <RichText value={item.description} headingBase={4} /> : null}
            {!compact && item.technologies.length ? (
              <div className="flex flex-col gap-2">
                <p className="font-label text-label text-fg-muted uppercase">{labels.technologies}</p>
                <TechnologyList technologies={item.technologies} linkToSkills={linkToSkills} />
              </div>
            ) : null}
            {!compact && item.projects.length ? (
              <div className="flex flex-col gap-2">
                <p className="font-label text-label text-fg-muted uppercase">{labels.projects}</p>
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {item.projects.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/projects/${p.slug}`} className="text-link hover:text-fg-strong">
                        <span className="link-underline">{p.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {!compact && item.links.length ? (
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {item.links.map((link) => (
                  <li key={link.url}>
                    <TextLink href={link.url}>
                      {link.label} <span className="sr-only">{labels.externalHint}</span>
                    </TextLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
