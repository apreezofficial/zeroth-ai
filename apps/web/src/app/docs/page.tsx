import type { Metadata } from "next";
import { CodeBlock } from "@/components/Interactive";
import { DocsSidebar } from "@/components/DocsSidebar";

export const metadata: Metadata = {
  title: "Docs — Zeroth",
  description: "Install the Zeroth SDK, load a model and stream tokens on-device in minutes.",
};

const api = [
  ["zeroth.load(options)", "Loads (and downloads on first run) a model. Returns an instance."],
  ["ai.chat(input, opts?)", "Streams tokens for a prompt or message list as an async iterable."],
  ["ai.complete(input, opts?)", "Returns the full response as a single string."],
  ["ai.json(input, schema)", "Returns an object validated against a JSON schema."],
  ["ai.embed(texts)", "Returns one embedding vector for each input string."],
  ["ai.tools(defs)", "Registers functions the model may call during a chat."],
  ["ai.unload()", "Frees model memory when you no longer need it."],
];

const faq = [
  ["Does it need an internet connection?", "Only once, to download a model on first launch. After that every call runs fully offline."],
  ["Do I need an API key?", "No. There is no account, key or server involved in running the SDK."],
  ["Is user data sent anywhere?", "No. Prompts, files and outputs stay on the device. The runtime requests no network permission after the model is cached."],
  ["How big is the download?", "The runtime adds a few MB to your app. Models range from about 0.1 GB to 19 GB depending on the tier and are fetched on demand."],
];

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-28 border-t border-black/10 pt-12 text-[clamp(26px,3vw,34px)] font-bold tracking-[-0.03em] first:border-0 first:pt-0">
      {children}
    </h2>
  );
}
const P = ({ children }: { children: React.ReactNode }) => <p className="mt-4 max-w-[680px] text-[16px] leading-[1.65] text-black/80">{children}</p>;

export default function DocsPage() {
  return (
    <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-12 lg:grid-cols-[250px_1fr] lg:gap-16 lg:py-16">
      <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto"><DocsSidebar /></aside>
      <article className="min-w-0 space-y-12 pb-24">
        <header>
          <div className="text-[11px] font-semibold tracking-[0.12em] text-accent">DOCUMENTATION</div>
          <h1 className="mt-4 text-[clamp(38px,5.5vw,64px)] font-bold leading-[1] tracking-[-0.045em]">Zeroth docs</h1>
        </header>

        <section className="space-y-4">
          <H id="introduction">Introduction</H>
          <P>Zeroth is an SDK that runs a full language model inside your app, on the user’s device. There is no server to host, no API key to protect and no per-token bill. One API works on iOS, Android, Web and Desktop.</P>
        </section>

        <section className="space-y-4">
          <H id="installation">Installation</H>
          <P>Add the package for your platform. The runtime is small. Models are downloaded on first launch.</P>
          <CodeBlock file="terminal" code={`npm i @zeroth/sdk            # Web
npm i @zeroth/sdk-node       # Desktop (Electron, Tauri)
# iOS:     Swift Package  zeroth-swift
# Android: implementation("ai.zeroth:sdk:1.0.0")`} />
        </section>

        <section className="space-y-4">
          <H id="quickstart">Quickstart</H>
          <P>Load a model and stream a reply in a few lines. Passing <code className="bg-gray px-1.5 py-0.5 font-mono text-[14px]">{'"auto"'}</code> lets Zeroth pick the best model for the device.</P>
          <CodeBlock file="chat.ts" code={`import { zeroth } from "@zeroth/sdk"

const ai = await zeroth.load("auto")

for await (const token of ai.chat("Plan my day")) {
  ui.append(token)
}`} />
        </section>

        <section className="space-y-4">
          <H id="loading-models">Loading models</H>
          <P>Choose a model by name, or describe what you care about and let Zeroth decide. Downloads resume if interrupted and are checksum-verified.</P>
          <CodeBlock file="models.ts" code={`const ai = await zeroth.load({
  prefer: "quality",      // "speed" | "battery"
  maxDownloadMB: 2500,
  fallback: "nano-1b",
  onProgress: (p) => bar.set(p),
})`} />
        </section>

        <section className="space-y-4">
          <H id="chat">Chat and streaming</H>
          <P>Pass a string or a list of messages. <code className="bg-gray px-1.5 py-0.5 font-mono text-[14px]">chat()</code> returns an async iterable of tokens. Use <code className="bg-gray px-1.5 py-0.5 font-mono text-[14px]">complete()</code> if you only need the final text.</P>
          <CodeBlock file="chat.ts" code={`const reply = await ai.complete([
  { role: "system", content: "Be concise." },
  { role: "user", content: "Explain WebGPU in one line." },
])`} />
        </section>

        <section className="space-y-4">
          <H id="structured-output">Structured output</H>
          <P>Ask for JSON and get a validated object back instead of text you have to parse.</P>
          <CodeBlock file="json.ts" code={`const task = await ai.json("Create a task from: call Sam Friday", {
  type: "object",
  properties: { title: { type: "string" }, due: { type: "string" } },
  required: ["title"],
})`} />
        </section>

        <section className="space-y-4">
          <H id="embeddings">Embeddings</H>
          <P>Compute vectors on-device for semantic search over notes, files or messages without uploading anything.</P>
          <CodeBlock file="embed.ts" code={`const [a, b] = await ai.embed(["invoice from March", "march billing"])`} />
        </section>

        <section className="space-y-4">
          <H id="tools">Tools</H>
          <P>Register functions in your app that the model can call, such as searching a local database or creating a calendar event.</P>
          <CodeBlock file="tools.ts" code={`ai.tools({
  searchNotes: {
    description: "Search the user's notes",
    run: async ({ query }) => db.search(query),
  },
})`} />
        </section>

        <section className="space-y-4">
          <H id="offline">Working offline</H>
          <P>After the first model download, Zeroth makes no network requests. You can safely ship to environments with no connectivity, and remove the network permission from your app if it has no other need for it.</P>
          <ul className="max-w-[680px] list-disc space-y-2 pl-5 text-[16px] leading-[1.6] text-black/80">
            <li>Check <code className="bg-gray px-1.5 py-0.5 font-mono text-[14px]">ai.ready</code> to know the model is cached.</li>
            <li>Preload during onboarding so the first real use is instant.</li>
            <li>Models are stored in app storage and can be cleared with <code className="bg-gray px-1.5 py-0.5 font-mono text-[14px]">zeroth.clearCache()</code>.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <H id="api">API reference</H>
          <div className="overflow-x-auto border border-black/15">
            <table className="w-full min-w-[520px] text-left text-[14px]">
              <thead className="bg-gray text-[12px] tracking-[0.08em] text-black/55">
                <tr><th className="px-4 py-3 font-semibold">METHOD</th><th className="px-4 py-3 font-semibold">DESCRIPTION</th></tr>
              </thead>
              <tbody>
                {api.map(([m, d]) => (
                  <tr key={m} className="border-t border-black/10 align-top">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[13px] font-semibold">{m}</td>
                    <td className="px-4 py-3 text-black/75">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <H id="faq">FAQ</H>
          <div className="max-w-[720px] divide-y divide-black/10 border-y border-black/10">
            {faq.map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[16px] font-semibold">
                  {q}<span className="text-xl transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 text-[15px] leading-[1.6] text-black/75">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
