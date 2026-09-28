import localFont from 'next/font/local';

/**
 * Self-hosted fonts (no third-party requests at runtime or build time).
 * Files: src/fonts/*.woff2 from Fontsource 5.3.0 (SIL OFL 1.1 — licenses alongside).
 *
 * - Inter (body, variable) and Space Grotesk (display/labels, variable): Latin subset, preloaded.
 * - IBM Plex Sans Arabic: Arabic subset, static 400–700. Not preloaded: English pages only
 *   fetch it when Arabic glyphs render (e.g. the language switcher label).
 *   Space Grotesk has no Arabic glyphs, so Arabic headings use Plex Arabic (see globals.css :lang(ar)).
 */
export const inter = localFont({
  src: '../fonts/inter-latin-wght-normal.woff2',
  variable: '--font-inter',
  weight: '100 900',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial'],
});

export const spaceGrotesk = localFont({
  src: '../fonts/space-grotesk-latin-wght-normal.woff2',
  variable: '--font-space-grotesk',
  weight: '300 700',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'Arial'],
});

export const plexArabic = localFont({
  src: [
    { path: '../fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/ibm-plex-sans-arabic-arabic-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-plex-arabic',
  display: 'swap',
  preload: false,
  fallback: ['Tahoma', 'Segoe UI', 'system-ui', 'sans-serif'],
});

export const fontVariables = [inter.variable, spaceGrotesk.variable, plexArabic.variable].join(' ');
