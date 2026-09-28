import type { ReactNode } from 'react';

/**
 * Pass-through root layout. The document (<html lang dir>) is rendered by
 * app/[locale]/layout.tsx so language and direction are set at the document level
 * from the first byte (I18N spec). app/not-found.tsx renders its own document.
 * The public stylesheet is imported by the public layouts only, so it never reaches /admin.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
