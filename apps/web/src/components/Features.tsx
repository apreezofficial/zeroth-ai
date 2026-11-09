"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal } from "./ui";

const card = "border border-black/15 bg-white shadow-[6px_6px_0_rgba(0,0,0,0.12)]";

/* ---------- sticky 3x3 icon that fills in as you scroll ---------- */
const STAGES: string[][] = [
  ["#39AAFF", "#39AAFF", "#39AAFF", "", "", "", "", "", ""],
  ["#39AAFF", "#39AAFF", "#39AAFF", "#7B61FF", "#7B61FF", "", "#7B61FF", "#7B61FF", ""],
  ["#39AAFF", "#5B8CFF", "#7B61FF", "#4FD1C5", "#7B61FF", "#39AAFF", "#7B61FF", "#4FD1C5", "#5B8CFF"],
];

function StickyGrid({ stage }: { stage: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 hidden md:block">
      <div className="sticky top-0 h-screen">
        <div className="mx-auto max-w-[1200px] px-6 pt-36">
          <div className="grid w-[46px] grid-cols-3 gap-[3px]">
            {STAGES[stage].map((c, i) => (
              <i
                key={i}
                className="aspect-square transition-all duration-500"
                style={{
                  background: c || "transparent",
                  outline: c ? "none" : "1px solid rgba(0,0,0,0.08)",
                  transitionDelay: `${(i % 3) * 60}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- mockups ---------- */
function CodeMock() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className={`${card} absolute -left-10 -top-10 hidden w-[190px] p-3 text-xs lg:block`}>
        <b className="mb-2 block border-b border-black/10 pb-2">Runtime</b>
        {["Model loaded", "GPU: Metal", "Network: none", "Latency: 18ms"].map((t) => (
          <div key={t} className="flex items-center gap-2 py-1 text-black/70">
            <span className="h-2 w-2 rounded-full bg-teal-400" /> {t}
          </div>
        ))}
      </div>
      <div className={`${card} lg:ml-10`}>
        <div className="flex items-center gap-1.5 bg-black px-3 py-2.5">
          <i className="h-2 w-2 rounded-full bg-accent" />
          <i className="h-2 w-2 rounded-full bg-sky-400" />
          <i className="h-2 w-2 rounded-full bg-teal-300" />
          <span className="ml-3 text-xs text-white/60">chat.ts</span>
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-[1.7]">
{`import { zeroth } from "@zeroth-ai/sdk"

const ai = await zeroth.load("granite-3b")

for await (const t of ai.chat("Plan my day")) {
  ui.append(t)   // streams on-device
}`}
        </pre>
        <div className="flex items-center justify-between border-t border-black/10 px-5 py-3 text-xs text-black/55">
          <span>⚡ 62 tok/s · 0 bytes sent</span>
          <span className="font-semibold text-accent">offline ✓</span>
        </div>
      </div>
    </div>
  );
}

const models = [
  ["lfm-1b", "Phones & wearables", "w-[40%]", "1.2B"],
  ["granite-3b", "Laptops & flagships", "w-[70%]", "3B"],
  ["gemma-e2b", "Laptops & phones", "w-[60%]", "2B"],
] as const;

function ModelsMock() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between">
          <b className="text-[15px]">Device budget</b>
          <span className="text-xs text-black/50">auto-selected</span>
        </div>
        <div className="mt-4 space-y-4">
          {models.map(([n, d, w, p], i) => (
            <div key={n} className={`flex items-center gap-4 border p-4 ${i === 1 ? "border-accent bg-[#f7f5ff]" : "border-black/10"}`}>
              <span className="grid h-3 w-3 place-items-center rounded-full border-2 border-black/40">
                {i === 1 && <i className="h-1.5 w-1.5 rounded-full bg-accent" />}
              </span>
              <div className="flex-1">
                <div className="flex justify-between">
                  <b className="font-mono text-[14px]">{n}</b>
                  <span className="text-xs text-black/50">{p} params</span>
                </div>
                <div className="text-[12px] text-black/55">{d}</div>
                <div className="mt-2 h-1.5 bg-gray"><div className={`h-full bg-accent ${w}`} /></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 text-xs text-black/55">
          <span>Quantised 4-bit · 4.8 GB</span>
          <span className="font-semibold text-black">Downloads once, then offline</span>
        </div>
      </div>
    </div>
  );
}

function IntegrateMock() {
  const apps = [
    ["Notes app", "iOS · React Native"],
    ["CRM desktop", "Electron"],
    ["Helpdesk web", "WASM"],
  ];
  return (
    <div className="mx-auto w-full max-w-[520px]">
      <div className="grid grid-cols-3 gap-3">
        {apps.map(([t, s]) => (
          <div key={t} className={`${card} p-3 text-xs`}>
            <b className="block text-[13px]">{t}</b>
            <span className="text-black/50">{s}</span>
            <div className="mt-3 h-10 bg-[repeating-linear-gradient(135deg,#ece9ff_0_6px,#f7f6ff_6px_12px)]" />
          </div>
        ))}
      </div>
      <svg viewBox="0 0 520 70" className="w-full" fill="none" stroke="#000" strokeWidth="4">
        <path d="M87 0v22q0 14 14 14h145M260 36v34M433 0v22q0 14-14 14H274M260 22v14" />
      </svg>
      <div className={`${card}`}>
        <div className="flex items-center gap-1.5 bg-black px-3 py-2.5">
          <i className="h-2 w-2 rounded-full bg-accent" />
          <i className="h-2 w-2 rounded-full bg-sky-400" />
          <i className="h-2 w-2 rounded-full bg-teal-300" />
          <span className="ml-3 text-xs text-white/60">Zeroth runtime · on-device</span>
        </div>
        <div className="grid grid-cols-3 gap-3 p-4 text-center text-xs">
          {["chat()", "embed()", "tools()"].map((f) => (
            <div key={f} className="border border-black/10 py-3 font-mono font-semibold">{f}</div>
          ))}
        </div>
        <div className="border-t border-black/10 px-4 py-3 text-xs text-black/55">
          Same API everywhere · no cloud · no keys
        </div>
      </div>
    </div>
  );
}

/* ---------- section ---------- */
const rows: {
  id?: string;
  title: string;
  body: string;
  visual: ReactNode;
}[] = [
  {
    title: "Drop in an on-device brain.",
    body: "Three lines turn any app into an AI app. Chat, summarise, extract and call tools with a frontier-class model that lives on the user’s device.",
    visual: <CodeMock />,
  },
  {
    id: "models",
    title: "Right-size the model for every device.",
    body: "Zeroth picks from 1B to 3B parameter models based on the hardware it finds, then caches it locally. Download once, offline forever.",
    visual: <ModelsMock />,
  },
  {
    id: "integrate",
    title: "Integrate once. Ship everywhere.",
    body: "One API across iOS, Android, Web and Desktop. Wire Zeroth into your existing app and every user gets private AI with zero backend.",
    visual: <IntegrateMock />,
  },
];

export function Features() {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.55;
      let s = 0;
      refs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < mid) s = i;
      });
      setStage(s);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div id="product" className="relative">
      <StickyGrid stage={stage} />
      {rows.map((r, i) => (
        <section
          key={r.title}
          id={r.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={i % 2 ? "bg-gray" : "bg-white"}
        >
          <div className="mx-auto grid min-h-[88vh] max-w-[1200px] grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2 md:pt-40">
            <Reveal className="min-w-0">
              <h2 className="max-w-[460px] text-[clamp(38px,5vw,60px)] font-bold leading-[1.02] tracking-[-0.04em]">
                {r.title}
              </h2>
              <p className="mt-8 max-w-[440px] text-[18px] leading-[1.5]">{r.body}</p>
            </Reveal>
            <Reveal delay={120} className="min-w-0">{r.visual}</Reveal>
          </div>
        </section>
      ))}
    </div>
  );
}
