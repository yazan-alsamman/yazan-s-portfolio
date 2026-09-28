/**
 * Architectural column guides behind the identity block — the visible trace of the layout grid
 * (4 columns on phones, 8 on tablets, 12 on desktop; DESIGN_SYSTEM "Layout").
 * Purely decorative (aria-hidden), static, CSS-only. It gives the Phase 3 scene a precise
 * spatial frame to emerge from instead of an empty void.
 */
const visibility = (i: number) => (i < 4 ? 'block' : i < 8 ? 'hidden md:block' : 'hidden xl:block');

export function GridLines() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="mx-auto h-full w-full max-w-(--container-page) px-(--gutter)">
        <div className="grid h-full grid-cols-4 border-e border-line/50 md:grid-cols-8 xl:grid-cols-12">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className={`h-full border-s border-line/50 ${visibility(i)}`} />
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-bg to-transparent" />
    </div>
  );
}
