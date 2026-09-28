/**
 * Lexical rich-text (Payload `richText`) — pure helpers shared by the adapter (availability:
 * "is there real content?") and the server renderer. No React, no Payload imports.
 */

export type LexicalNode = {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number | string;
  tag?: string;
  listType?: 'bullet' | 'number' | 'check';
  url?: string;
  fields?: { url?: string; newTab?: boolean; linkType?: string } | null;
  [key: string]: unknown;
};

export type LexicalRoot = { root: LexicalNode };

export function isLexicalRoot(value: unknown): value is LexicalRoot {
  return (
    !!value &&
    typeof value === 'object' &&
    'root' in value &&
    !!(value as LexicalRoot).root &&
    Array.isArray((value as LexicalRoot).root.children)
  );
}

/** Concatenated visible text of a node tree (used to decide emptiness, never for display). */
export function plainText(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text;
  return (node.children ?? []).map(plainText).join(' ');
}

/**
 * True when the value contains visible content. An editor that was opened and cleared stores
 * an empty paragraph — that must count as "no content" (a section is shown only when verified
 * content exists, PS-4).
 */
export function hasRichText(value: unknown): value is LexicalRoot {
  if (!isLexicalRoot(value)) return false;
  const hasNonTextBlock = (node: LexicalNode): boolean =>
    node.type === 'upload' || node.type === 'horizontalrule' || (node.children ?? []).some(hasNonTextBlock);
  return plainText(value.root).trim().length > 0 || value.root.children!.some(hasNonTextBlock);
}

/** Normalizes an optional rich-text field to the contract (`null` when empty). */
export function richTextOrNull(value: unknown): LexicalRoot | null {
  return hasRichText(value) ? value : null;
}

/** Lexical text-format bitmask (lexical/TextFormatType). */
export const TEXT_FORMAT = {
  bold: 1,
  italic: 1 << 1,
  strikethrough: 1 << 2,
  underline: 1 << 3,
  code: 1 << 4,
  subscript: 1 << 5,
  superscript: 1 << 6,
} as const;

/** Only http(s), mailto and site-relative links are rendered as links (no javascript:, data:, …). */
export function safeHref(url: unknown): string | null {
  if (typeof url !== 'string' || url.trim() === '') return null;
  const value = url.trim();
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const parsed = new URL(value);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}
