import type { Metadata } from "next";
import { Diagram } from "@/components/Diagram";
import { CTABand, FeatureRow, PageHero, StatCards } from "@/components/PageParts";
import { Testimonial } from "@/components/Closing";
import { Button } from "@/components/ui";
import { CodeBlock } from "@/components/Interactive";
import { features, works } from "@/lib/content";

export const metadata: Metadata = {
  title: "Product — Zeroth",
  description: "Embed, adapt and ship a full AI model inside any app. It runs on-device with one SDK.",
};

export default function ProductPage() {
  return (
    <>
      <PageHero
        title={<>Embed, Adapt,<br />Ship.</>}
        sub="Put a full AI model inside your app, fit it to every device, and release it everywhere with a single API. No servers, no keys, no per-token bill."
      >
        <Button href="/docs">Read the docs</Button>
      </PageHero>
      <div className="px-6 pb-24"><Diagram /></div>

      <StatCards
        title="This is real performance."
        sub="On-device AI gives you the edge: instant responses, total privacy and a bill that never grows."
        stats={[
          { tag: "COST", n: "$0", l: "per token, at any scale" },
          { tag: "PRIVACY", n: "0 bytes", l: "of user data sent to a server" },
          { tag: "SPEED", n: "60+", l: "tokens per second on a modern laptop" },
        ]}
      />

      {features.map((f, i) => (
        <FeatureRow
          key={f.slug}
          tag={f.tag}
          title={f.title}
          body={f.lead}
          icon={f.icon}
          href={`/product/${f.slug}`}
          flip={i % 2 === 1}
          gray={i % 2 === 1}
          visual={<CodeBlock code={f.code} file={f.file} className="mx-auto max-w-[520px]" />}
        />
      ))}

      <Testimonial />

      <section className="bg-gray py-24">
        <div className="mx-auto max-w-[1000px] px-6">
          <h2 className="text-[clamp(32px,4.5vw,52px)] font-bold leading-[1.05] tracking-[-0.04em]">Works with the stack you already have.</h2>
          <p className="mt-6 max-w-[620px] text-[18px] leading-[1.5]">
            Zeroth is a library, not a platform. Drop it into your existing app, keep your own UI and your own data, and ship on your own release schedule.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {works.map((w) => (
              <span key={w} className="border border-black/15 bg-white px-4 py-2.5 text-[14px] font-semibold">{w}</span>
            ))}
          </div>
        </div>
      </section>
      <CTABand />
    </>
  );
}
