import Link from 'next/link';
import type { ServerProps } from 'payload';
import type { CSSProperties, ReactNode } from 'react';
import { EDITORIAL, getOverview } from './overview';

/**
 * Admin dashboard overview (DASHBOARD_SPEC "Overview"), rendered above Payload's collection
 * cards. Operational, not decorative: it answers "what is live, what is pending, what changed".
 * Styling uses Payload's theme variables so it follows the admin light/dark theme.
 */

const LABELS: Record<(typeof EDITORIAL)[number], string> = {
  projects: 'Projects',
  experience: 'Experience',
  education: 'Education',
  certificates: 'Certificates',
  skills: 'Skills',
};

const ROUTE_LABELS: Record<string, string> = {
  about: 'About',
  projects: 'Projects',
  experience: 'Experience',
  skills: 'Skills',
  certificates: 'Certificates',
  cv: 'CV',
  contact: 'Contact',
};

const card: CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-m, 8px)',
  padding: 'calc(var(--base) * 1)',
  background: 'var(--theme-elevation-0)',
};
const muted: CSSProperties = { color: 'var(--theme-elevation-650)', fontSize: 13 };
const grid: CSSProperties = {
  display: 'grid',
  gap: 'calc(var(--base) * 0.75)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
};

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 'calc(var(--base) * 2)' }} aria-label={title}>
      <h2 style={{ margin: '0 0 4px', fontSize: 18 }}>{title}</h2>
      {hint ? <p style={{ ...muted, margin: '0 0 12px' }}>{hint}</p> : null}
      {children}
    </section>
  );
}

function Pill({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        padding: '2px 8px',
        borderRadius: 999,
        border: `1px solid ${ok ? 'var(--theme-success-500)' : 'var(--theme-elevation-250)'}`,
        color: ok ? 'var(--theme-success-750, var(--theme-success-500))' : 'var(--theme-elevation-600)',
      }}
    >
      <span aria-hidden="true">{ok ? '●' : '○'}</span>
      {children}
    </span>
  );
}

export default async function Overview({ payload }: ServerProps) {
  const data = await getOverview(payload);
  const date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div style={{ marginBottom: 'calc(var(--base) * 2)' }}>
      <header style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Portfolio overview</h1>
        <p style={{ ...muted, margin: '4px 0 0' }}>
          What is live on the public site, what is still in draft, and what changed recently.
        </p>
      </header>

      <Section
        title="Content status"
        hint="Published = visible to the public site (in each language where it is approved). Archived items are hidden but kept."
      >
        <div style={grid}>
          {EDITORIAL.map((slug) => {
            const c = data.counts[slug];
            return (
              <Link
                key={slug}
                href={`/admin/collections/${slug}`}
                style={{ ...card, textDecoration: 'none', color: 'inherit' }}
              >
                <strong style={{ fontSize: 15 }}>{LABELS[slug]}</strong>
                <div style={{ fontSize: 28, lineHeight: 1.2, margin: '6px 0' }}>{c.total}</div>
                <div style={muted}>
                  {c.published} published · {c.draft} draft · {c.archived} archived
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section
        title="Public pages"
        hint="A page exists only when it has published, approved content in that language. Empty pages return 404 in production and are not linked."
      >
        <div style={grid}>
          {(['en', 'ar'] as const).map((locale) => (
            <div key={locale} style={card}>
              <strong>{locale === 'en' ? 'English (/)' : 'العربية (/ar)'}</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                <Pill ok>Home</Pill>
                {Object.entries(data.routes[locale]).map(([key, live]) => (
                  <Pill key={key} ok={live}>
                    {ROUTE_LABELS[key] ?? key}
                  </Pill>
                ))}
              </div>
              {locale === 'ar' && data.arabicGate.status !== 'approved' ? (
                <p style={{ ...muted, margin: '10px 0 0' }}>
                  Arabic is not published in production until the Arabic copy review is approved (current
                  state: {data.arabicGate.status}). It is visible in development/preview only.
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      <div style={{ ...grid, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
        <Section title="Recent changes" hint="From the audit log (who, what, when).">
          {data.recent.length === 0 ? (
            <p style={muted}>No changes recorded yet.</p>
          ) : (
            <ol style={{ ...card, listStyle: 'none', margin: 0, padding: 0 }}>
              {data.recent.map((r) => (
                <li
                  key={r.id}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--theme-elevation-100)',
                    fontSize: 13,
                  }}
                >
                  <strong>{r.action}</strong> ·{' '}
                  {r.action !== 'delete' && !r.collection.startsWith('global:') ? (
                    <Link href={`/admin/collections/${r.collection}/${r.documentId}`}>
                      {r.collection} #{r.documentId}
                    </Link>
                  ) : r.collection.startsWith('global:') ? (
                    <Link href={`/admin/globals/${r.collection.slice(7)}`}>{r.collection.slice(7)}</Link>
                  ) : (
                    `${r.collection} #${r.documentId}`
                  )}
                  {r.locale ? ` · ${r.locale}` : ''}
                  <div style={muted}>
                    {date.format(new Date(r.when))} · {r.user}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Section>

        <Section title="Library & system">
          <div style={{ ...card, display: 'grid', gap: 8, fontSize: 14 }}>
            <div>
              <Link href="/admin/collections/media">Images</Link>: {data.media.images}
              {data.media.imagesArchived ? ` (${data.media.imagesArchived} archived)` : ''}
              {data.media.imagesMissingAltAr ? (
                <span style={{ color: 'var(--theme-warning-600, #b45309)' }}>
                  {' '}
                  · {data.media.imagesMissingAltAr} without Arabic alt text
                </span>
              ) : null}
            </div>
            <div>
              <Link href="/admin/collections/documents">Documents (PDF)</Link>: {data.media.documents}
              {data.media.documentsArchived ? ` (${data.media.documentsArchived} archived)` : ''}
            </div>
            <div>
              Database: <Pill ok={data.system.database === 'ok'}>{data.system.database}</Pill> · migrations
              applied: {data.system.migrations}
            </div>
            <div>
              Environment: <strong>{data.system.siteEnv}</strong>
              {data.system.siteEnv !== 'production' ? (
                <span style={muted}> — not indexable (noindex everywhere)</span>
              ) : null}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
