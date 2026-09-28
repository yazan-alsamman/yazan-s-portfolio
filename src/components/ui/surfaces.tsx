import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/** Divider: plain hairline, or "measured" — hairline with precision end-ticks (brand signature). */
export function Divider({
  variant = 'plain',
  className,
  ...props
}: ComponentPropsWithoutRef<'hr'> & { variant?: 'plain' | 'measured' }) {
  return (
    <hr
      className={cn('border-0', variant === 'plain' ? 'h-px bg-line' : 'rule-measured', className)}
      {...props}
    />
  );
}

/** Solid surface with a subtle border. No glassmorphism by default (DESIGN_SYSTEM "Surfaces"). */
export function Surface({
  tone = 'surface',
  className,
  ...props
}: ComponentPropsWithoutRef<'div'> & { tone?: 'surface' | 'raised' }) {
  return (
    <div
      className={cn(
        'rounded-md border border-line',
        tone === 'surface' ? 'bg-surface' : 'bg-bg-raised',
        className,
      )}
      {...props}
    />
  );
}

type CardProps = {
  title: string;
  /** Heading level inside the page outline. */
  headingLevel?: 2 | 3;
  href?: string;
  media?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/**
 * Card — priority per DESIGN_SYSTEM: image → identity → concise summary → indicators → action.
 * When `href` is set the whole card is clickable via a stretched link on the title (one tab stop,
 * accessible name = title), instead of wrapping block content in <a>.
 */
export function Card({ title, headingLevel = 3, href, media, meta, children, className }: CardProps) {
  const H = `h${headingLevel}` as const;
  return (
    <article
      className={cn(
        'group/card relative flex flex-col overflow-hidden rounded-md border border-line bg-surface',
        'transition-colors duration-(--duration-base) ease-standard',
        href && 'focus-within:border-line-strong hover:border-line-strong',
        className,
      )}
    >
      {media ? <div className="border-b border-line">{media}</div> : null}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <H className="font-display text-h3 text-fg">
          {href ? (
            <Link
              href={href}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:outline-focus"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </H>
        {children ? <div className="text-sm text-fg-muted">{children}</div> : null}
        {meta ? <div className="mt-auto flex flex-wrap gap-2 pt-2">{meta}</div> : null}
      </div>
    </article>
  );
}

/** Tag / badge for technologies and states. Text only — never color alone. */
export function Tag({
  tone = 'neutral',
  className,
  ...props
}: ComponentPropsWithoutRef<'span'> & { tone?: 'neutral' | 'accent' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2.5 py-1 font-label text-xs leading-none',
        tone === 'neutral' ? 'border-line text-fg-muted' : 'border-accent/40 text-accent-text',
        className,
      )}
      {...props}
    />
  );
}
