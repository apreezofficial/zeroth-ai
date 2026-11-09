import type { Metadata } from "next";
import { CTABand, PageHero } from "@/components/PageParts";
import { Reveal } from "@/components/ui";
import { card } from "@/components/styles";

export const metadata: Metadata = { title: "About — Zeroth", description: "We build the runtime that lets apps run AI on the device, so prompts and user data never have to reach a server." };

const values = [
  ["Private by design", "If data never leaves the device, it can’t be breached, sold or subpoenaed from us."],
  ["Works anywhere", "Planes, basements, remote sites. AI shouldn’t depend on a signal."],
  ["Honest engineering", "We publish what we measure, including where on-device still falls short."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero dark title={<>Intelligence<br />with zero cloud.</>} sub="We believe the best AI is the one that’s already in your pocket, working even when nothing else is." />
      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1000px] px-6">
          <h2 className="text-[clamp(30px,4vw,46px)] font-bold tracking-[-0.04em]">Our mission and our why.</h2>
          <p className="mt-8 max-w-[720px] text-[18px] leading-[1.6]">
            Every AI feature we used was a round trip to someone else’s server: slow, metered, and one outage away from broken. Teams told us the same thing. They wanted to ship AI without shipping their users’ data. So we built a runtime that puts the model inside the app.
          </p>
        </div>
      </section>
      <section className="bg-gray py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="text-[clamp(30px,4vw,46px)] font-bold tracking-[-0.04em]">What we stand for.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map(([t, b], i) => (
              <Reveal key={t} delay={i * 90}>
                <div className={`${card} h-full p-7`}>
                  <h3 className="text-[22px] font-bold tracking-tight">{t}</h3>
                  <p className="mt-3 text-[15px] leading-[1.55] text-black/70">{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTABand title="Build with us." primary={["Read the docs", "/docs"]} secondary={["Contact", "/contact"]} />
    </>
  );
}
