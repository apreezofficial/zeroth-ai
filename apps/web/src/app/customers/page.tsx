import type { Metadata } from "next";
import Link from "next/link";
import { Button, Reveal } from "@/components/ui";
import { CTABand } from "@/components/PageParts";
import { purpleCard } from "@/components/styles";

export const metadata: Metadata = { title: "Customers — Zeroth", description: "Teams shipping private, offline AI with Zeroth." };

const quotes = [
  ["“We added Zeroth to our notes app in an afternoon. Summaries now run on-device, on a plane, with zero backend cost.”", "Maya Okafor", "Head of Engineering, Hushline"],
  ["“Our field engineers work with no signal. Zeroth is the first AI feature that works for them.”", "Daniel Reyes", "CTO, Fieldnote"],
  ["“Legal wouldn’t let client data leave the laptop. With Zeroth it never does.”", "Priya Nair", "Product Lead, Ledgerly"],
];
const logos = ["Hushline", "Kernel Labs", "Airgap", "Northwind", "Cobalt", "Ledgerly", "Fieldnote", "Quiet Co."];

export default function CustomersPage() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <h1 className="text-[clamp(40px,5.6vw,68px)] font-bold leading-[1] tracking-[-0.045em]">Private AI.<br />Happy teams.</h1>
            <p className="mt-8 max-w-[460px] text-[18px] leading-[1.55]">Teams ship AI features without shipping their users’ data. If your AI bill keeps growing, or legal keeps saying no, you need a slice of Zeroth.</p>
            <div className="mt-10"><Button href="/contact">Talk to us</Button></div>
          </div>
          <div className="space-y-7">
            {quotes.map(([q, n, r], i) => (
              <Reveal key={n} delay={i * 100}>
                <figure className={`${purpleCard} p-6 ${i === 1 ? "md:ml-10" : i === 2 ? "md:ml-4" : ""}`}>
                  <blockquote className="text-[16px] leading-[1.55]">{q}</blockquote>
                  <figcaption className="mt-4 text-[13px] text-black/60"><b className="text-black">{n}</b> · {r}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1000px] px-6">
          <h2 className="text-[clamp(28px,3.4vw,40px)] font-bold tracking-[-0.03em]">Built with Zeroth</h2>
          <a
            href="https://github.com/apreezofficial/drer"
            target="_blank"
            rel="noopener noreferrer"
            className={`${purpleCard} mt-8 flex flex-col gap-3 p-7 hover:-translate-y-0.5 transition-transform`}
          >
            <span className="text-[13px] font-semibold tracking-[0.12em] text-black/50">DESKTOP · macOS</span>
            <span className="text-[22px] font-bold tracking-tight">DRER (Aura OS Go)</span>
            <span className="text-[15px] leading-[1.55] text-black/70">
              A desktop assistant whose chat and actions run on-device through <code>@zeroth-ai/sdk-node</code>. Prompts and instructions work offline.
            </span>
            <span className="mt-2 text-[14px] font-semibold text-accent">View the source on GitHub →</span>
          </a>
        </div>
      </section>
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-[1000px] px-6 text-center">
          <h2 className="text-[20px] font-bold">Chosen by progressive teams.</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {logos.map((l) => <span key={l} className="text-[22px] font-bold tracking-tight text-white/80">{l}</span>)}
          </div>
          <p className="mt-10 text-[12px] text-white/40">Placeholder names for illustration.</p>
          <Link href="/docs" className="mt-8 inline-block text-[15px] font-semibold underline underline-offset-4 hover:text-accent">Start building →</Link>
        </div>
      </section>
      <CTABand />
    </>
  );
}
