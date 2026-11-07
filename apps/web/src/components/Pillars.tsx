import Link from "next/link";
import { Blocks } from "./Blocks";
import { Reveal } from "./ui";

const items = [
  ["Latency", "No round-trips. Tokens stream the instant the user types, straight from their own GPU or NPU.", "See benchmarks", "/models"],
  ["Privacy", "Prompts, files and voice never leave the device. Nothing logged, nothing trained on, nothing to breach.", "How it works", "/product"],
  ["Cost", "No per-token bill, no rate limits, no outages. Your AI feature costs the same at 10 users or 10 million.", "Read the docs", "/docs"],
] as const;

export function Pillars() {
  return (
    <section className="overflow-hidden bg-black py-28 text-white">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="mx-auto max-w-[760px] text-center text-[clamp(38px,5.5vw,68px)] font-bold leading-[1.02] tracking-[-0.04em]">
          Latency, privacy and cost.
          <br />
          No trade-offs.
        </h2>
        <div className="mt-14 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 -z-0 scale-150 bg-accent/30 blur-3xl" />
            <Blocks
              className="relative w-[150px]"
              size={36}
              stagger={0}
              blocks={[
                { i: 0, j: 0, k: 0, c: "indigo" }, { i: 1, j: 0, k: 0, c: "purple" },
                { i: 0, j: 1, k: 0, c: "purple" }, { i: 1, j: 1, k: 0, c: "indigo" },
              ]}
            />
          </div>
        </div>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {items.map(([t, b, c, h], i) => (
            <Reveal key={t} delay={i * 100}>
              <div className="border-t border-white/25 pt-8">
                <h3 className="text-[28px] font-bold tracking-tight">{t}</h3>
                <p className="mt-5 max-w-[320px] text-[17px] leading-[1.5] text-white/80">{b}</p>
                <Link href={h} className="mt-8 inline-block border-b border-white pb-0.5 text-[15px] font-semibold hover:border-accent hover:text-accent">
                  {c}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
