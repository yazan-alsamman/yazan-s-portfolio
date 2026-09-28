import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { fontVariables } from './fonts';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false, follow: true } };

/**
 * Last-resort 404 for requests that never reach a locale segment (the proxy normally
 * assigns one). Minimal, self-contained document; the localized 404 lives in [locale]/not-found.tsx.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" data-theme="dark" className={fontVariables}>
      <body className="grid min-h-dvh place-items-center bg-bg p-8 font-body text-fg">
        <main className="flex flex-col items-start gap-6">
          <p className="font-label text-label text-accent-text uppercase">404</p>
          <h1 className="font-display text-h2 text-fg-strong">Page not found</h1>
          <Link href="/" className="link-underline text-link">
            Back to home
          </Link>
        </main>
      </body>
    </html>
  );
}
