import { hash, motifOf, type Motif } from '@/lib/disciplines';
import { seeded } from '@/scene/random';

/**
 * Deterministic schematic for a project without published imagery (Phase 12). It is a drawing
 * of the project's discipline — never a fake screenshot — and every figure says so in its
 * caption. Server-rendered SVG (no JS reaches the client even inside the client-side project
 * index: it is passed in as markup). Variation is seeded by the slug, so a project always gets
 * the same drawing. Colours come from currentColor/tokens, so both themes work.
 */
const W = 320;
const H = 200;

type Draw = { lines: string[]; accent: string[]; nodes: [number, number, number][]; boxes: number[][] };

function network(r: () => number): Draw {
  const layers = [3, 5, 5, 2].map((n, i) => ({
    n: n + (i === 1 || i === 2 ? Math.round(r()) : 0),
    x: 60 + i * 66,
  }));
  const pts = layers.map(({ n, x }) =>
    Array.from({ length: n }, (_, k) => [x, H / 2 + (k - (n - 1) / 2) * 26] as [number, number]),
  );
  const lines: string[] = [];
  const accent: string[] = [];
  const path = pts.map((col) => col[Math.floor(r() * col.length)]!);
  for (let l = 0; l < pts.length - 1; l++)
    for (const a of pts[l]!)
      for (const b of pts[l + 1]!) if (r() > 0.45) lines.push(`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`);
  for (let l = 0; l < path.length - 1; l++)
    accent.push(`M${path[l]![0]} ${path[l]![1]}L${path[l + 1]![0]} ${path[l + 1]![1]}`);
  return { lines, accent, nodes: pts.flat().map(([x, y]) => [x, y, 3.2]), boxes: [] };
}

function vision(r: () => number): Draw {
  const lines: string[] = [];
  for (let x = 40; x <= 280; x += 24) lines.push(`M${x} 30V170`);
  for (let y = 30; y <= 170; y += 20) lines.push(`M40 ${y}H280`);
  const boxes = Array.from({ length: 2 }, () => {
    const w = 50 + r() * 50;
    const h = 40 + r() * 40;
    return [50 + r() * (180 - w), 40 + r() * (120 - h), w, h];
  });
  return { lines, accent: [], nodes: [], boxes };
}

function kinematic(r: () => number): Draw {
  const base: [number, number] = [70, 160];
  let angle = -1.1 - r() * 0.3;
  let p = base;
  const joints: [number, number, number][] = [[base[0], base[1], 5]];
  const accent: string[] = [];
  for (const len of [70, 58, 36]) {
    const q: [number, number] = [p[0] + Math.cos(angle) * len, p[1] + Math.sin(angle) * len];
    accent.push(`M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`);
    joints.push([q[0], q[1], 4]);
    angle += 0.9 + r() * 0.4;
    p = q;
  }
  const lines = [`M30 160H290`];
  // Sensor sweep toward an obstacle (obstacle avoidance, perception → action).
  const ox = 210 + r() * 50;
  const oy = 110 + r() * 30;
  for (let k = -2; k <= 2; k++)
    lines.push(`M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${ox - 18} ${(oy + k * 10).toFixed(1)}`);
  return { lines, accent, nodes: [...joints, [ox, oy, 16]], boxes: [] };
}

function modules(r: () => number): Draw {
  const cols = [40, 130, 220];
  const boxes: number[][] = [];
  const lines: string[] = [];
  const accent: string[] = [];
  cols.forEach((x, c) => {
    const n = c === 1 ? 3 : 2;
    for (let k = 0; k < n; k++) boxes.push([x, 40 + k * (120 / n) + (n === 2 ? 14 : 0), 62, 26]);
  });
  // Orthogonal interfaces between neighbouring modules.
  for (const a of boxes)
    for (const b of boxes)
      if (b[0]! - a[0]! === 90 && r() > 0.35) {
        const y1 = a[1]! + 13;
        const y2 = b[1]! + 13;
        const mx = a[0]! + 76;
        (accent.length === 0 ? accent : lines).push(`M${a[0]! + 62} ${y1}H${mx}V${y2}H${b[0]}`);
      }
  return { lines, accent, nodes: [], boxes };
}

function device(r: () => number): Draw {
  const x = 120;
  const boxes: number[][] = [[x, 20, 80, 160]];
  const lines = [`M${x} 40H${x + 80}`, `M${x} 162H${x + 80}`];
  let y = 48;
  while (y < 150) {
    const h = 14 + Math.round(r() * 20);
    boxes.push([x + 8, y, 64, Math.min(h, 154 - y)]);
    y += h + 6;
  }
  return { lines, accent: [`M${x + 30} 171H${x + 50}`], nodes: [], boxes };
}

function browser(r: () => number): Draw {
  const boxes: number[][] = [[40, 24, 240, 152]];
  const lines = [`M40 42H280`];
  const nav = 52 + Math.round(r() * 30);
  boxes.push([52, 54, nav, 110]);
  let y = 54;
  while (y < 150) {
    const h = 20 + Math.round(r() * 22);
    boxes.push([64 + nav, y, 204 - nav, Math.min(h, 164 - y)]);
    y += h + 8;
  }
  return { lines, accent: [`M52 33H${60 + Math.round(r() * 40)}`], nodes: [[46, 33, 2]], boxes };
}

const DRAW: Record<Motif, (r: () => number) => Draw> = {
  network,
  vision,
  kinematic,
  modules,
  device,
  browser,
};

export function ProjectSchematic({
  slug,
  category,
  index,
  caption,
}: {
  slug: string;
  category: string | null;
  index: number;
  /** Visible, translated disclosure ("Schematic · no published imagery"). */
  caption: string;
}) {
  const motif = motifOf(category);
  const d = DRAW[motif](seeded(hash(slug)));
  return (
    <figure className="project-schematic flex h-full flex-col gap-2">
      <div className="relative aspect-[3/2] overflow-hidden rounded-sm border border-line bg-bg-raised">
        <svg viewBox={`0 0 ${W} ${H}`} className="size-full" fill="none" aria-hidden="true" focusable="false">
          <path d={d.lines.join('')} className="sch-line" />
          {d.boxes.map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="2" className="sch-box" />
          ))}
          <path d={d.accent.join('')} className="sch-accent" />
          {d.nodes.map(([x, y, rad], i) => (
            <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={rad} className="sch-node" />
          ))}
          <text x="12" y="20" className="sch-label">
            {`FIG. ${String(index).padStart(2, '0')}`}
          </text>
        </svg>
      </div>
      <figcaption className="font-mono text-meta text-fg-muted">{caption}</figcaption>
    </figure>
  );
}
