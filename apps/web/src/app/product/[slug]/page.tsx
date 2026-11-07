import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/Blocks";
import { CTABand } from "@/components/PageParts";
import { Button, Reveal } from "@/components/ui";
import { CodeBlock } from "@/components/Interactive";
import { card, label } from "@/components/styles";
import { features } from "@/lib/content";

export function generateStaticParams() {
  return features.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const f = features.find((x) => x.slug === slug);
  return f ? { title: `${f.tag[0]}${f.tag.slice(1).toLowerCase()} — Zeroth`, description: f.lead } : {};
}

export default async function FeaturePage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const f = features.find((x) => x.slug === slug);
  if (!f) notFound();
  const next = features.find((x) => x.slug === f.next)!;

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-6 pb-24 pt-14 md:grid-cols-2 md:pt-24">
          <div>
            <Link href="/product" className={`${label} hover:text-accent`}>← PRODUCT</Link>
            <div className="mt-8 flex items-center gap-3">
              <Blocks className="h-10 w-10" size={10} stagger={0} blocks={f.icon} />
              <span className={label}>{f.tag}</span>
            </div>
            <h1 className="mt-6 max-w-[520px] text-[clamp(40px,5.6vw,68px)] font-bold leading-[1] tracking-[-0.045em]">{f.title}</h1>
            <p className="mt-8 max-w-[480px] text-[19px] leading-[1.5]">{f.lead}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="/docs">Read the docs</Button>
              <Link href="/models" className="inline-flex items-center justify-center px-5 py-4 text-[15px] font-semibold underline-offset-4 hover:underline">See the models →</Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[380px]">
            <Blocks className="float w-full" size={46} blocks={f.icon.map((b) => ({ ...b }))} />
          </div>
        </div>
      </section>

      <section className="bg-gray py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="text-[clamp(30px,4vw,48px)] font-bold tracking-[-0.04em]">How it works</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {f.steps.map((s, i) => (
              <Reveal key={s.t} delay={i * 90}>
                <div className={`${card} h-full p-7`}>
                  <div className="text-[44px] font-bold leading-none text-accent">0{i + 1}</div>
                  <h3 className="mt-6 text-[22px] font-bold tracking-tight">{s.t}</h3>
                  <p className="mt-3 text-[15px] leading-[1.55] text-black/70">{s.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-12 px-6 md:grid-cols-2">
          <Reveal className="min-w-0"><CodeBlock code={f.code} file={f.file} /></Reveal>
          <Reveal delay={100} className="min-w-0">
            <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
              {f.points.map((p) => (
                <div key={p.t} className="border-t border-black pt-5">
                  <h3 className="text-[18px] font-bold tracking-tight">{p.t}</h3>
                  <p className="mt-2 text-[15px] leading-[1.55] text-black/70">{p.b}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-gray py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className={label}>NEXT UP</div>
          <Link href={`/product/${next.slug}`} className="group mt-5 flex items-center justify-between gap-6 border-t border-black pt-6">
            <div className="flex items-center gap-5">
              <Blocks className="h-14 w-14 transition-transform group-hover:-translate-y-1" size={13} stagger={0} blocks={next.icon} />
              <div>
                <div className="text-[clamp(26px,3.4vw,40px)] font-bold tracking-[-0.03em] group-hover:text-accent">{next.title}</div>
                <p className="mt-1 hidden max-w-[560px] text-[15px] text-black/65 sm:block">{next.lead.split(". ")[0]}.</p>
              </div>
            </div>
            <span className="text-3xl transition-transform group-hover:translate-x-1" aria-hidden>→</span>
          </Link>
        </div>
      </section>
      <CTABand />
    </>
  );
}
