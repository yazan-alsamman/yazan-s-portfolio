'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

export type NavLinkItem = { href: string; label: string };

/** Desktop primary navigation. Client-only concern: marking the current page (aria-current). */
export function HeaderNav({
  items,
  label,
  className,
}: {
  items: NavLinkItem[];
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  // No empty landmarks: in production only live routes are listed, which may be none yet.
  if (items.length === 0) return null;
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex items-center gap-1 xl:gap-2">
        {items.map((item) => {
          const current = isCurrent(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center px-3 font-label text-nav',
                  'transition-colors duration-(--duration-base) ease-standard',
                  current ? 'text-fg-strong' : 'text-fg-muted hover:text-fg',
                )}
              >
                <span className="link-underline pb-0.5">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function isCurrent(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
