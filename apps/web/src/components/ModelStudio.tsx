"use client";

import { useMemo, useState, type FormEvent } from "react";
import { card, label } from "./styles";

type Repo = { id: string; downloads?: number; likes?: number; tags?: string[] };
type ModelFile = { rfilename: string; size?: number; lfs?: { size?: number; sha256?: string } };
type Detail = { id: string; tags?: string[]; cardData?: { license?: string }; siblings: ModelFile[] };

const api = "https://huggingface.co/api/models";
const formatSize = (n: number) => n >= 1024 ** 3 ? `${(n / 1024 ** 3).toFixed(2)} GB` : `${(n / 1024 ** 2).toFixed(0)} MB`;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function ModelStudio() {
  const [query, setQuery] = useState("small instruct GGUF");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repo, setRepo] = useState<Detail | null>(null);
  const [file, setFile] = useState<ModelFile | null>(null);
  const [name, setName] = useState("My local model");
  const [id, setId] = useState("my-local-model");
  const [system, setSystem] = useState("You are a helpful assistant. Be concise and accurate.");
  const [contextSize, setContextSize] = useState(4096);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const ggufs = useMemo(() => repo?.siblings.filter((f) => f.rfilename.toLowerCase().endsWith(".gguf") && !/-\d{5}-of-\d{5}/i.test(f.rfilename)) ?? [], [repo]);
  const bytes = file?.lfs?.size ?? file?.size ?? 0;
  const checksum = file?.lfs?.sha256 ?? "";
  const license = repo?.cardData?.license ?? repo?.tags?.find((tag) => tag.startsWith("license:"))?.slice(8) ?? "Check model card";
  const url = repo && file ? `https://huggingface.co/${repo.id}/resolve/main/${file.rfilename.split("/").map(encodeURIComponent).join("/")}` : "";
  const modelCode = repo && file ? `import path from "node:path";
import { createZeroth } from "@zeroth-ai/sdk";
import { catalog, createLlamaEngine } from "@zeroth-ai/sdk-node";

const customModel = {
  id: ${JSON.stringify(id)},
  kind: "chat",
  name: ${JSON.stringify(name)},
  params: "Custom GGUF",
  paramsB: 0,
  file: ${JSON.stringify(file.rfilename.split("/").at(-1))},
  url: ${JSON.stringify(url)},
  sha256: ${JSON.stringify(checksum)},
  sizeBytes: ${bytes},
  memoryBytes: ${Math.ceil(bytes * 1.35 + contextSize * 4096)},
  upstream: ${JSON.stringify(repo.id)},
  license: ${JSON.stringify(license)},
  localPath: path.resolve(process.cwd(), "models", ${JSON.stringify(file.rfilename.split("/").at(-1))}),
};

const engine = createLlamaEngine({ catalog: [...catalog, customModel], contextSize: ${contextSize} });
const ai = await createZeroth(engine).load(${JSON.stringify(id)});
const messages = [
  { role: "system", content: ${JSON.stringify(system)} },
  { role: "user", content: process.argv.slice(2).join(" ") || "Hello!" },
];
for await (const token of ai.chat(messages)) process.stdout.write(token);
await ai.unload();
` : "";

  async function search(event?: FormEvent) {
    event?.preventDefault();
    setBusy(true); setError(""); setRepos([]); setRepo(null); setFile(null);
    try {
      const params = new URLSearchParams({ search: query.trim() || "GGUF", filter: "gguf", sort: "downloads", direction: "-1", limit: "18" });
      const response = await fetch(`${api}?${params}`);
      if (!response.ok) throw new Error(`Hugging Face search returned ${response.status}.`);
      const data = await response.json() as Repo[];
      setRepos(data.filter((item) => item.id));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not search the model catalogue."); }
    finally { setBusy(false); }
  }

  async function chooseModel(item: Repo) {
    setBusy(true); setError(""); setRepo(null); setFile(null);
    try {
      const response = await fetch(`${api}/${item.id}?blobs=true`);
      if (!response.ok) throw new Error(`Could not load ${item.id} (${response.status}).`);
      const detail = await response.json() as Detail;
      const available = detail.siblings.filter((f) => f.rfilename.toLowerCase().endsWith(".gguf") && !f.rfilename.toLowerCase().includes("mmproj") && !/-\d{5}-of-\d{5}/i.test(f.rfilename));
      setRepo(detail);
      if (!available.length) setError("This repository has no single-file GGUF weights. Split GGUF models are not supported by this profile yet.");
      const best = available.find((f) => /q4_k_m|q4_0/i.test(f.rfilename)) ?? available[0];
      if (best) setFile(best);
      const baseName = item.id.split("/").at(-1) ?? "custom-model";
      setName(baseName); setId(slug(baseName));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load model files."); }
    finally { setBusy(false); }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(modelCode);
    setCopied(true); window.setTimeout(() => setCopied(false), 1600);
  }

  function downloadConfig() {
    const blob = new Blob([modelCode], { type: "text/javascript" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = objectUrl; anchor.download = `${id || "zeroth-model"}.mjs`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  return <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
    <div>
      <p className={label}>01 / FIND A BASE MODEL</p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight">Start with open weights.</h2>
      <p className="mt-3 max-w-lg text-[15px] leading-7 text-black/65">Search Hugging Face’s live GGUF catalogue. Pick a quantized file that fits your device; the Studio links to the original publisher for the download.</p>
      <form onSubmit={search} className="mt-6 flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search GGUF models" placeholder="Try: Qwen 3B, Gemma, Llama" className="min-w-0 flex-1 border border-black/20 bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
        <button disabled={busy} className="bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-accent disabled:opacity-50">{busy ? "Loading…" : "Search"}</button>
      </form>
      {error && <p role="alert" className="mt-4 border-l-2 border-red-500 pl-3 text-sm text-red-700">{error}</p>}
      {repos.length > 0 && <div className="mt-5 max-h-[440px] space-y-2 overflow-y-auto pr-1">
        {repos.map((item) => <button key={item.id} onClick={() => void chooseModel(item)} className={`w-full border p-4 text-left transition-colors ${repo?.id === item.id ? "border-accent bg-accent/5" : "border-black/10 bg-white hover:border-black/40"}`}>
          <span className="block break-all font-mono text-[13px] font-semibold">{item.id}</span>
          <span className="mt-2 flex gap-4 text-xs text-black/55"><span>↓ {Intl.NumberFormat().format(item.downloads ?? 0)}</span><span>♥ {Intl.NumberFormat().format(item.likes ?? 0)}</span></span>
        </button>)}
      </div>}
      {!repos.length && !busy && !error && <div className={`${card} mt-5 p-5 text-sm leading-6 text-black/60`}>Search results come from Hugging Face at request time. Model owners control files and licenses; inspect the model card before using weights.</div>}
    </div>

    <div>
      <p className={label}>02 / SHAPE YOUR MODEL</p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight">Make a local assistant your own.</h2>
      {repo && <div className={`${card} mt-6 p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0"><p className={label}>SELECTED REPOSITORY</p><p className="mt-2 break-all font-mono text-sm font-semibold">{repo.id}</p></div>
          <a href={`https://huggingface.co/${repo.id}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-accent underline">Model card ↗</a>
        </div>
        {ggufs.length > 0 && <label className="mt-5 block text-xs font-semibold text-black/60">GGUF FILE
          <select value={file?.rfilename ?? ""} onChange={(e) => setFile(ggufs.find((f) => f.rfilename === e.target.value) ?? null)} className="mt-2 block w-full border border-black/20 bg-white px-3 py-3 font-mono text-xs text-black">
            {ggufs.filter((f) => !f.rfilename.toLowerCase().includes("mmproj")).map((f) => { const size = f.lfs?.size ?? f.size ?? 0; return <option key={f.rfilename} value={f.rfilename}>{f.rfilename} · {size ? formatSize(size) : "size unavailable"}</option>; })}
          </select>
        </label>}
        {file && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
          <span className="text-xs text-black/55">{bytes ? formatSize(bytes) : "Size unknown"} · {license}</span>
          <a href={url} target="_blank" rel="noreferrer" className="bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">Download weights ↗</a>
        </div>}
      </div>}
      <div className={`${card} mt-5 grid gap-4 p-5 sm:grid-cols-2`}>
        <label className="text-xs font-semibold text-black/60">DISPLAY NAME<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 block w-full border border-black/20 px-3 py-3 text-sm text-black outline-none focus:border-accent" /></label>
        <label className="text-xs font-semibold text-black/60">MODEL ID<input value={id} onChange={(e) => setId(slug(e.target.value))} className="mt-2 block w-full border border-black/20 px-3 py-3 font-mono text-sm text-black outline-none focus:border-accent" /></label>
        <label className="text-xs font-semibold text-black/60 sm:col-span-2">CONTEXT WINDOW
          <select value={contextSize} onChange={(e) => setContextSize(Number(e.target.value))} className="mt-2 block w-full border border-black/20 bg-white px-3 py-3 text-sm text-black sm:max-w-[240px]">
            {[2048, 4096, 8192, 16384, 32768].map((size) => <option key={size} value={size}>{Intl.NumberFormat().format(size)} tokens</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-black/60 sm:col-span-2">SYSTEM INSTRUCTIONS<textarea value={system} onChange={(e) => setSystem(e.target.value)} rows={4} className="mt-2 block w-full resize-y border border-black/20 px-3 py-3 text-sm leading-6 text-black outline-none focus:border-accent" /></label>
      </div>
      {repo && file ? <div className="mt-5 overflow-hidden border border-black bg-[#0d0d10] text-white">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><span className="font-mono text-xs text-white/55">run-model.mjs</span><button onClick={() => void copyCode()} className="text-xs font-semibold text-white/80 hover:text-white">{copied ? "Copied" : "Copy"}</button></div>
        <p className="border-b border-white/10 px-4 py-3 text-xs leading-5 text-white/60">Download the GGUF, put it in your project’s <code className="text-white">models/</code> folder, then save and run this file. The SDK checks the file size and SHA-256 before loading.</p>
        <pre className="max-h-[310px] overflow-auto p-4 text-[11px] leading-[1.65] text-white/80"><code>{modelCode}</code></pre>
        <div className="flex flex-wrap gap-3 border-t border-white/10 p-4"><button onClick={downloadConfig} className="bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-accent hover:text-white">Download config</button><a href="https://huggingface.co/docs/hub/en/models-downloading" target="_blank" rel="noreferrer" className="px-2 py-2.5 text-sm text-white/65 underline">Download help ↗</a></div>
      </div> : <div className={`${card} mt-5 flex min-h-44 items-center justify-center p-6 text-center text-sm leading-6 text-black/55`}>Choose a model result to get its GGUF files, direct download, and ready-to-run Zeroth config.</div>}
    </div>
  </div>;
}
