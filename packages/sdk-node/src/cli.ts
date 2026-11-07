#!/usr/bin/env node
import readline from "node:readline/promises";
import { ZerothError, type Message, type ModelId } from "@zeroth-ai/sdk";
import { llamaEngine, zeroth } from "./index.js";
import { memoryBudget } from "./probe.js";
import { selectModel } from "./select.js";

const tty = process.stderr.isTTY && !process.env.NO_COLOR;
const c = (code: number) => (s: string) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const dim = c(2);
const bold = c(1);
const green = c(32);
const red = c(31);
const cyan = c(36);

const GB = 1024 ** 3;
const gb = (b: number) => `${(b / GB).toFixed(1)} GB`;

const HELP = `${bold("zeroth")}: run AI models on this device

${bold("Usage")}
  zeroth models                      Show this machine and which models fit
  zeroth pull [model]                Download and verify a model (default: auto)
  zeroth run "<prompt>" [options]    One answer, streamed
  zeroth chat [options]              Interactive chat
  zeroth clear-cache                 Delete downloaded models

${bold("Options")}
  --model <id|auto>      lfm-1b, lfm3-1.7b, granite-3b, gemma-e2b (default: auto)
  --prefer <quality|speed|battery>
  --max-tokens <n>
  --json '<schema>'      Answer as JSON matching this JSON Schema (run only)
  --system "<text>"      System prompt

${dim("Models are stored in " + llamaEngine.cacheDir + " (override with ZEROTH_HOME).")}
`;

function parse(argv: string[]) {
  const flags: Record<string, string> = {};
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith("--")) flags[a.slice(2)] = argv[++i] ?? "";
    else rest.push(a);
  }
  return { flags, rest };
}

function progressBar(label: string) {
  let last = -1;
  return (fraction: number) => {
    const pct = Math.floor(fraction * 100);
    if (pct === last) return;
    last = pct;
    const w = 28;
    const filled = Math.round(fraction * w);
    process.stderr.write(`\r${label} ${"█".repeat(filled)}${dim("░".repeat(w - filled))} ${String(pct).padStart(3)}%`);
    if (fraction >= 1) process.stderr.write("\n");
  };
}

async function load(flags: Record<string, string>) {
  const model = (flags.model || "auto") as ModelId | "auto";
  const prefer = flags.prefer as "quality" | "speed" | "battery" | undefined;
  const info = await llamaEngine.resolve({ model, prefer });
  const entry = llamaEngine.catalog.find((e) => e.id === info.id)!;
  const cached = await llamaEngine.isCached(entry);
  if (!cached) process.stderr.write(`${dim(`Downloading ${info.name} (${(info.sizeMB / 1000).toFixed(1)} GB, first run only)`)}\n`);
  const bar = progressBar(dim(info.name));
  const t0 = Date.now();
  const ai = await zeroth.load({ model: info.id, prefer, onProgress: cached ? undefined : bar });
  process.stderr.write(`${dim(`Loaded ${info.name} in ${((Date.now() - t0) / 1000).toFixed(1)}s`)}\n\n`);
  return ai;
}

async function cmdModels() {
  const hw = await llamaEngine.hardware();
  const budget = memoryBudget(hw);
  console.log(`${bold("This machine")}`);
  console.log(`  ${hw.platform}/${hw.arch}, ${hw.cpuCount} cores, ${gb(hw.totalMemBytes)} RAM, accelerator: ${hw.gpu || "none (CPU)"}`);
  console.log(`  Model memory budget: ${gb(budget)}\n`);

  const auto = selectModel({ catalog: llamaEngine.catalog, budgetBytes: budget, totalMemBytes: hw.totalMemBytes, options: {} });
  console.log(`${bold("Model".padEnd(10))}${"Params".padEnd(8)}${"Download".padEnd(10)}${"Memory".padEnd(9)}${"Fits".padEnd(6)}Cached`);
  for (const e of llamaEngine.catalog) {
    const fits = e.memoryBytes <= budget;
    const cached = await llamaEngine.isCached(e);
    const row = `${e.id.padEnd(10)}${e.params.padEnd(8)}${gb(e.sizeBytes).padEnd(10)}${gb(e.memoryBytes).padEnd(9)}${(fits ? "yes" : "no").padEnd(6)}${cached ? "yes" : "-"}`;
    console.log(e.id === auto.id ? `${green(row)}  ${green("← auto")}` : fits ? row : dim(row));
  }
  console.log(`\n${dim("Open-weight models, quantised to 4-bit. See each model's license upstream.")}`);
}

async function cmdPull(rest: string[]) {
  const req = (rest[0] || "auto") as ModelId | "auto";
  const info = await llamaEngine.resolve({ model: req });
  const entry = llamaEngine.catalog.find((e) => e.id === info.id)!;
  if (await llamaEngine.isCached(entry)) return console.log(`${info.name} is already downloaded and verified.`);
  console.log(`Pulling ${bold(info.name)} (${gb(entry.sizeBytes)}) from ${new URL(entry.url).host}`);
  const bar = progressBar(info.name);
  await llamaEngine.ensureModel(entry, { onProgress: (d, t) => bar(d / t) });
  console.log(green("Verified (SHA-256) ✓"));
}

async function cmdRun(rest: string[], flags: Record<string, string>) {
  const prompt = rest.join(" ").trim();
  if (!prompt) throw new Error('Give me a prompt: zeroth run "your question"');
  const ai = await load(flags);
  const messages: Message[] = [];
  if (flags.system) messages.push({ role: "system", content: flags.system });
  messages.push({ role: "user", content: prompt });
  const maxTokens = flags["max-tokens"] ? Number(flags["max-tokens"]) : undefined;

  try {
    if (flags.json) {
      const value = await ai.json(messages, JSON.parse(flags.json), { maxTokens });
      console.log(JSON.stringify(value, null, 2));
      return;
    }
    let n = 0;
    const t0 = Date.now();
    for await (const token of ai.chat(messages, { maxTokens })) {
      process.stdout.write(token);
      n++;
    }
    const secs = (Date.now() - t0) / 1000;
    process.stdout.write("\n");
    process.stderr.write(`\n${dim(`${ai.model.name} · ${n} chunks · ${(n / secs).toFixed(1)}/s`)}\n`);
  } finally {
    await ai.unload();
  }
}

async function cmdChat(flags: Record<string, string>) {
  const ai = await load(flags);
  const history: Message[] = [];
  if (flags.system) history.push({ role: "system", content: flags.system });
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log(dim(`Chatting with ${ai.model.name}, fully offline. Type /exit to quit, /reset to start over.\n`));
  rl.on("SIGINT", () => rl.close());
  try {
    for (;;) {
      const line = (await rl.question(cyan("you › "))).trim();
      if (!line) continue;
      if (line === "/exit" || line === "/quit") break;
      if (line === "/reset") {
        history.length = flags.system ? 1 : 0;
        console.log(dim("History cleared."));
        continue;
      }
      history.push({ role: "user", content: line });
      let reply = "";
      process.stdout.write(green("ai  › "));
      for await (const token of ai.chat(history)) {
        process.stdout.write(token);
        reply += token;
      }
      process.stdout.write("\n\n");
      history.push({ role: "assistant", content: reply });
    }
  } catch (e) {
    if ((e as { code?: string }).code !== "ERR_USE_AFTER_CLOSE") throw e;
  } finally {
    rl.close();
    await ai.unload();
  }
}

async function main() {
  const [cmd, ...argv] = process.argv.slice(2);
  const { flags, rest } = parse(argv);
  switch (cmd) {
    case "models":
      return cmdModels();
    case "pull":
      return cmdPull(rest);
    case "run":
      return cmdRun(rest, flags);
    case "chat":
      return cmdChat(flags);
    case "clear-cache":
      await llamaEngine.clearCache?.();
      return console.log("Deleted downloaded models.");
    case undefined:
    case "help":
    case "--help":
      return console.log(HELP);
    default:
      console.error(`Unknown command "${cmd}".\n`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

main().then(
  () => process.exit(process.exitCode ?? 0),
  (err: unknown) => {
    const e = err as Error;
    console.error(red(`\n${e instanceof ZerothError ? e.code + ": " : ""}${e.message}`));
    process.exit(1);
  },
);
