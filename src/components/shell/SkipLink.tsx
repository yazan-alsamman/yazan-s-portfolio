/** First focusable element on every page (WCAG 2.4.1). Visible only when focused. */
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="fixed start-4 top-4 z-(--z-skip-link) inline-flex min-h-11 -translate-y-24 items-center rounded-sm bg-fg-strong px-4 font-label text-sm text-bg transition-transform duration-(--duration-fast) focus:translate-y-0"
    >
      {label}
    </a>
  );
}
