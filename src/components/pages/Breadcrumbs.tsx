import { Link } from '@/i18n/navigation';

/** Semantic breadcrumbs (IA §3: project detail only). The current page is not a link. */
export function Breadcrumbs({ label, items }: { label: string; items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-label text-xs text-fg-muted">
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-2">
            {i > 0 ? (
              <span aria-hidden="true" className="text-line-strong">
                /
              </span>
            ) : null}
            {item.href ? (
              <Link href={item.href} className="inline-flex min-h-11 items-center hover:text-fg">
                <span className="link-underline">{item.name}</span>
              </Link>
            ) : (
              <span aria-current="page" className="text-fg">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
