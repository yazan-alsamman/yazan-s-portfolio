/**
 * Orientation-aware fitting for CMS images in fixed-ratio frames (real-content migration):
 * portrait screenshots (e.g. 1080 × 2400 phone screens) are shown whole — contained on the
 * surface background — instead of being cropped to a zoomed fragment; landscape images keep
 * filling their frame exactly as before.
 */
export function isPortrait(image: { width: number; height: number }): boolean {
  return image.height > image.width;
}

/** `object-fit` class for an image inside a fixed-ratio frame. */
export function frameFit(image: { width: number; height: number }): string {
  return isPortrait(image) ? 'object-contain' : 'object-cover';
}
