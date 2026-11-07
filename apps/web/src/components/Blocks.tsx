export type Block = { i: number; j: number; k: number; c: keyof typeof PALETTE };

// [top, left, right]
export const PALETTE = {
  ghost: ["#EEEDFF", "#E2E1FB", "#D6D5F6"],
  purple: ["#8B73FF", "#6A4FF0", "#5239D4"],
  blue: ["#5AA0FF", "#3E7FF0", "#2B62CF"],
  white: ["#FFFFFF", "#ECECF3", "#D6D6E2"],
  teal: ["#6FE3D6", "#47C9C0", "#31A8A6"],
  indigo: ["#5B5BE8", "#4141CC", "#2F2FA6"],
} as const;

export function Blocks({
  blocks,
  size = 40,
  className,
  stagger = 60,
}: {
  blocks: Block[];
  size?: number;
  className?: string;
  stagger?: number;
}) {
  const cos = Math.cos(Math.PI / 6) * size;
  const sin = size / 2;
  const sorted = [...blocks].sort((a, b) => a.i + a.j + a.k - (b.i + b.j + b.k));

  const pos = sorted.map((b) => ({
    ...b,
    x: (b.i - b.j) * cos,
    y: (b.i + b.j) * sin - b.k * size,
  }));
  const minX = Math.min(...pos.map((p) => p.x)) - cos - 2;
  const maxX = Math.max(...pos.map((p) => p.x)) + cos + 2;
  const minY = Math.min(...pos.map((p) => p.y)) - 2;
  const maxY = Math.max(...pos.map((p) => p.y)) + 2 * sin + size + 2;

  return (
    <svg
      className={className}
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      aria-hidden
    >
      {pos.map((p, n) => {
        const [top, left, right] = PALETTE[p.c];
        const stroke = p.c === "ghost" ? "#C9C7F0" : "rgba(0,0,0,0.18)";
        const { x, y } = p;
        return (
          <g
            key={n}
            className="cube-in"
            style={{ animationDelay: `${n * stagger}ms` }}
            stroke={stroke}
            strokeWidth={0.6}
            strokeLinejoin="round"
          >
            <polygon
              fill={top}
              points={`${x},${y} ${x + cos},${y + sin} ${x},${y + 2 * sin} ${x - cos},${y + sin}`}
            />
            <polygon
              fill={left}
              points={`${x - cos},${y + sin} ${x},${y + 2 * sin} ${x},${y + 2 * sin + size} ${x - cos},${y + sin + size}`}
            />
            <polygon
              fill={right}
              points={`${x},${y + 2 * sin} ${x + cos},${y + sin} ${x + cos},${y + sin + size} ${x},${y + 2 * sin + size}`}
            />
          </g>
        );
      })}
    </svg>
  );
}

export const bar = (n: number, c: Block["c"], k = 0): Block[] =>
  Array.from({ length: n }, (_, i) => ({ i, j: 0, k, c }));

export const wall = (w: number, h: number, c: Block["c"]): Block[] =>
  Array.from({ length: w * h }, (_, n) => ({ i: n % w, j: 0, k: Math.floor(n / w), c }));
