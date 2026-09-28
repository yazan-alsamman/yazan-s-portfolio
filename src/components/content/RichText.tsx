import Image from 'next/image';
import type { ReactNode } from 'react';
import { publicImage, type MediaLike } from '@/content/files';
import { hasRichText, safeHref, TEXT_FORMAT, type LexicalNode } from '@/content/rich-text';
import { cn } from '@/lib/cn';

/**
 * Server renderer for Payload Lexical rich text (no client JS, no `dangerouslySetInnerHTML`).
 *
 * - Headings are re-based under the page outline: an editor's "h2" inside a section whose
 *   heading is an h2 renders as h3 (`headingBase`), so the document outline never breaks.
 * - Links: only http(s), mailto and site-relative targets; external links get rel safety.
 * - Uploaded images render through next/image with their CMS alt text.
 * - Unknown node types render their children (content is never silently dropped) or nothing.
 */
type Props = {
  value: unknown;
  /** Level that an editor "h1" maps to (default 3: rich text lives under an h2 section). */
  headingBase?: 2 | 3 | 4;
  className?: string;
};

export function RichText({ value, headingBase = 3, className }: Props) {
  if (!hasRichText(value)) return null;
  return (
    <div className={cn('rich-text', className)}>
      {value.root.children!.map((node, i) => renderNode(node, i, headingBase))}
    </div>
  );
}

function renderChildren(node: LexicalNode, base: number): ReactNode {
  return (node.children ?? []).map((child, i) => renderNode(child, i, base));
}

function renderText(node: LexicalNode, key: number): ReactNode {
  const format = typeof node.format === 'number' ? node.format : 0;
  let out: ReactNode = node.text ?? '';
  if (format & TEXT_FORMAT.code) out = <code>{out}</code>;
  if (format & TEXT_FORMAT.bold) out = <strong>{out}</strong>;
  if (format & TEXT_FORMAT.italic) out = <em>{out}</em>;
  if (format & TEXT_FORMAT.underline) out = <u>{out}</u>;
  if (format & TEXT_FORMAT.strikethrough) out = <s>{out}</s>;
  if (format & TEXT_FORMAT.subscript) out = <sub>{out}</sub>;
  if (format & TEXT_FORMAT.superscript) out = <sup>{out}</sup>;
  return <span key={key}>{out}</span>;
}

function renderNode(node: LexicalNode, key: number, base: number): ReactNode {
  switch (node.type) {
    case 'text':
      return renderText(node, key);
    case 'linebreak':
      return <br key={key} />;
    case 'tab':
      return ' ';
    case 'paragraph':
      return (node.children ?? []).length ? <p key={key}>{renderChildren(node, base)}</p> : null;
    case 'heading': {
      const editorLevel = Number(String(node.tag ?? 'h2').replace('h', '')) || 2;
      const level = Math.min(6, base + editorLevel - 1);
      const H = `h${level}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return <H key={key}>{renderChildren(node, base)}</H>;
    }
    case 'quote':
      return <blockquote key={key}>{renderChildren(node, base)}</blockquote>;
    case 'list': {
      const List = node.listType === 'number' ? 'ol' : 'ul';
      return <List key={key}>{renderChildren(node, base)}</List>;
    }
    case 'listitem':
      return <li key={key}>{renderChildren(node, base)}</li>;
    case 'horizontalrule':
      return <hr key={key} />;
    case 'link':
    case 'autolink': {
      const href = safeHref(node.fields?.url ?? node.url);
      if (!href) return <span key={key}>{renderChildren(node, base)}</span>;
      const external = !href.startsWith('/');
      return (
        <a key={key} href={href} rel={external ? 'noopener noreferrer' : undefined}>
          {renderChildren(node, base)}
        </a>
      );
    }
    case 'upload': {
      // Same rule as every public image: optimized derivative only, alt text required per locale.
      const img = publicImage(
        node.value && typeof node.value === 'object' ? (node.value as MediaLike) : null,
      );
      if (!img) return null;
      return (
        <figure key={key}>
          <Image
            src={img.url}
            alt={img.alt}
            width={img.width}
            height={img.height}
            sizes="(min-width: 64rem) 42rem, 100vw"
          />
        </figure>
      );
    }
    default:
      return node.children ? <span key={key}>{renderChildren(node, base)}</span> : null;
  }
}
