import { OWNER_INPUT_PLACEHOLDER } from '@/i18n/messages';

/**
 * Visible development marker for owner-pending content ("TODO: OWNER INPUT REQUIRED").
 * Renders nothing when `show` is false (production) — pending content is simply absent there.
 */
export function DevPlaceholder({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      lang="en"
      dir="ltr"
      className="inline-block rounded-sm border border-dashed border-warning/50 px-2 py-0.5 font-label text-xs text-warning"
    >
      {OWNER_INPUT_PLACEHOLDER}
    </span>
  );
}
