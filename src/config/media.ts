/**
 * Media asset registry (Phase 1 foundation — ADR-008).
 *
 * The official portrait lives at the repository root (`portrait.jpg`) and is NOT imported or
 * processed in Phase 1: it is 538×661 px, contains a third party's hand at the bottom edge,
 * and a higher-resolution original has been requested from the owner before Phase 3.
 *
 * When the original arrives it is registered here (never overwriting `portrait.jpg`), and
 * the Phase 3/6 pipeline derives crops (mobile, about, scene matte) from it. No generative
 * upscaling or facial alteration is permitted.
 */
export type PortraitSource = {
  path: string;
  width: number;
  height: number;
  sha256: string;
  status: 'interim-low-resolution' | 'approved-original';
  notes: string;
};

export const portraitSources: PortraitSource[] = [
  {
    path: 'portrait.jpg',
    width: 538,
    height: 661,
    sha256: '1c00fa075b97e2ef8a3460b3d62155052533729994041bd7f562ed5177323fca',
    status: 'interim-low-resolution',
    notes:
      'Owner-supplied; authoritative (D-5, no replacement). Max ~540 CSS px at 1x. Third-party hand at bottom-right is cropped (Phase 3: UV crop in the scene, CSS crop in the HTML fallback). Imported by the home page as a build-hashed copy; the source file is never modified.',
  },
];

/** Alt text contract for the portrait (EN confirmed identity; AR uses the confirmed Arabic name). */
export const portraitAlt = {
  en: 'Portrait of Yazan Al Samman',
  ar: 'صورة شخصية ليزن السمان',
} as const;
