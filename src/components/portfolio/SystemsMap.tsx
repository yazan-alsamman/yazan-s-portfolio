import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import type { ProjectSummary } from '@/content/types';
import { Link } from '@/i18n/navigation';
import { LAYER_ORDER, layerOf, type Layer } from '@/lib/disciplines';
import { layerLabels } from './case-files';

/**
 * Systems map (Phase 14): the verified flagship and strong systems against the technical
 * expertise model. A cell is marked only when the case study records a technology in that layer
 * (CMS relations) — derived, never typed in. Concept systems are excluded: they are not evidence.
 * A real table on wide screens; on phones each system lists its layers (no horizontal scroll).
 */
export async function SystemsMap({
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
  const systems = projects.filter(
    (p) => p.provenance !== 'concept' && (p.tier === 'flagship' || p.tier === 'strong'),
  );
  if (!systems.length) return null;
  const [t, labels] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.portfolio.systemsMap' }),
    layerLabels(locale),
  ]);
  const layersOf = (p: ProjectSummary) => new Set(p.technologies.map((tech) => layerOf(tech.category)));
  const columns = LAYER_ORDER.filter(
    (l): l is Exclude<Layer, 'adjacent'> => l !== 'adjacent' && systems.some((p) => layersOf(p).has(l)),
  );
  if (!columns.length) return null;

  return (
    <section aria-labelledby={id} className={className}>
      <div className="mb-6 flex flex-col gap-2">
        <h2 id={id} className="font-label text-label text-fg-muted uppercase">
          {t('title')}
        </h2>
        <p className="max-w-(--container-prose) text-body text-fg-muted">{t('lead')}</p>
      </div>

      <table className="hidden w-full border-collapse text-start md:table">
        <thead>
          <tr className="border-b border-line-strong">
            <th
              scope="col"
              className="py-3 pe-4 text-start font-label text-label font-normal text-fg-muted uppercase"
            >
              {t('system')}
            </th>
            {columns.map((layer) => (
              <th
                key={layer}
                scope="col"
                className="px-2 py-3 text-center font-mono text-meta font-normal text-fg-muted"
              >
                {labels[layer]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {systems.map((p) => {
            const has = layersOf(p);
            return (
              <tr key={p.id} className="border-b border-line">
                <th scope="row" className="py-3 pe-4 text-start font-normal">
                  <Link
                    href={`/projects/${p.slug}`}
                    className="text-body text-fg-strong hover:text-accent-text"
                  >
                    <span className="link-underline">{p.title}</span>
                  </Link>
                </th>
                {columns.map((layer) => (
                  <td key={layer} className="px-2 py-3 text-center">
                    {has.has(layer) ? (
                      <>
                        <span aria-hidden="true" className="inline-block size-2.5 rounded-[1px] bg-accent" />
                        <span className="sr-only">{t('present')}</span>
                      </>
                    ) : (
                      <span
                        aria-hidden="true"
                        className="inline-block h-px w-2.5 bg-line-strong align-middle"
                      />
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <ul className="border-b border-line md:hidden">
        {systems.map((p) => (
          <li key={p.id} className="flex flex-col gap-2 border-t border-line py-4">
            <Link href={`/projects/${p.slug}`} className="text-body text-fg-strong hover:text-accent-text">
              <span className="link-underline">{p.title}</span>
            </Link>
            <p className="font-mono text-meta text-fg-muted">
              {columns
                .filter((layer) => layersOf(p).has(layer))
                .map((layer) => labels[layer])
                .join(' · ')}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
