import Image from 'next/image';
import type { Locale } from '@/i18n/routing';
import type { Certificate } from '@/content/types';
import { formatMonthYear, isoDay } from '@/lib/format';
import { TextLink } from '@/components/ui/actions';

/**
 * Certificates as a register (design evolution: hairline matrix, mono dates) of plain, factual content (SEO_MASTER §25: no certificate schema, no implied
 * verification). Names are shown exactly as authored (never translated blindly — IL-5);
 * a verification link appears only when the issuer provides one.
 */
export function CertificateList({
  items,
  locale,
  labels,
  headingLevel = 2,
  compact = false,
}: {
  items: Certificate[];
  locale: Locale;
  labels: { issued: string; credentialId: string; verify: string; viewPdf: string; externalHint: string };
  headingLevel?: 2 | 3;
  compact?: boolean;
}) {
  const H = `h${headingLevel}` as const;
  return (
    <ul className="matrix md:grid-cols-2">
      {items.map((item, i) => (
        <li key={item.id} className="spot flex flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-3">
            <p className="flex items-baseline justify-between gap-4">
              <span className="font-label text-label text-accent-text">{item.issuer}</span>
              <span aria-hidden="true" className="font-mono text-meta text-fg-muted tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
            </p>
            <H className="font-display text-h3 font-medium text-fg-strong">{item.name}</H>
            {!compact && item.description ? (
              <p className="max-w-(--container-prose) text-body text-fg-muted">{item.description}</p>
            ) : null}
            <dl className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-meta">
              {item.issueDate ? (
                <div className="flex gap-2">
                  <dt className="text-fg-muted">{labels.issued}</dt>
                  <dd className="tabular-nums">
                    <time dateTime={isoDay(item.issueDate)}>{formatMonthYear(item.issueDate, locale)}</time>
                  </dd>
                </div>
              ) : null}
              {!compact && item.credentialId ? (
                <div className="flex gap-2">
                  <dt className="text-fg-muted">{labels.credentialId}</dt>
                  <dd dir="ltr">{item.credentialId}</dd>
                </div>
              ) : null}
            </dl>
            {!compact && (item.verificationUrl || item.attachment?.kind === 'pdf') ? (
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {item.verificationUrl ? (
                  <li>
                    <TextLink href={item.verificationUrl}>
                      {labels.verify} <span className="sr-only">{labels.externalHint}</span>
                    </TextLink>
                  </li>
                ) : null}
                {item.attachment?.kind === 'pdf' ? (
                  <li>
                    <a href={item.attachment.url} className="text-link hover:text-fg-strong">
                      <span className="link-underline">{labels.viewPdf}</span>{' '}
                      <span className="font-label text-xs text-fg-muted">PDF</span>
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
          {!compact && item.attachment?.kind === 'image' ? (
            <figure className="mt-auto overflow-hidden rounded-sm border border-line bg-surface">
              <Image
                src={item.attachment.image.url}
                alt={item.attachment.image.alt}
                width={item.attachment.image.width}
                height={item.attachment.image.height}
                sizes="(min-width: 48rem) 45vw, 100vw"
                className="h-auto w-full"
              />
            </figure>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
