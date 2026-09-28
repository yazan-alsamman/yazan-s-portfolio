'use client';

import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { CloseIcon, MenuIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { isCurrent, type NavLinkItem } from './HeaderNav';

type Props = {
  items: NavLinkItem[];
  labels: { menu: string; close: string; dialog: string; nav: string };
  /** Brand line rendered at the top of the panel (server-provided, from the profile source). */
  brand: ReactNode;
  /** Secondary controls rendered in the panel footer (language switcher, theme toggle). */
  footer: ReactNode;
  className?: string;
};

/**
 * Full-screen editorial menu for small viewports.
 *
 * Provenance: adapted from 21st.dev "Immersive Full Screen Navigation" (hyperiux, id 27229).
 * Kept: clip-path wipe reveal, oversized editorial link typography, staggered entrance,
 * brand/footer composition. Changed: GSAP removed (CSS transitions + @starting-style);
 * hand-rolled focus trap replaced by native <dialog>.showModal() (focus containment, Esc,
 * focus return, inert background); wipe origin is the inline-end edge so it mirrors in RTL;
 * per-character hover replaced by a whole-label roll (Arabic shaping); stock images, socials
 * and location removed (no unverified content).
 */
export function MobileMenu({ items, labels, brand, footer, className }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dialogId = useId();
  const titleId = useId();

  function show() {
    dialogRef.current?.showModal();
    setOpen(true);
  }

  function hide() {
    dialogRef.current?.close();
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        className="inline-flex min-h-11 items-center gap-2 rounded-sm px-2 font-label text-nav text-fg transition-colors duration-(--duration-base) hover:bg-surface sm:px-3"
      >
        <MenuIcon className="size-5" />
        {/* Text label hidden (not removed) on narrow phones so the header never overflows, even with fallback fonts. */}
        <span className="sr-only xs:not-sr-only">{labels.menu}</span>
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        className="menu-dialog"
      >
        <div className="flex min-h-full flex-col px-(--gutter)">
          <div className="flex h-(--header-height) items-center justify-between gap-4">
            <div id={titleId} className="min-w-0">
              <span className="sr-only">{labels.dialog}</span>
              {brand}
            </div>
            <button
              type="button"
              onClick={hide}
              className="inline-flex min-h-11 items-center gap-2 rounded-sm px-3 font-label text-nav text-fg transition-colors duration-(--duration-base) hover:bg-surface"
            >
              <CloseIcon className="size-5" />
              <span>{labels.close}</span>
            </button>
          </div>

          <div className="rule-measured" aria-hidden="true" />

          <nav aria-label={labels.nav} className="flex flex-1 flex-col justify-center py-10">
            <ol className="flex flex-col">
              {items.map((item, index) => {
                const current = isCurrent(pathname, item.href);
                return (
                  <li
                    key={item.href}
                    className="menu-item border-b border-line last:border-b-0"
                    style={{ '--i': index } as CSSProperties}
                  >
                    <Link
                      href={item.href}
                      onClick={hide}
                      aria-current={current ? 'page' : undefined}
                      className={cn(
                        'group/item flex min-h-14 items-baseline gap-4 py-3',
                        current ? 'text-fg-strong' : 'text-fg hover:text-fg-strong',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="w-8 shrink-0 font-label text-xs text-accent-text tabular-nums"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-roll font-display text-menu font-medium">
                        <span>{item.label}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-6">
            {footer}
          </div>
        </div>
      </dialog>
    </div>
  );
}
