import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

const headingSizes = {
  display: 'font-display text-display font-medium text-fg-strong',
  h1: 'font-display text-h1 font-medium text-fg-strong',
  h2: 'font-display text-h2 font-medium text-fg-strong',
  h3: 'font-display text-h3 font-medium text-fg',
} as const;

type HeadingProps = ComponentPropsWithoutRef<'h2'> & {
  /** Semantic level (document outline). One h1 per page — see the H1 contract. */
  level: 1 | 2 | 3 | 4;
  /** Visual size, independent from the semantic level. */
  size?: keyof typeof headingSizes;
};

export function Heading({ level, size, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  const visual = size ?? (level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3');
  return <Tag className={cn(headingSizes[visual], className)} {...props} />;
}

const textVariants = {
  lead: 'text-lead text-fg',
  body: 'text-body text-fg',
  muted: 'text-body text-fg-muted',
  small: 'text-sm text-fg-muted',
} as const;

type TextProps = ComponentPropsWithoutRef<'p'> & { variant?: keyof typeof textVariants };

export function Text({ variant = 'body', className, ...props }: TextProps) {
  return <p className={cn('max-w-(--container-prose)', textVariants[variant], className)} {...props} />;
}

type LabelProps = ComponentPropsWithoutRef<'p'> & {
  /** Optional ordinal ("01"). Rendered as a precise index mark before the label. */
  index?: string;
  children: ReactNode;
};

/** Eyebrow / section label: technical, quiet, uppercase in Latin (no case or tracking in Arabic). */
export function Label({ index, className, children, ...props }: LabelProps) {
  return (
    <p
      className={cn('flex items-center gap-3 font-label text-label text-fg-muted uppercase', className)}
      {...props}
    >
      {index ? (
        <>
          <span className="text-accent-text tabular-nums">{index}</span>
          <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
        </>
      ) : null}
      <span>{children}</span>
    </p>
  );
}
