import { Blocks } from "./Blocks";

const L = [60, 156, 252, 348];
const R = [44, 124, 204, 284, 364];
const leftLabels = ["iOS", "Android", "Web", "Desktop"];
const rightLabels = ["Chat", "Search", "Voice", "Agents", "Vision"];
const MID = 204;

const pathLeft = (cy: number) =>
  cy === MID ? `M100 ${cy} H250` : `M100 ${cy} H226 Q250 ${cy} 250 ${cy + (cy < MID ? 24 : -24)} V${MID}`;
const pathRight = (cy: number) =>
  cy === MID ? `M900 ${cy} H750` : `M900 ${cy} H774 Q750 ${cy} 750 ${cy + (cy < MID ? 24 : -24)} V${MID}`;

function Box({ x, cy, text }: { x: number; cy: number; text: string }) {
  return (
    <div
      className="absolute grid aspect-square place-items-center border-2 border-black bg-white text-center text-[clamp(8px,1.25vw,13px)] font-bold shadow-[3px_3px_0_rgba(0,0,0,0.15)]"
      style={{ left: `${x / 10}%`, top: `${(cy / 408) * 100}%`, width: "7%", transform: "translateY(-50%)" }}
    >
      {text}
    </div>
  );
}

/** Apps on the left feed one on-device runtime that powers features on the right. */
export function Diagram() {
  return (
    <div className="relative mx-auto aspect-[1000/408] w-full max-w-[980px]">
      <svg viewBox="0 0 1000 408" className="absolute inset-0 h-full w-full" fill="none" stroke="#0b0b0f" strokeWidth="7" strokeLinejoin="round" aria-hidden>
        {L.map((cy) => <path key={cy} d={pathLeft(cy)} />)}
        {R.map((cy) => <path key={cy} d={pathRight(cy)} />)}
        <path d={`M250 ${MID} H410`} />
        <path d={`M590 ${MID} H750`} />
      </svg>
      {L.map((cy, i) => <Box key={cy} x={30} cy={cy} text={leftLabels[i]} />)}
      {R.map((cy, i) => <Box key={cy} x={900} cy={cy} text={rightLabels[i]} />)}
      <div className="absolute left-1/2 top-1/2 w-[17%] -translate-x-1/2 -translate-y-[56%]">
        <Blocks className="float w-full" size={60} stagger={0} blocks={[{ i: 0, j: 0, k: 0, c: "purple" }]} />
        <span className="absolute inset-x-0 top-[22%] text-center text-[clamp(12px,2.4vw,30px)] font-bold text-white">Z</span>
      </div>
    </div>
  );
}
