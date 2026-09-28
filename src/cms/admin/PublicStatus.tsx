import type { UIFieldServerProps } from 'payload';
import type { CSSProperties } from 'react';
import { publicStatus, type Supported } from './public-status';

/**
 * Sidebar panel: "On the public site" — per language, live (with links) or the reasons it is
 * not. Computed from the last SAVED state with the public site's own readers.
 * Mounted as a `ui` field (no database column).
 */

const box: CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-m, 8px)',
  padding: 12,
  marginBottom: 'var(--base)',
  fontSize: 13,
};

const NAMES = { en: 'English', ar: 'العربية' } as const;

export default async function PublicStatus(props: UIFieldServerProps & { target?: Supported }) {
  const target = props.target ?? (props.collectionSlug as Supported | undefined);
  if (!target) return null;
  if (!props.id && target !== 'profile' && target !== 'cv') {
    return (
      <div style={box}>
        <strong>On the public site</strong>
        <p style={{ margin: '6px 0 0', color: 'var(--theme-elevation-650)' }}>
          Save and publish this item to see where it appears.
        </p>
      </div>
    );
  }
  const statuses = await publicStatus(props.payload, target, props.id);
  return (
    <div style={box} aria-label="On the public site">
      <strong>On the public site</strong>
      <p style={{ margin: '2px 0 8px', color: 'var(--theme-elevation-650)' }}>As of the last save.</p>
      {statuses.map((s) => (
        <div key={s.locale} style={{ padding: '6px 0', borderTop: '1px solid var(--theme-elevation-100)' }}>
          <div>
            <span
              aria-hidden="true"
              style={{ color: s.live ? 'var(--theme-success-500)' : 'var(--theme-elevation-650)' }}
            >
              {s.live ? '● ' : '○ '}
            </span>
            <strong lang={s.locale}>{NAMES[s.locale]}</strong>: {s.live ? 'live' : 'not public'}
          </div>
          {s.live ? (
            <ul style={{ margin: '4px 0 0', paddingInlineStart: 18 }}>
              {s.urls.map((u) => (
                <li key={u}>
                  <a href={u} target="_blank" rel="noopener noreferrer">
                    {u}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <ul style={{ margin: '4px 0 0', paddingInlineStart: 18, color: 'var(--theme-elevation-600)' }}>
              {s.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          {s.notes.length ? (
            <ul style={{ margin: '4px 0 0', paddingInlineStart: 18, color: 'var(--theme-elevation-800)' }}>
              {s.notes.map((n) => (
                <li key={n}>
                  <strong>Note:</strong> {n}
                </li>
              ))}
            </ul>
          ) : null}
          {s.gatedInProduction ? (
            <p style={{ margin: '4px 0 0', color: 'var(--theme-elevation-650)' }}>
              Production also requires the Arabic copy review (not approved yet).
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
