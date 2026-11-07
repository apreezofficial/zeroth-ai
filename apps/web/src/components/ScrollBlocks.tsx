"use client";
import { useEffect, useState } from "react";
import { PALETTE, type Block } from "./Blocks";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const easeOutBounce = (t: number) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

const key = (b: Block) => `${b.i}-${b.j}-${b.k}`;

/**
 * Scroll-scrubbed cube assembly. A pale slab sits on the ground; bottom-layer
 * cubes slide in along the floor, upper cubes drop onto the stack and bounce.
 */
export function ScrollBlocks({
  blocks,
  size = 40,
  className,
  duration = 1100,
  delay = 200,
  shadow = true,
}: {
  blocks: Block[];
  size?: number;
  className?: string;
  duration?: number;
  delay?: number;
  shadow?: boolean;
}) {
  // Plays once on load, then stays built until the page is reloaded.
  const [p, setP] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const v = clamp((now - t0) / duration);
      setP(v);
      if (v < 1) raf = requestAnimationFrame(tick);
    };
    const id = window.setTimeout(() => {
      if (reduced) setP(1);
      else raf = requestAnimationFrame(tick);
    }, reduced ? 0 : delay);
    return () => {
      window.clearTimeout(id);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [duration, delay]);

  const cos = Math.cos(Math.PI / 6) * size;
  const sin = size / 2;

  // draw order (back to front) vs. arrival order (floor first, then upward)
  const drawn = [...blocks].sort((a, b) => a.i + a.j + a.k - (b.i + b.j + b.k));
  const arrival = [...blocks].sort((a, b) => a.k - b.k || a.i + a.j - (b.i + b.j));
  const N = blocks.length;
  const rank = new Map(arrival.map((b, n) => [key(b), n]));

  const pos = drawn.map((b) => ({ ...b, x: (b.i - b.j) * cos, y: (b.i + b.j) * sin - b.k * size }));

  const i0 = Math.min(...blocks.map((b) => b.i)) - 0.25;
  const i1 = Math.max(...blocks.map((b) => b.i)) + 1.25;
  const j0 = Math.min(...blocks.map((b) => b.j)) - 0.25;
  const j1 = Math.max(...blocks.map((b) => b.j)) + 1.25;
  const drop = size * 1.6;
  const g = (a: number, b: number, lift = 0): [number, number] => [
    (a - b) * cos,
    (a + b) * sin + size + drop - lift,
  ];
  const shadowPts = [g(i0, j0), g(i1, j0), g(i1, j1), g(i0, j1)];
  const slabPts = [
    g(i0 + 0.25, j0 + 0.25, drop),
    g(i1 - 0.25, j0 + 0.25, drop),
    g(i1 - 0.25, j1 - 0.25, drop),
    g(i0 + 0.25, j1 - 0.25, drop),
  ];

  const fall = size * 5; // how high upper cubes start
  const slide = 3; // grid units the floor cubes travel
  const minX = Math.min(...pos.map((q) => q.x - slide * cos), ...shadowPts.map((q) => q[0])) - cos - 2;
  const maxX = Math.max(...pos.map((q) => q.x), ...shadowPts.map((q) => q[0])) + cos + 2;
  const minY = Math.min(...pos.map((q) => q.y)) - size * 1.2;
  const maxY =
    Math.max(...pos.map((q) => q.y + 2 * sin + size + slide * sin), ...shadowPts.map((q) => q[1])) + 2;

  const poly = (x: number, y: number) => ({
    top: `${x},${y} ${x + cos},${y + sin} ${x},${y + 2 * sin} ${x - cos},${y + sin}`,
    left: `${x - cos},${y + sin} ${x},${y + 2 * sin} ${x},${y + 2 * sin + size} ${x - cos},${y + sin + size}`,
    right: `${x},${y + 2 * sin} ${x + cos},${y + sin} ${x + cos},${y + sin + size} ${x},${y + 2 * sin + size}`,
  });

  const slabOpacity = clamp(1 - p * 2.2);

  return (
    <svg className={className} viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} aria-hidden>
      {shadow && (
        <polygon
          points={shadowPts.map((q) => q.join(",")).join(" ")}
          fill="#000"
          opacity={0.07 * clamp(p * 3 + 0.25)}
        />
      )}
      {/* pale resting slab shown before the cubes arrive */}
      <polygon
        points={slabPts.map((q) => q.join(",")).join(" ")}
        fill={PALETTE.ghost[0]}
        stroke="#C9C7F0"
        strokeWidth={0.8}
        opacity={slabOpacity}
      />
      {pos.map((b) => {
        const r = rank.get(key(b)) ?? 0;
        const start = (r / N) * 0.62;
        const q = clamp((p - start) / 0.38);
        if (q <= 0) return null;

        let dx = 0;
        let dy = 0;
        if (b.k === 0) {
          const e = easeOutBack(q);
          dx = -slide * cos * (1 - e);
          dy = slide * sin * (1 - e);
        } else {
          dy = -fall * (1 - easeOutBounce(q));
        }

        const f = poly(b.x, b.y);
        const [top, left, right] = PALETTE[b.c];
        return (
          <g
            key={key(b)}
            strokeLinejoin="round"
            strokeWidth={0.6}
            stroke="rgba(0,0,0,0.2)"
            opacity={clamp(q * 7)}
            transform={`translate(${dx} ${dy})`}
          >
            <polygon fill={top} points={f.top} />
            <polygon fill={left} points={f.left} />
            <polygon fill={right} points={f.right} />
          </g>
        );
      })}
    </svg>
  );
}
