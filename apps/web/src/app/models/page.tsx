import { CTABand, PageHero } from "@/components/PageParts";
import { ModelsExplorer } from "@/components/Interactive";
import { Reveal } from "@/components/ui";
import { card } from "@/components/styles";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Open-Weight AI Models", description: "Compare Zeroth’s built-in GGUF language models by size, memory needs and runtime support, or configure another compatible model in Model Studio.", path: "/models" });

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
        sub="Open-weight models from 1.2B to 3.4B on disk, quantised to 4-bit so they stay small and fast. Four run today; ze-code is in development."
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
          <p className="mt-10 max-w-[620px] text-[13px] leading-[1.6] text-black/50">Speeds are figures reported by others or estimates from public sources, not Zeroth benchmarks. They vary by device, quantisation and context length.</p>
        </div>
      </section>
      <CTABand title="Bring your own GGUF or pick a built-in model." primary={["Open Model Studio", "/studio"]} secondary={["Read the docs", "/docs"]} />
    </>
  );
}
