import Link from "next/link";
import type { ReactNode } from "react";
import { Blocks, type Block } from "./Blocks";
import { Button, Reveal } from "./ui";
import { label } from "./styles";

export function PageHero({
  title,
  sub,
  children,
  dark = false,
}: {
  title: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
  dark?: boolean;
}) {
  return (
    <section className={dark ? "bg-[#0d0d10] text-white" : "bg-white"}>
      <div className="mx-auto max-w-[1000px] px-6 pb-20 pt-16 text-center md:pt-24">
        <h1 className="text-[clamp(42px,7vw,84px)] font-bold leading-[1] tracking-[-0.045em]">{title}</h1>
        {sub && <p className={`mx-auto mt-8 max-w-[640px] text-[19px] leading-[1.5] ${dark ? "text-white/80" : ""}`}>{sub}</p>}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}

export function CTABand({
  title = "Add offline AI to your app in five minutes.",
  primary = ["Read the docs", "/docs"],
  secondary = ["See the product", "/product"],
}: {
  title?: string;
  primary?: [string, string];
  secondary?: [string, string];
}) {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-8 px-6 py-20 md:flex-row md:items-center md:justify-between">
        <h2 className="max-w-[560px] text-[clamp(30px,4vw,48px)] font-bold leading-[1.05] tracking-[-0.04em]">{title}</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={primary[1]} light>{primary[0]}</Button>
          <Link href={secondary[1]} className="inline-flex items-center justify-center px-5 py-4 text-[15px] font-semibold underline-offset-4 hover:underline">
            {secondary[0]} →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function StatCards({
  title,
  sub,
  stats,
}: {
  title: string;
  sub: string;
  stats: { n: string; l: string; tag: string }[];
}) {
  const bars = ["bg-accent", "bg-teal-400", "bg-sky-400"];
  return (
    <section className="bg-gray py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="text-center text-[clamp(32px,4.5vw,52px)] font-bold tracking-[-0.04em]">{title}</h2>
        <p className="mx-auto mt-5 max-w-[560px] text-center text-[17px]">{sub}</p>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={i * 100}>
              <div className="border border-black/10 bg-white shadow-[0_2px_0_rgba(0,0,0,0.05)]">
                <div className={`h-1.5 ${bars[i % 3]}`} />
                <div className="p-8">
                  <div className="text-[13px] font-bold tracking-tight text-black/45">{s.tag}</div>
                  <div className="mt-8 text-[clamp(52px,6vw,72px)] font-bold leading-none tracking-[-0.05em]">{s.n}</div>
                  <div className="mt-4 text-[15px] text-black/70">{s.l}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeatureRow({
  tag,
  title,
  body,
  icon,
  href,
  visual,
  flip = false,
  gray = false,
}: {
  tag: string;
  title: string;
  body: string;
  icon: Block[];
  href: string;
  visual: ReactNode;
  flip?: boolean;
  gray?: boolean;
}) {
  return (
    <section className={gray ? "bg-gray" : "bg-white"}>
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
        <Reveal className={`min-w-0 ${flip ? "md:order-2" : ""}`}>
          <div className="mb-6 flex items-center gap-3">
            <Blocks className="h-10 w-10" size={10} stagger={0} blocks={icon} />
            <span className={label}>{tag}</span>
          </div>
          <h2 className="max-w-[460px] text-[clamp(34px,4.6vw,56px)] font-bold leading-[1.03] tracking-[-0.04em]">{title}</h2>
          <p className="mt-7 max-w-[450px] text-[18px] leading-[1.5]">{body}</p>
          <Link href={href} className="mt-9 inline-flex items-center gap-3 text-[15px] font-semibold hover:text-accent">
            Learn more
            <span className="grid h-5 w-5 place-items-center rounded-full bg-black text-[10px] text-white">›</span>
          </Link>
        </Reveal>
        <Reveal delay={120} className={`min-w-0 ${flip ? "md:order-1" : ""}`}>{visual}</Reveal>
      </div>
    </section>
  );
}
