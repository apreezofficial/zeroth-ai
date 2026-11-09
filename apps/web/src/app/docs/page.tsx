import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/Interactive";
import { docs, groups } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Docs — Zeroth",
  description: "Install the SDK, load a model, stream replies and get JSON back. Guides for tools, offline use, the CLI and every error code.",
};

export default function DocsHome() {
  return (
    <div className="max-w-[860px]">
      <div className="text-[11px] font-semibold tracking-[0.12em] text-accent">DOCUMENTATION</div>
      <h1 className="mt-4 text-[clamp(38px,6vw,60px)] font-bold leading-[1] tracking-[-0.045em]">Build with Zeroth</h1>
      <p className="mt-5 max-w-[560px] text-[17px] leading-[1.6] text-black/75">
        Run a language model inside your app, on the user’s device. No servers, no keys, no per-token bill.
      </p>
      <div className="mt-8">
        <Link href="/docs/quickstart" className="inline-flex min-h-12 items-center bg-black px-5 text-[15px] font-semibold text-white hover:bg-accent">
          Start the quickstart →
        </Link>
      </div>
      <CodeBlock
        className="mt-10"
        file="app.ts"
        code={`import { zeroth } from "@zeroth-ai/sdk-node"

const ai = await zeroth.load("auto")

for await (const token of ai.chat("Plan my day")) {
  process.stdout.write(token)
}`}
      />
      {groups.map((g) => (
        <section key={g} className="mt-14">
          <h2 className="text-[11px] font-semibold tracking-[0.12em] text-black/45">{g.toUpperCase()}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {docs.filter((d) => d.group === g).map((d) => (
              <li key={d.slug}>
                <Link href={`/docs/${d.slug}`} className="group block h-full border border-black/15 p-5 transition-colors hover:border-accent">
                  <div className="text-[17px] font-bold tracking-tight group-hover:text-accent">{d.title}</div>
                  <p className="mt-1.5 text-[14px] leading-[1.55] text-black/65">{d.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
