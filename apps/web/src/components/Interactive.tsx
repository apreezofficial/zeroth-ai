"use client";
import { useMemo, useState } from "react";
import { card } from "./styles";
import { detectLang, highlight, tokenClass } from "./docs/highlight";
import { models as allModels, platforms } from "@/lib/content";

export function CodeBlock({ code, file = "code", lang, className = "" }: { code: string; file?: string; lang?: string; className?: string }) {
  const [done, setDone] = useState(false);
  const tokens = useMemo(() => highlight(code, detectLang(lang ?? file)), [code, lang, file]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className={`min-w-0 overflow-hidden border border-black bg-[#0d0d10] text-white shadow-[6px_6px_0_rgba(0,0,0,0.12)] ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <i className="h-2 w-2 shrink-0 rounded-full bg-accent" />
        <i className="h-2 w-2 shrink-0 rounded-full bg-sky-400" />
        <i className="h-2 w-2 shrink-0 rounded-full bg-teal-300" />
        <span className="ml-2 min-w-0 flex-1 truncate font-mono text-[11.5px] text-white/55">{file}</span>
        <button
          onClick={copy}
          aria-label={done ? "Copied" : `Copy ${file}`}
          className="-my-1 shrink-0 px-2 py-2.5 text-[12px] font-semibold text-white/70 hover:text-white sm:py-1.5"
        >
          {done ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.75] sm:p-5 sm:text-[13px]" tabIndex={0}>
        <code>
          {tokens.map((t, i) => (
            <span key={i} className={tokenClass[t.kind]}>{t.text}</span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function PlatformTabs() {
  const [id, setId] = useState<(typeof platforms)[number]["id"]>("desktop");
  const p = platforms.find((x) => x.id === id)!;
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist">
        {platforms.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={x.id === id}
            onClick={() => setId(x.id)}
            className={`px-5 py-3 text-[15px] font-semibold transition-colors ${
              x.id === id ? "bg-accent text-white" : "bg-black text-white hover:bg-accent/80"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.4fr]">
        <div className={`${card} min-w-0 p-6`}>
          <div className="text-[11px] font-semibold tracking-[0.12em] text-black/50">1 · INSTALL</div>
          <code className="mt-4 block break-all bg-gray p-4 font-mono text-[13px]">{p.install}</code>
          {p.status !== "available" && <p className="mt-3 text-[13px] leading-[1.5] text-black/60">{p.note}</p>}
          <div className="mt-8 text-[11px] font-semibold tracking-[0.12em] text-black/50">REQUIREMENTS</div>
          <ul className="mt-3 space-y-2 text-[14px] text-black/75">
            <li>• Model downloads once (0.7 to 3.4 GB), then runs offline</li>
            <li>• About 1.4 to 4.7 GB of memory, depending on the model</li>
            <li>• {p.id === "desktop" ? "Node 20.11 or newer" : p.id === "web" ? "A browser with WebAssembly SIMD" : "React Native with llama.rn and react-native-fs"}</li>
          </ul>
        </div>
        <div className="min-w-0">
          <div className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-black/50">2 · CALL</div>
          <CodeBlock code={p.code} file={p.file} />
        </div>
      </div>
    </div>
  );
}

const tiers = ["All", "Phones", "Laptops", "Workstations"] as const;

export function ModelsExplorer() {
  const [tier, setTier] = useState<(typeof tiers)[number]>("All");
  const list = allModels.filter((m) => tier === "All" || m.tier === tier);
  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {tiers.map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            aria-pressed={t === tier}
            className={`px-5 py-3 text-[15px] font-semibold ${t === tier ? "bg-accent text-white" : "bg-black text-white hover:bg-accent/80"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <div key={m.id} className={`${card} flex flex-col p-6`}>
            <div className="flex items-baseline justify-between">
              <b className="font-mono text-[18px]">{m.id}</b>
              {m.status === "available" ? (
                <span className="text-xs font-semibold text-accent">{m.tier}</span>
              ) : (
                <span className="rounded-full border border-black/20 px-2.5 py-0.5 text-xs font-semibold text-black/60">In development</span>
              )}
            </div>
            <p className="mt-3 min-h-[44px] text-[14px] leading-[1.5] text-black/70">{m.best}</p>
            <dl className="mt-5 grid grid-cols-2 gap-y-3 border-t border-black/10 pt-4 text-[13px]">
              {[["Parameters", m.params], ["Download", m.size], ["Memory", m.ram], ["Speed", m.speed]].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-black/50">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 border-t border-black/10 pt-3 text-xs text-black/55">{m.platforms}</div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-[13px] text-black/55">Speeds are figures reported by others or estimates from public sources, not Zeroth benchmarks. They vary by device, quantisation and context length.</p>
    </div>
  );
}
