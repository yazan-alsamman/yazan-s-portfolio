import Image from 'next/image';
import type { Locale } from '@/i18n/routing';
import type { Certificate } from '@/content/types';
import { formatMonthYear, isoDay } from '@/lib/format';
import { TextLink } from '@/components/ui/actions';

/**
 * Certificates as plain, factual content (SEO_MASTER §25: no certificate schema, no implied
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
    <ul className="border-b border-line">
      {items.map((item) => (
        <li key={item.id} className="grid gap-6 border-t border-line py-10 md:grid-cols-12 md:gap-8">
          <div className="flex flex-col gap-3 md:col-span-8">
            <p className="font-label text-label text-accent-text">{item.issuer}</p>
            <H className="font-display text-h3 font-medium text-fg-strong">{item.name}</H>
            {!compact && item.description ? (
              <p className="max-w-(--container-prose) text-body text-fg-muted">{item.description}</p>
            ) : null}
            <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
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
                  <dd dir="ltr" className="font-label">
                    {item.credentialId}
                  </dd>
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
            <figure className="overflow-hidden rounded-md border border-line bg-surface md:col-span-4">
              <Image
                src={item.attachment.image.url}
                alt={item.attachment.image.alt}
                width={item.attachment.image.width}
                height={item.attachment.image.height}
                sizes="(min-width: 48rem) 30vw, 100vw"
                className="h-auto w-full"
              />
            </figure>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
