import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/**
 * Text wordmark (BRAND_IDENTITY): "YAZAN AL SAMMAN" / "يزن السمان".
 * The uppercase is visual only (CSS) — the accessible name stays "Yazan Al Samman".
 * The "YA" monogram is deferred until explicit owner approval (D-8) and is not rendered.
 * `name` comes from the CMS Profile (approved in the page's locale).
 */
export function Wordmark({
  name,
  label,
  className,
}: {
  name: string;
  /** Localized accessible name, e.g. "Yazan Al Samman, Home" (punctuation comes from the catalog). */
  label: string;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={label}
      className={cn(
        'inline-flex min-h-11 items-center gap-2.5 font-display text-wordmark font-semibold whitespace-nowrap text-fg-strong uppercase sm:gap-3',
        'tracking-(--tracking-wordmark-compact) transition-opacity duration-(--duration-base) hover:opacity-80 sm:tracking-(--tracking-wordmark)',
        'ar:text-base',
        className,
      )}
    >
      <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-accent" />
      <span>{name}</span>
    </Link>
  );
}
