import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { ArrowIcon, ArrowUpRightIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

/* ------------------------------------------------------------------ *
 * Buttons — native <button> for actions, <a>/<Link> for navigation.
 * Min 44px target, visible focus (global :focus-visible), reduced-motion safe.
 * ------------------------------------------------------------------ */

const buttonBase =
  'group/btn font-label inline-flex min-h-11 items-center justify-center gap-3 rounded-sm px-5 text-sm font-medium ' +
  'transition-[background-color,border-color,color,translate,scale] duration-(--duration-base) ease-standard active:scale-[0.98] ' +
  'disabled:pointer-events-none disabled:opacity-50';

const buttonVariants = {
  /** High contrast, restrained: light slab on dark; hover shifts to the accent. Magnetic for a fine
   * pointer (a few px toward the cursor, PointerEffects) — feedback, never a moving target. */
  primary: 'magnetic bg-fg-strong text-bg hover:bg-accent hover:text-on-accent',
  /** Outline on a quiet surface; boundary meets 3:1 (line-strong). */
  secondary: 'border border-line-strong text-fg hover:border-fg hover:bg-surface',
  /** Text-only action for low-emphasis contexts. */
  ghost: 'text-fg-muted hover:text-fg hover:bg-surface',
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

function Arrow({ external }: { external?: boolean }) {
  return external ? (
    <ArrowUpRightIcon className="size-4 transition-transform duration-(--duration-base) ease-emphasized group-hover/btn:-translate-y-0.5 rtl:-scale-x-100" />
  ) : (
    <ArrowIcon className="size-4 transition-transform duration-(--duration-base) ease-emphasized group-hover/btn:translate-x-1 rtl:-scale-x-100 rtl:group-hover/btn:-translate-x-1" />
  );
}

type ButtonProps = ComponentPropsWithoutRef<'button'> & { variant?: ButtonVariant; withArrow?: boolean };

export function Button({
  variant = 'primary',
  withArrow,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={cn(buttonBase, buttonVariants[variant], className)} {...props}>
      <span>{children}</span>
      {withArrow ? <Arrow /> : null}
    </button>
  );
}

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  withArrow?: boolean;
  className?: string;
  children: ReactNode;
};

/** Navigation styled as a button. External URLs open in the same tab with rel safety. */
export function ButtonLink({
  href,
  variant = 'primary',
  withArrow = true,
  className,
  children,
}: ButtonLinkProps) {
  const classes = cn(buttonBase, buttonVariants[variant], className);
  if (isExternal(href)) {
    return (
      <a href={href} className={classes} rel="noopener noreferrer">
        <span>{children}</span>
        {withArrow ? <Arrow external /> : null}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      <span>{children}</span>
      {withArrow ? <Arrow /> : null}
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * TextLink — inline link with an underline that grows from inline-start.
 * ------------------------------------------------------------------ */

type TextLinkProps = { href: string; className?: string; children: ReactNode };

export function TextLink({ href, className, children }: TextLinkProps) {
  const classes = cn(
    'link-underline text-link decoration-transparent underline-offset-4 hover:text-fg-strong',
    'transition-colors duration-(--duration-base) ease-standard',
    className,
  );
  if (isExternal(href)) {
    return (
      <a href={href} className={classes} rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * IconButton — an accessible name is mandatory.
 * ------------------------------------------------------------------ */

type IconButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'aria-label'> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ label, className, children, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-sm text-fg-muted hover:bg-surface hover:text-fg',
        'transition-colors duration-(--duration-base) ease-standard',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:');
}
