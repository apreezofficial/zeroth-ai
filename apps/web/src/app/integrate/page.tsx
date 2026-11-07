import type { Metadata } from "next";
import { CTABand, PageHero } from "@/components/PageParts";
import { PlatformTabs } from "@/components/Interactive";
import { Reveal } from "@/components/ui";
import { card } from "@/components/styles";
import { works } from "@/lib/content";

export const metadata: Metadata = {
  title: "Integrate — Zeroth",
  description: "One API for iOS, Android, Web and Desktop. Add on-device AI to your existing app in minutes.",
};

const steps = [
  ["Add the package", "Use the Swift Package, Gradle artifact or npm module for your platform."],
  ["Load once", "Call load(). The first launch downloads a model, every launch after is instant."],
  ["Call anywhere", "Use chat(), embed() and tools() from any screen, with no network permission."],
];

export default function IntegratePage() {
  return (
    <>
      <PageHero
        title={<>Integrate once.<br />Ship everywhere.</>}
        sub="Zeroth is a library you drop into the app you already have. Same API on every platform, no backend to run."
      />
      <section className="bg-gray py-20">
        <div className="mx-auto max-w-[1100px] px-6"><PlatformTabs /></div>
      </section>
      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="text-[clamp(32px,4.5vw,52px)] font-bold tracking-[-0.04em]">Three steps to a private AI feature.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map(([t, b], i) => (
              <Reveal key={t} delay={i * 90}>
                <div className={`${card} h-full p-7`}>
                  <div className="text-[44px] font-bold leading-none text-accent">0{i + 1}</div>
                  <h3 className="mt-6 text-[22px] font-bold tracking-tight">{t}</h3>
                  <p className="mt-3 text-[15px] leading-[1.55] text-black/70">{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-[1000px] px-6 text-center">
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.04em]">Works with your stack.</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {works.map((w) => <span key={w} className="border border-white/25 px-4 py-2.5 text-[14px] font-semibold">{w}</span>)}
          </div>
        </div>
      </section>
      <CTABand />
    </>
  );
}
