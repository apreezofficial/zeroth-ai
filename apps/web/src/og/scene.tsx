import { PALETTE, type Block } from "@/components/Blocks";

/** Shared Open Graph frame: 1200x630, cube art on the right, copy on the left. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
const BG = "#F7F6FF";
const INK = "#0B0B12";
const ACCENT = "#7b61ff";

type Pal = keyof typeof PALETTE;
const b = (i: number, j: number, k: number, c: Pal): Block => ({ i, j, k, c });

/** Isometric cubes as plain SVG polygons (Satori-safe: no CSS classes or animation). */
function Cubes({ blocks, width, height }: { blocks: Block[]; width: number; height: number }) {
  const size = 40;
  const cos = Math.cos(Math.PI / 6) * size;
  const sin = size / 2;
  const sorted = [...blocks].sort((a, b2) => a.i + a.j + a.k - (b2.i + b2.j + b2.k));
  const pos = sorted.map((p) => ({ ...p, x: (p.i - p.j) * cos, y: (p.i + p.j) * sin - p.k * size }));
  const minX = Math.min(...pos.map((p) => p.x)) - cos - 2;
  const maxX = Math.max(...pos.map((p) => p.x)) + cos + 2;
  const minY = Math.min(...pos.map((p) => p.y)) - 2;
  const maxY = Math.max(...pos.map((p) => p.y)) + 2 * sin + size + 2;
  return (
    <svg width={width} height={height} viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}>
      {pos.map((p, n) => {
        const [top, left, right] = PALETTE[p.c];
        const { x, y } = p;
        return (
          <g key={n} stroke="rgba(0,0,0,0.18)" strokeWidth={0.6}>
            <polygon fill={top} points={`${x},${y} ${x + cos},${y + sin} ${x},${y + 2 * sin} ${x - cos},${y + sin}`} />
            <polygon fill={left} points={`${x - cos},${y + sin} ${x},${y + 2 * sin} ${x},${y + 2 * sin + size} ${x - cos},${y + sin + size}`} />
            <polygon fill={right} points={`${x},${y + 2 * sin} ${x + cos},${y + sin} ${x + cos},${y + sin + size} ${x},${y + 2 * sin + size}`} />
          </g>
        );
      })}
    </svg>
  );
}

export function Frame({
  eyebrow,
  title,
  body,
  blocks,
  artWidth = 500,
  artHeight = 420,
  accent = ACCENT,
}: {
  eyebrow: string;
  title: string;
  body: string;
  blocks: Block[];
  artWidth?: number;
  artHeight?: number;
  accent?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: BG,
        color: INK,
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Brand mark and footer */}
      <div style={{ position: "absolute", left: 72, top: 60, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 22, height: 22, background: accent, borderRadius: 4 }} />
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>Zeroth</div>
      </div>
      <div style={{ position: "absolute", left: 72, bottom: 54, fontSize: 22, color: "rgba(11,11,18,0.55)", display: "flex" }}>
        Offline AI for web, mobile and desktop
      </div>

      {/* Copy */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 72, paddingTop: 70, paddingBottom: 110, width: 520 }}>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            border: `2px solid ${accent}`,
            color: accent,
            borderRadius: 999,
            padding: "8px 18px",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
        <div style={{ display: "flex", marginTop: 26, fontSize: 60, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2 }}>{title}</div>
        <div style={{ display: "flex", marginTop: 26, fontSize: 24, lineHeight: 1.4, color: "rgba(11,11,18,0.72)" }}>{body}</div>
      </div>

      {/* Art */}
      <div
        style={{
          position: "absolute",
          right: 40,
          top: 0,
          bottom: 0,
          width: artWidth,
          height: 630,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Cubes blocks={blocks} width={artWidth} height={artHeight} />
      </div>
    </div>
  );
}

/** Deterministic PRNG so each page's art is stable across builds. */
function seeded(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const palettes: Pal[] = ["purple", "blue", "teal", "indigo"];

/** A unique random cluster per seed, used for each doc page. */
export function randomCluster(seed: string): Block[] {
  const r = seeded(seed);
  const cells: Block[] = [];
  const seen = new Set<string>();
  let i = 0, j = 0, k = 0;
  for (let n = 0; n < 16; n++) {
    const key = `${i},${j},${k}`;
    if (!seen.has(key)) {
      seen.add(key);
      cells.push(b(i, j, k, palettes[Math.floor(r() * palettes.length)]));
    }
    const d = Math.floor(r() * 4);
    if (d === 0) i++;
    else if (d === 1) j++;
    else if (d === 2 && k < 4) k++;
    else if (i > 0) i--;
  }
  return cells;
}

/* Scene presets, each a different arrangement so every page reads differently. */

/** Home: a pipe that bends over the top, the brand's signature shape. */
export const pipeScene: Block[] = [
  b(0, 0, 0, "purple"), b(0, 0, 1, "purple"), b(0, 0, 2, "purple"), b(0, 0, 3, "blue"), b(0, 0, 4, "blue"),
  b(1, 0, 4, "blue"), b(2, 0, 4, "teal"), b(3, 0, 4, "teal"),
  b(3, 0, 3, "teal"), b(3, 0, 2, "purple"), b(3, 0, 1, "purple"), b(3, 0, 0, "indigo"),
  b(1, 1, 4, "ghost"), b(3, 1, 3, "ghost"),
];

export const productScene: Block[] = [
  b(0, 0, 0, "blue"), b(0, 0, 1, "blue"),
  b(1, 0, 0, "purple"), b(1, 0, 1, "purple"), b(1, 0, 2, "purple"),
  b(2, 0, 0, "teal"), b(2, 0, 1, "teal"), b(2, 0, 2, "teal"), b(2, 0, 3, "teal"),
];

export const embedScene: Block[] = [
  b(0, 0, 0, "teal"), b(1, 0, 0, "teal"), b(2, 0, 0, "teal"), b(0, 1, 0, "teal"), b(1, 1, 0, "teal"), b(2, 1, 0, "teal"),
  b(1, 1, 1, "purple"), b(0, 0, 1, "purple"),
];

export const adaptScene: Block[] = [
  b(0, 0, 0, "indigo"), b(1, 0, 0, "indigo"), b(2, 0, 0, "indigo"), b(3, 0, 0, "indigo"),
  b(1, 1, 0, "blue"), b(2, 1, 0, "blue"),
  b(1, 1, 1, "purple"), b(2, 1, 1, "purple"),
];

export const shipScene: Block[] = [
  b(0, 0, 0, "purple"), b(0, 0, 1, "purple"), b(0, 0, 2, "purple"), b(0, 0, 3, "purple"),
  b(4, 0, 0, "blue"), b(4, 0, 1, "blue"), b(4, 0, 2, "blue"), b(4, 0, 3, "blue"),
  b(1, 0, 3, "teal"), b(2, 0, 3, "teal"), b(3, 0, 3, "teal"),
];

export const modelsScene: Block[] = [
  b(0, 0, 0, "teal"), b(1, 0, 0, "teal"), b(1, 0, 1, "teal"),
  b(2, 0, 0, "blue"), b(2, 0, 1, "blue"), b(2, 0, 2, "blue"),
  b(3, 0, 0, "purple"), b(3, 0, 1, "purple"), b(3, 0, 2, "purple"), b(3, 0, 3, "purple"),
  b(4, 0, 0, "indigo"), b(4, 0, 1, "indigo"), b(4, 0, 2, "indigo"), b(4, 0, 3, "indigo"), b(4, 0, 4, "indigo"),
];

export const integrateScene: Block[] = [
  b(0, 0, 0, "purple"), b(1, 0, 0, "purple"), b(0, 1, 0, "purple"),
  b(3, 2, 0, "teal"), b(4, 2, 0, "teal"), b(3, 3, 0, "teal"),
  b(2, 1, 0, "ghost"), b(2, 2, 0, "ghost"),
];

export const docsHomeScene: Block[] = [
  b(0, 0, 0, "indigo"), b(1, 0, 0, "indigo"), b(2, 0, 0, "indigo"), b(3, 0, 0, "indigo"),
  b(0, 0, 1, "purple"), b(1, 0, 1, "purple"), b(2, 0, 1, "purple"),
  b(0, 0, 2, "blue"), b(1, 0, 2, "blue"),
  b(0, 0, 3, "teal"),
];

export const aboutScene: Block[] = [
  b(0, 0, 0, "purple"), b(1, 0, 0, "purple"), b(0, 1, 0, "purple"), b(1, 1, 0, "purple"),
  b(0, 0, 1, "teal"), b(1, 1, 1, "blue"),
];

export const customersScene: Block[] = [
  b(0, 0, 0, "blue"), b(1, 0, 0, "teal"), b(2, 0, 0, "purple"), b(3, 0, 0, "indigo"),
  b(0, 0, 1, "purple"), b(2, 0, 1, "blue"),
];

export const contactScene: Block[] = [
  b(0, 0, 0, "purple"), b(0, 0, 1, "purple"), b(0, 0, 2, "purple"),
  b(1, 0, 0, "teal"), b(2, 0, 0, "teal"),
];

export const accents = {
  home: "#7b61ff",
  product: "#3E7FF0",
  embed: "#31A8A6",
  adapt: "#4141CC",
  ship: "#7b61ff",
  models: "#2B62CF",
  integrate: "#31A8A6",
  docs: "#4141CC",
  about: "#7b61ff",
  customers: "#2B62CF",
  contact: "#31A8A6",
};
