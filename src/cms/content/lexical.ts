const TEXT_CODE = 16;

/** Paragraphs → Lexical rich text for Payload; `inline code` becomes code-formatted text. */
export function lexical(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: text
          .split('`')
          .map((part, i) => ({ part, code: i % 2 === 1 }))
          .filter(({ part }) => part.length > 0)
          .map(({ part, code }) => ({
            type: 'text',
            text: part,
            format: code ? TEXT_CODE : 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          })),
      })),
    },
  };
}
