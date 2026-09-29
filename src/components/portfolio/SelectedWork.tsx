import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import type { ProjectSummary } from '@/content/types';
import { Link } from '@/i18n/navigation';

/**
 * Selected work as evidence (Phase 13) — the owner's featured projects with their verified
 * discipline, year and technology count, linking to the case studies. Shared by About and the CV
 * so both rest on the same CMS facts. Renders nothing without featured projects.
 */
export async function SelectedWork({
  locale,
  projects,
  id,
  className,
}: {
  locale: Locale;
  projects: ProjectSummary[];
  /** Heading id (the section is labelled by it). */
  id: string;
  className?: string;
}) {
  const featured = projects.filter((p) => p.featured);
  if (!featured.length) return null;
  const [t, tc, ta] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.portfolio' }),
    getTranslations({ locale, namespace: 'pages.categories' }),
    getTranslations({ locale, namespace: 'pages.about' }),
  ]);
  return (
    <section aria-labelledby={id} className={className}>
      <h2 id={id} className="mb-6 font-label text-label text-fg-muted uppercase">
        {t('selectedWork')}
      </h2>
      <ol className="border-b border-line">
        {featured.map((p, i) => (
          <li
            key={p.id}
            className="grid gap-2 border-t border-line py-5 md:grid-cols-12 md:items-baseline md:gap-8"
          >
            <span
              aria-hidden="true"
              className="font-mono text-meta text-accent-text tabular-nums md:col-span-1"
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <Link
              href={`/projects/${p.slug}`}
              className="font-display text-lead text-fg-strong hover:text-accent-text md:col-span-7"
            >
              <span className="link-underline">{p.title}</span>
            </Link>
            <span className="font-mono text-meta text-fg-muted md:col-span-4">
              {[
                p.category ? tc(p.category) : null,
                p.dossier?.year,
                p.technologies.length ? ta('technologyCount', { count: p.technologies.length }) : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
