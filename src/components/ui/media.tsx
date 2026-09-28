import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const ratios = {
  '4/5': 'aspect-[4/5]',
  '1/1': 'aspect-square',
  '3/2': 'aspect-[3/2]',
  '16/9': 'aspect-video',
} as const;

export type MediaRatio = keyof typeof ratios;

type MediaFrameProps = {
  ratio: MediaRatio;
  /** Static import or absolute/remote URL. Omit to render a reserved, labelled slot (dev only). */
  src?: StaticImageData | string;
  /** Required for meaningful images; pass "" only for decorative images. */
  alt: string;
  /** Responsive `sizes` hint — required for correct srcset selection. */
  sizes: string;
  /** Only for the single above-the-fold LCP image of a page. */
  priority?: boolean;
  caption?: ReactNode;
  placeholderLabel?: string;
  className?: string;
};

/**
 * Image architecture (Phase 1 foundation):
 * - reserved aspect ratio → zero layout shift,
 * - next/image → responsive srcset, AVIF/WebP (next.config images.formats), lazy by default,
 * - `priority` only for the LCP image,
 * - alt text mandatory at the type level.
 * Derivatives are produced by the Next image optimizer at request time; the media pipeline
 * (Phase 6) will add CMS-managed originals, alt EN/AR and pre-generated renditions.
 */
export function MediaFrame({
  ratio,
  src,
  alt,
  sizes,
  priority = false,
  caption,
  placeholderLabel,
  className,
}: MediaFrameProps) {
  return (
    <figure className={cn('flex flex-col gap-3', className)}>
      <div className={cn('relative overflow-hidden rounded-md border border-line bg-surface', ratios[ratio])}>
        {src ? (
          <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        ) : (
          <div
            role="img"
            aria-label={placeholderLabel ?? alt}
            className="absolute inset-0 grid place-items-center font-label text-xs text-fg-muted"
          >
            <span
              aria-hidden="true"
              className="absolute inset-4 rounded-sm border border-dashed border-line"
            />
            <span aria-hidden="true">{ratio}</span>
          </div>
        )}
      </div>
      {caption ? <figcaption className="text-sm text-fg-muted">{caption}</figcaption> : null}
    </figure>
  );
}
