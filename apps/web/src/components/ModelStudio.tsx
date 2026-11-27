"use client";

import { useMemo, useState, type FormEvent } from "react";
import { card, label } from "./styles";

type Repo = { id: string; downloads?: number; likes?: number; tags?: string[] };
type ModelFile = { rfilename: string; size?: number; lfs?: { size?: number; sha256?: string } };
type Detail = { id: string; tags?: string[]; cardData?: { license?: string }; siblings: ModelFile[] };

const api = "https://huggingface.co/api/models";
const SUPPORT_MODEL_CARD = "https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF";
const SUPPORT_MODEL_FILE = "https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF/resolve/main/LFM2.5-1.2B-Instruct-Q4_K_M.gguf";
const formatSize = (n: number) => n >= 1024 ** 3 ? `${(n / 1024 ** 3).toFixed(2)} GB` : `${(n / 1024 ** 2).toFixed(0)} MB`;
const estimatedRam = (bytes: number, context: number) => Math.ceil(bytes * 1.35 + context * 4096);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const supportInstructions = "You are a first-line customer-support assistant. Be warm, concise, and clear. Use only the supplied support policy; do not invent fees, refund eligibility, timelines, order status, or account actions. If policy does not answer, say you do not know and direct the customer to the official support channel in the policy. Never request or repeat passwords, one-time codes, PINs, full card numbers, or full account numbers. Never claim you completed an action.";
const samplePolicy = "DEMO POLICY FOR A FICTIONAL STORE — replace before serving real customers. Password reset: send customers to https://support.example.com/reset. Refunds: a human agent must review the order; never promise eligibility or timing. Human support: email support@example.com.";

export function ModelStudio() {
  const [query, setQuery] = useState("Qwen2.5-1.5B-Instruct GGUF");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repo, setRepo] = useState<Detail | null>(null);
  const [file, setFile] = useState<ModelFile | null>(null);
  const [name, setName] = useState("My local model");
  const [id, setId] = useState("my-local-model");
  const [system, setSystem] = useState("You are a helpful assistant. Be concise and accurate.");
  const [contextSize, setContextSize] = useState(4096);
  const [maxModelGB, setMaxModelGB] = useState(4);
  const [maxRamGB, setMaxRamGB] = useState(8);
  const [customerSupport, setCustomerSupport] = useState(false);
  const [builtInSupportModel, setBuiltInSupportModel] = useState(false);
  const [supportKnowledge, setSupportKnowledge] = useState(samplePolicy);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const singleFileGgufs = useMemo(() => repo?.siblings.filter((f) => f.rfilename.toLowerCase().endsWith(".gguf") && !f.rfilename.toLowerCase().includes("mmproj") && !/-\d{5}-of-\d{5}/i.test(f.rfilename)) ?? [], [repo]);
  const ggufs = useMemo(() => singleFileGgufs.filter((f) => {
    const size = f.lfs?.size ?? f.size ?? Infinity;
    return size <= maxModelGB * 1024 ** 3 && estimatedRam(size, contextSize) <= maxRamGB * 1024 ** 3;
  }), [singleFileGgufs, maxModelGB, maxRamGB, contextSize]);
  const bytes = file?.lfs?.size ?? file?.size ?? 0;
  const checksum = file?.lfs?.sha256 ?? "";
  const license = repo?.cardData?.license ?? repo?.tags?.find((tag) => tag.startsWith("license:"))?.slice(8) ?? "Check model card";
  const url = repo && file ? `https://huggingface.co/${repo.id}/resolve/main/${file.rfilename.split("/").map(encodeURIComponent).join("/")}` : "";
  const policyPrompt = `${supportInstructions}\n\nAPPROVED SUPPORT KNOWLEDGE (replace the sample with your verified policy):\n${supportKnowledge}`;
  const supportCode = `// Install once: npm install @zeroth-ai/sdk-node
import { zeroth } from "@zeroth-ai/sdk-node";

const ai = await zeroth.load("lfm-1b");
const messages = [
  { role: "system", content: ${JSON.stringify(policyPrompt)} },
  { role: "user", content: process.argv.slice(2).join(" ") || "How do I reset my password?" },
];
process.stdout.write(await ai.complete(messages, { temperature: 0.2, maxTokens: 320 }));
process.stdout.write("\\n");
await ai.unload();
`;
  const customModelCode = repo && file ? `// Install once: npm install @zeroth-ai/sdk @zeroth-ai/sdk-node
import path from "node:path";
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
  { role: "system", content: ${JSON.stringify(customerSupport ? policyPrompt : system)} },
  { role: "user", content: process.argv.slice(2).join(" ") || "Hello!" },
];
process.stdout.write(await ai.complete(messages, { temperature: ${customerSupport ? 0.2 : 0.7}, maxTokens: ${customerSupport ? 320 : 512} }));
process.stdout.write("\\n");
await ai.unload();
` : "";
  const modelCode = builtInSupportModel ? supportCode : customModelCode;

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
    setCustomerSupport(false);
    setBuiltInSupportModel(false);
    try {
      const response = await fetch(`${api}/${item.id}?blobs=true`);
      if (!response.ok) throw new Error(`Could not load ${item.id} (${response.status}).`);
      const detail = await response.json() as Detail;
      const allSingle = detail.siblings.filter((f) => f.rfilename.toLowerCase().endsWith(".gguf") && !f.rfilename.toLowerCase().includes("mmproj") && !/-\d{5}-of-\d{5}/i.test(f.rfilename));
      const available = allSingle.filter((f) => {
        const size = f.lfs?.size ?? f.size ?? Infinity;
        return size <= maxModelGB * 1024 ** 3 && estimatedRam(size, contextSize) <= maxRamGB * 1024 ** 3;
      });
      setRepo(detail);
      if (!allSingle.length) setError("This repository has no single-file GGUF weights. Split GGUF models are not supported by this profile yet.");
      else if (!available.length) setError(`No single-file GGUF fits the current ${maxModelGB} GB download and ${maxRamGB} GB memory limits. Increase a limit or choose a smaller model.`);
      const best = available.find((f) => /q4_k_m/i.test(f.rfilename)) ?? available.find((f) => /q4_k_s|q4_0/i.test(f.rfilename)) ?? [...available].sort((a, b) => (a.lfs?.size ?? a.size ?? Infinity) - (b.lfs?.size ?? b.size ?? Infinity))[0];
      if (best) setFile(best);
      const baseName = item.id.split("/").at(-1) ?? "custom-model";
      setName(baseName); setId(slug(baseName));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load model files."); }
    finally { setBusy(false); }
  }

  async function chooseSupportStarter() {
    setMaxModelGB(4);
    setRepo(null);
    setFile(null);
    setBuiltInSupportModel(true);
    setCustomerSupport(true);
    setName("Customer Support Assistant");
    setId("customer-support-assistant");
    setSystem(supportInstructions);
    setSupportKnowledge(samplePolicy);
    setContextSize(4096);
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

  return <div className="grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
    <div className="min-w-0">
      <p className={label}>01 / FIND A BASE MODEL</p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight">Start with open weights.</h2>
      <p className="mt-3 max-w-lg text-[15px] leading-7 text-black/65">Search Hugging Face’s live GGUF catalogue. Downloads are filtered by file size and estimated RAM, so very large models stay out of the starter path.</p>
      <form onSubmit={search} className="mt-6 flex min-w-0 gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search GGUF models" placeholder="Try: Qwen 3B, Gemma, Llama" className="min-w-0 flex-1 border border-black/20 bg-white px-4 py-3 text-sm outline-none focus:border-accent" />
        <button disabled={busy} className="shrink-0 bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-accent disabled:opacity-50 sm:px-5">{busy ? "Loading…" : "Search"}</button>
      </form>
      <div className="mt-4 border border-accent/30 bg-white p-4">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-accent">READY-MADE CUSTOMER SUPPORT STARTER</p>
        <p className="mt-2 text-sm leading-6 text-black/65">Start with Zeroth’s verified 1.2B instruction model (~0.7 GB), tested with password-reset and refund-support questions. The form includes an obviously fictional demo policy to replace.</p>
        <button type="button" onClick={chooseSupportStarter} className="mt-3 bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">Load tested support starter</button>
      </div>
      <label className="mt-5 block text-xs font-semibold text-black/60">MAXIMUM MODEL DOWNLOAD
        <select value={maxModelGB} onChange={(e) => { const limit = Number(e.target.value); setMaxModelGB(limit); const size = file?.lfs?.size ?? file?.size ?? Infinity; if (file && (size > limit * 1024 ** 3 || estimatedRam(size, contextSize) > maxRamGB * 1024 ** 3)) setFile(null); }} className="mt-2 block w-full border border-black/20 bg-white px-3 py-3 text-sm text-black sm:max-w-[280px]">
          {[2, 4, 8, 16, 64].map((size) => <option key={size} value={size}>{size === 64 ? "Show all (64 GB)" : `Up to ${size} GB`}</option>)}
        </select>
      </label>
      <label className="mt-4 block text-xs font-semibold text-black/60">AVAILABLE SYSTEM MEMORY
        <select value={maxRamGB} onChange={(e) => { const limit = Number(e.target.value); setMaxRamGB(limit); const size = file?.lfs?.size ?? file?.size ?? Infinity; if (file && estimatedRam(size, contextSize) > limit * 1024 ** 3) setFile(null); }} className="mt-2 block w-full border border-black/20 bg-white px-3 py-3 text-sm text-black sm:max-w-[280px]">
          {[4, 8, 16, 32, 64].map((size) => <option key={size} value={size}>{size} GB RAM</option>)}
        </select>
      </label>
      {error && <p role="alert" className="mt-4 border-l-2 border-red-500 pl-3 text-sm text-red-700">{error}</p>}
      {repos.length > 0 && <div className="mt-5 max-h-[440px] space-y-2 overflow-y-auto pr-1">
        {repos.map((item) => <button key={item.id} onClick={() => void chooseModel(item)} className={`w-full border p-4 text-left transition-colors ${repo?.id === item.id ? "border-accent bg-accent/5" : "border-black/10 bg-white hover:border-black/40"}`}>
          <span className="block break-all font-mono text-[13px] font-semibold">{item.id}</span>
          <span className="mt-2 flex gap-4 text-xs text-black/55"><span>↓ {Intl.NumberFormat().format(item.downloads ?? 0)}</span><span>♥ {Intl.NumberFormat().format(item.likes ?? 0)}</span></span>
        </button>)}
      </div>}
      {!repos.length && !busy && !error && <div className={`${card} mt-5 p-5 text-sm leading-6 text-black/60`}>Search results come from Hugging Face at request time. Model owners control files and licenses; inspect the model card before using weights.</div>}
    </div>

    <div className="min-w-0">
      <p className={label}>02 / SHAPE YOUR MODEL</p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight">Make a local assistant your own.</h2>
      {builtInSupportModel && <div className={`${card} mt-6 p-5`}>
        <p className={label}>TESTED BUILT-IN MODEL</p>
        <p className="mt-2 break-words font-mono text-sm font-semibold">LFM2.5 1.2B Instruct · Q4_K_M</p>
        <p className="mt-2 text-xs leading-5 text-black/60">~0.7 GB download · first run fetches and SHA-256 verifies the model through the Node SDK.</p>
        <a href={SUPPORT_MODEL_CARD} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-accent underline">Model card ↗</a>
      </div>}
      {repo && <div className={`${card} mt-6 p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0"><p className={label}>SELECTED REPOSITORY</p><p className="mt-2 break-all font-mono text-sm font-semibold">{repo.id}</p></div>
          <a href={`https://huggingface.co/${repo.id}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-accent underline">Model card ↗</a>
        </div>
        {ggufs.length > 0 && <label className="mt-5 block text-xs font-semibold text-black/60">GGUF FILE · UP TO {maxModelGB} GB DOWNLOAD / {maxRamGB} GB RAM
          <select value={file?.rfilename ?? ""} onChange={(e) => setFile(ggufs.find((f) => f.rfilename === e.target.value) ?? null)} className="mt-2 block w-full border border-black/20 bg-white px-3 py-3 font-mono text-xs text-black">
            {ggufs.map((f) => { const size = f.lfs?.size ?? f.size ?? 0; return <option key={f.rfilename} value={f.rfilename}>{f.rfilename} · {size ? `${formatSize(size)} · ~${formatSize(estimatedRam(size, contextSize))} RAM` : "size unavailable"}</option>; })}
          </select>
        </label>}
        {ggufs.length === 0 && <p className="mt-4 text-sm text-black/60">No single-file GGUF fits the current size limit. Raise it or choose a smaller model.</p>}
        {file && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
          <span className="text-xs text-black/55">{bytes ? formatSize(bytes) : "Size unknown"} · {license}</span>
          <a href={url} target="_blank" rel="noreferrer" className="bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">Download weights ↗</a>
        </div>}
      </div>}
      <div className={`${card} mt-5 grid gap-4 p-5 sm:grid-cols-2`}>
        <label className="text-xs font-semibold text-black/60">{customerSupport ? "PROFILE NAME" : "DISPLAY NAME"}<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 block w-full border border-black/20 px-3 py-3 text-sm text-black outline-none focus:border-accent" /></label>
        {!builtInSupportModel && <label className="text-xs font-semibold text-black/60">MODEL ID<input value={id} onChange={(e) => setId(slug(e.target.value))} className="mt-2 block w-full border border-black/20 px-3 py-3 font-mono text-sm text-black outline-none focus:border-accent" /></label>}
        <label className="text-xs font-semibold text-black/60 sm:col-span-2">CONTEXT WINDOW
          <select value={contextSize} onChange={(e) => { const context = Number(e.target.value); setContextSize(context); const size = file?.lfs?.size ?? file?.size ?? Infinity; if (file && estimatedRam(size, context) > maxRamGB * 1024 ** 3) setFile(null); }} className="mt-2 block w-full border border-black/20 bg-white px-3 py-3 text-sm text-black sm:max-w-[240px]">
            {[2048, 4096, 8192, 16384, 32768].map((size) => <option key={size} value={size}>{Intl.NumberFormat().format(size)} tokens</option>)}
          </select>
        </label>
        {!customerSupport && <label className="text-xs font-semibold text-black/60 sm:col-span-2">SYSTEM INSTRUCTIONS<textarea value={system} onChange={(e) => setSystem(e.target.value)} rows={4} className="mt-2 block w-full resize-y border border-black/20 px-3 py-3 text-sm leading-6 text-black outline-none focus:border-accent" /></label>}
        {customerSupport && <label className="text-xs font-semibold text-black/60 sm:col-span-2">DEMO POLICY / YOUR APPROVED SUPPORT FAQ<textarea value={supportKnowledge} onChange={(e) => setSupportKnowledge(e.target.value)} rows={7} className="mt-2 block w-full resize-y border border-black/20 px-3 py-3 text-sm leading-6 text-black outline-none focus:border-accent" /></label>}
      </div>
      {(repo && file || builtInSupportModel) ? <div className="mt-5 min-w-0 overflow-hidden border border-black bg-[#0d0d10] text-white">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><span className="font-mono text-xs text-white/55">run-model.mjs</span><button onClick={() => void copyCode()} className="text-xs font-semibold text-white/80 hover:text-white">{copied ? "Copied" : "Copy"}</button></div>
        <p className="border-b border-white/10 px-4 py-3 text-xs leading-5 text-white/60">{builtInSupportModel ? "Run the install command in the script comment, save this as run-support.mjs, then run it. The SDK downloads and verifies the model on first use." : "Run the install command in the script comment, download the GGUF into your project’s models/ folder, then run this file. The SDK checks file size and SHA-256 before loading."}{customerSupport ? " Replace the fictional demo policy with approved support content before handling real customers." : ""}</p>
        <pre className="max-h-[310px] overflow-auto p-4 text-[11px] leading-[1.65] text-white/80"><code>{modelCode}</code></pre>
        <div className="flex flex-wrap gap-3 border-t border-white/10 p-4"><button onClick={downloadConfig} className="bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-accent hover:text-white">Download config</button>{builtInSupportModel && <a href={SUPPORT_MODEL_FILE} target="_blank" rel="noreferrer" className="px-2 py-2.5 text-sm text-white/65 underline">Download model ↗</a>}{!builtInSupportModel && <a href="https://huggingface.co/docs/hub/en/models-downloading" target="_blank" rel="noreferrer" className="px-2 py-2.5 text-sm text-white/65 underline">Download help ↗</a>}</div>
      </div> : <div className={`${card} mt-5 flex min-h-44 items-center justify-center p-6 text-center text-sm leading-6 text-black/55`}>Choose a model result to get its GGUF files, direct download, and ready-to-run Zeroth config.</div>}
    </div>
  </div>;
}
