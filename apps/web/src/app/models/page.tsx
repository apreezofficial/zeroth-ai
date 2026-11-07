import type { Metadata } from "next";
import { CTABand, PageHero } from "@/components/PageParts";
import { ModelsExplorer } from "@/components/Interactive";
import { Reveal } from "@/components/ui";
import { card } from "@/components/styles";

export const metadata: Metadata = {
  title: "Models — Zeroth",
  description: "From 1B to 32B parameters, Zeroth models are quantised to run on phones, laptops and workstations.",
};

const how = [
  ["Probe", "On first launch Zeroth measures memory, GPU and NPU support in milliseconds."],
  ["Match", "It picks the largest model that fits comfortably, leaving headroom for your app."],
  ["Cache", "The model downloads once, is verified, and then works with no connection at all."],
];

export default function ModelsPage() {
  return (
    <>
      <PageHero
        title={<>The right brain<br />for every device.</>}
        sub="Six models from 110M to 32B parameters. Quantised to 4-bit so they stay small, fast and sharp."
      />
      <section className="bg-gray py-20">
        <div className="mx-auto max-w-[1200px] px-6"><ModelsExplorer /></div>
      </section>
      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="max-w-[560px] text-[clamp(32px,4.5vw,52px)] font-bold leading-[1.05] tracking-[-0.04em]">You don’t have to choose. Zeroth does.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {how.map(([t, b], i) => (
              <Reveal key={t} delay={i * 90}>
                <div className={`${card} h-full p-7`}>
                  <div className="text-[44px] font-bold leading-none text-accent">0{i + 1}</div>
                  <h3 className="mt-6 text-[22px] font-bold tracking-tight">{t}</h3>
                  <p className="mt-3 text-[15px] leading-[1.55] text-black/70">{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-10 max-w-[620px] text-[13px] leading-[1.6] text-black/50">Sizes and speeds are indicative targets for 4-bit builds on current hardware and will be replaced with measured benchmarks at release.</p>
        </div>
      </section>
      <CTABand title="Pick a model, or let Zeroth pick one for you." />
    </>
  );
}
