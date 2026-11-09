import type { Metadata } from "next";
import { Suspense } from "react";
import { CTABand, PageHero } from "@/components/PageParts";
import { StatsBars } from "@/components/StatsBars";
import { Reveal } from "@/components/ui";
import { card } from "@/components/styles";
import { getNpmStats } from "@/lib/npm-stats";

export const metadata: Metadata = {
  title: "Stats — Zeroth",
  description: "Live npm download counts for every Zeroth package: last day, week and month, lifetime totals and a 30-day chart.",
};

const n = (v: number) => v.toLocaleString("en-US");

async function Packages() {
  const { packages, updated } = await getNpmStats();
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {packages.map((p, i) => (
          <Reveal key={p.name} delay={i * 70}>
            <article className={`${card} h-full p-7`}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-mono text-[17px] font-bold">{p.name}</h2>
                <a
                  href={`https://www.npmjs.com/package/${p.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[13px] font-semibold text-accent underline-offset-4 hover:underline"
                >
                  npm →
                </a>
              </div>
              <p className="mt-2 text-[14px] leading-[1.5] text-black/65">{p.blurb}</p>

              {p.counted ? (
                <>
                  <dl className="mt-6 grid grid-cols-2 gap-y-4 text-[13px] sm:grid-cols-4">
                    {[["Last day", p.day], ["Last week", p.week], ["Last month", p.month], ["Since launch", p.lifetime]].map(([k, v]) => (
                      <div key={k as string}>
                        <dt className="text-black/50">{k}</dt>
                        <dd className="text-[24px] font-bold tracking-tight">{n(v as number)}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-6">
                    <StatsBars series={p.series} label={`${p.name} daily downloads, last 30 days`} />
                    <div className="mt-2 flex justify-between text-[11px] text-black/45">
                      <span>{p.series[0]?.day}</span>
                      <span>{p.series.at(-1)?.day}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-6 text-[14px] leading-[1.5] text-black/65">
                  npm has not reported any counts for this package yet. New packages usually appear within a day of publishing.
                </p>
              )}
            </article>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 max-w-[720px] text-[13px] leading-[1.6] text-black/55">
        Counts come from npm&apos;s public downloads API and refresh hourly (last refreshed {new Date(updated).toUTCString()}). npm counts every
        install, including CI runs, bots and mirrors, so treat them as a rough signal of interest, not a count of people. Installing{" "}
        <code>@zeroth-ai/sdk-node</code> also installs <code>@zeroth-ai/sdk</code>, so the numbers should not be added together.
      </p>
    </>
  );
}

export default function StatsPage() {
  return (
    <>
      <PageHero title={<>Downloads,<br />straight from npm.</>} sub="Every Zeroth package, counted by npm itself. Nothing is estimated or rounded here." />
      <section className="bg-gray py-20">
        <div className="mx-auto max-w-[1100px] px-6">
          <Suspense fallback={<p className="text-[15px] text-black/60">Loading download counts…</p>}>
            <Packages />
          </Suspense>
        </div>
      </section>
      <CTABand title="Join the people building with Zeroth." />
    </>
  );
}
