import type { Locale } from '@/i18n/routing';
import type { Education } from '@/content/types';
import { formatPeriod } from '@/lib/format';
import { RichText } from '@/components/content/RichText';

/** Education entries (rendered on About and CV — IA §1: no dedicated route). */
export function EducationList({
  items,
  locale,
  labels,
  headingLevel = 3,
  compact = false,
}: {
  items: Education[];
  locale: Locale;
  labels: { present: string; document: string };
  headingLevel?: 2 | 3;
  compact?: boolean;
}) {
  const H = `h${headingLevel}` as const;
  return (
    <ol className="border-b border-line">
      {items.map((item) => {
        const period = formatPeriod(item.startDate, item.endDate, locale, labels.present, item.datePrecision);
        return (
          <li key={item.id} className="grid gap-4 border-t border-line py-8 md:grid-cols-12 md:gap-8">
            <p className="font-label text-label text-fg-muted tabular-nums md:col-span-3">{period}</p>
            <div className="flex flex-col gap-3 md:col-span-9 lg:col-span-8">
              <H className="font-display text-h3 font-medium text-fg-strong">
                {item.degree}
                {item.field ? <span className="font-normal text-fg-muted"> · {item.field}</span> : null}
                <span className="block font-body text-body font-normal text-fg-muted">
                  {item.institution}
                </span>
              </H>
              {!compact && item.description ? <RichText value={item.description} headingBase={4} /> : null}
              {!compact && item.document ? (
                <p>
                  <a href={item.document.url} className="text-link hover:text-fg-strong">
                    <span className="link-underline">{item.document.title ?? labels.document}</span>{' '}
                    <span className="font-label text-xs text-fg-muted">PDF</span>
                  </a>
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
