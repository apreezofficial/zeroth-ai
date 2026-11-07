import fs from "node:fs/promises";
import path from "node:path";
import {
  ZerothError,
  type Engine,
  type EngineGenerateOptions,
  type LoadedModel,
  type LoadOptions,
  type Message,
  type ModelInfo,
} from "@zeroth-ai/sdk";
import {
  defineChatSessionFunction,
  getLlama,
  LlamaChatSession,
  LlamaLogLevel,
  type ChatHistoryItem,
  type Llama,
  type LlamaModel,
} from "node-llama-cpp";
import { catalog as defaultCatalog, type CatalogEntry } from "./catalog.js";
import { downloadVerified, isDownloaded } from "./download.js";
import { defaultCacheDir } from "./paths.js";
import { memoryBudget, probeHardware, type Hardware } from "./probe.js";
import { selectModel } from "./select.js";

export interface LlamaEngineOptions {
  /** Where models are stored. Default: see defaultCacheDir(). */
  cacheDir?: string;
  /** Replace the built-in model catalogue (mostly for tests). */
  catalog?: readonly CatalogEntry[];
  /** Tokens of context per conversation. Default 4096. */
  contextSize?: number;
  /** Custom fetch for downloads (mostly for tests). */
  fetch?: typeof fetch;
  /** Bring your own llama.cpp instance (mostly for tests). */
  llama?: () => Promise<Llama>;
}

export interface LlamaEngine extends Engine {
  readonly cacheDir: string;
  readonly catalog: readonly CatalogEntry[];
  hardware(): Promise<Hardware>;
  isCached(entry: CatalogEntry): Promise<boolean>;
  /** Download (if needed) and verify a model, returning its path on disk. */
  ensureModel(
    entry: CatalogEntry,
    opts?: { onProgress?: (done: number, total: number) => void; signal?: AbortSignal },
  ): Promise<string>;
}

const toInfo = (e: CatalogEntry): ModelInfo => ({
  id: e.id,
  name: e.name,
  params: e.params,
  sizeMB: Math.round(e.sizeBytes / 1_000_000),
});

/** Splits our message list into node-llama-cpp history plus the final user prompt. */
export function toChatHistory(messages: Message[]): { history: ChatHistoryItem[]; prompt: string } {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const turns: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of messages) {
    if (m.role === "system") continue;
    const prev = turns[turns.length - 1];
    if (prev && prev.role === m.role) prev.content += `\n\n${m.content}`;
    else turns.push({ role: m.role, content: m.content });
  }

  const last = turns[turns.length - 1];
  if (!last || last.role !== "user") throw new TypeError("The last message must come from the user.");

  const history: ChatHistoryItem[] = [];
  if (system) history.push({ type: "system", text: system });
  for (const t of turns.slice(0, -1)) {
    history.push(t.role === "user" ? { type: "user", text: t.content } : { type: "model", response: [t.content] });
  }
  return { history, prompt: last.content };
}

/** One generation at a time per model: a context sequence cannot be shared. */
class Mutex {
  #tail: Promise<void> = Promise.resolve();
  lock(): Promise<() => void> {
    let release!: () => void;
    const next = new Promise<void>((r) => (release = r));
    const acquired = this.#tail.then(() => release);
    this.#tail = this.#tail.then(() => next);
    return acquired;
  }
}

export function createLlamaEngine(options: LlamaEngineOptions = {}): LlamaEngine {
  const cacheDir = options.cacheDir ?? defaultCacheDir();
  const entries = options.catalog ?? defaultCatalog;
  const contextSize = options.contextSize ?? 4096;
  const doFetch = options.fetch ?? fetch;

  let llamaPromise: Promise<Llama> | undefined;
  const getRuntime = () =>
    (llamaPromise ??= (options.llama ?? (() => getLlama({ logLevel: LlamaLogLevel.error, progressLogs: false })))());

  const modelPath = (e: CatalogEntry) => path.join(cacheDir, "models", e.file);
  const isCached = (e: CatalogEntry) => isDownloaded(modelPath(e), e.sizeBytes);

  const ensureModel: LlamaEngine["ensureModel"] = async (entry, opts = {}) => {
    const dest = modelPath(entry);
    if (!(await isDownloaded(dest, entry.sizeBytes))) {
      await downloadVerified({
        url: entry.url,
        dest,
        sizeBytes: entry.sizeBytes,
        sha256: entry.sha256,
        onProgress: opts.onProgress,
        signal: opts.signal,
        fetchImpl: doFetch,
      });
    }
    return dest;
  };

  async function openModel(llama: Llama, file: string, name: string): Promise<LlamaModel> {
    try {
      return await llama.loadModel({ modelPath: file });
    } catch (cause) {
      const msg = (cause as Error).message ?? String(cause);
      if (/memory|alloc|vram/i.test(msg)) {
        throw new ZerothError("INSUFFICIENT_MEMORY", `Not enough memory to load ${name}: ${msg}`, { cause });
      }
      throw cause;
    }
  }

  return {
    name: "llama.cpp",
    cacheDir,
    catalog: entries,
    isCached,

    async hardware() {
      return probeHardware(await getRuntime());
    },

    ensureModel,

    async resolve(opts: LoadOptions): Promise<ModelInfo> {
      const hw = await probeHardware(await getRuntime());
      const cached = new Set<string>();
      await Promise.all(entries.map(async (e) => (await isCached(e)) && cached.add(e.id)));
      const entry = selectModel({
        catalog: entries,
        budgetBytes: memoryBudget(hw),
        totalMemBytes: hw.totalMemBytes,
        options: opts,
        isCached: (e) => cached.has(e.id),
      });
      return toInfo(entry);
    },

    async load(info: ModelInfo, opts: LoadOptions): Promise<LoadedModel> {
      const entry = entries.find((e) => e.id === info.id);
      if (!entry) throw new ZerothError("MODEL_UNAVAILABLE", `Unknown model "${info.id}".`);

      const wasCached = await isCached(entry);
      const file = await ensureModel(entry, {
        signal: opts.signal,
        onProgress: (done, total) => opts.onProgress?.(done / total),
      });
      if (wasCached) opts.onProgress?.(1);

      const llama = await getRuntime();
      const model = await openModel(llama, file, entry.name);

      if (entry.kind === "embedding") {
        const embedder = await model.createEmbeddingContext();
        return {
          generate: () => {
            throw new ZerothError("MODEL_UNAVAILABLE", `${entry.id} is an embedding model and cannot generate text.`);
          },
          async embed(texts) {
            const out: number[][] = [];
            for (const t of texts) out.push([...(await embedder.getEmbeddingFor(t)).vector]);
            return out;
          },
          async dispose() {
            await embedder.dispose();
            await model.dispose();
          },
        };
      }

      const context = await model.createContext({ contextSize });
      const sequence = context.getSequence();
      const mutex = new Mutex();

      // Embeddings come from a small dedicated model, loaded on first use.
      let embedder: Awaited<ReturnType<LlamaModel["createEmbeddingContext"]>> | undefined;
      let embedModel: LlamaModel | undefined;
      const getEmbedder = async () => {
        if (embedder) return embedder;
        const e = entries.find((x) => x.kind === "embedding");
        if (!e) throw new ZerothError("MODEL_UNAVAILABLE", "No embedding model is available.");
        const embedFile = await ensureModel(e, { signal: opts.signal });
        embedModel = await openModel(llama, embedFile, e.name);
        return (embedder = await embedModel.createEmbeddingContext());
      };

      return {
        async *generate(messages: Message[], gen: EngineGenerateOptions) {
          const { history, prompt } = toChatHistory(messages);
          if (gen.signal?.aborted) return;

          const release = await mutex.lock();
          const ctl = new AbortController();
          const onAbort = () => ctl.abort(gen.signal?.reason);
          gen.signal?.addEventListener("abort", onAbort, { once: true });

          const queue: string[] = [];
          let finished = false;
          let failure: unknown;
          let notify: (() => void) | undefined;
          const poke = () => {
            notify?.();
            notify = undefined;
          };

          let session: LlamaChatSession | undefined;
          let run: Promise<void> = Promise.resolve();
          try {
            // Each call re-evaluates its full history, so state never leaks between calls.
            await sequence.clearHistory();
            session = new LlamaChatSession({ contextSequence: sequence, autoDisposeSequence: false });
            if (history.length) session.setChatHistory(history);

            const base = {
              onTextChunk: (text: string) => {
                queue.push(text);
                poke();
              },
              signal: ctl.signal,
              stopOnAbortSignal: true,
              maxTokens: gen.maxTokens,
              temperature: gen.temperature,
            };

            let extra: Record<string, unknown> = {};
            if (gen.jsonSchema) {
              // llama.cpp cannot combine grammars with function calling, so JSON mode wins.
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                extra = { grammar: await llama.createGrammarForJsonSchema(gen.jsonSchema as any) };
              } catch {
                /* schema uses features the grammar compiler lacks: fall back to unconstrained output */
              }
            } else if (gen.tools && Object.keys(gen.tools).length) {
              extra = {
                functions: Object.fromEntries(
                  Object.entries(gen.tools).map(([name, def]) => [
                    name,
                    defineChatSessionFunction({
                      description: def.description,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      params: def.parameters as any,
                      handler: async (args: unknown) => {
                        try {
                          return (await def.run(args as never)) ?? null;
                        } catch (e) {
                          return { error: (e as Error).message };
                        }
                      },
                    }),
                  ]),
                ),
              };
            }

            run = session
              .prompt(prompt, { ...base, ...extra })
              .then(
                () => undefined,
                (e: unknown) => {
                  failure = e;
                },
              )
              .finally(() => {
                finished = true;
                poke();
              });

            for (;;) {
              const next = queue.shift();
              if (next !== undefined) {
                yield next;
                continue;
              }
              if (finished) break;
              await new Promise<void>((r) => (notify = r));
            }
            if (failure && !ctl.signal.aborted) throw failure;
          } finally {
            ctl.abort(); // stops generation if the consumer stopped early
            await run;
            session?.dispose();
            gen.signal?.removeEventListener("abort", onAbort);
            release();
          }
        },

        async embed(texts) {
          const ctx = await getEmbedder();
          const out: number[][] = [];
          for (const t of texts) out.push([...(await ctx.getEmbeddingFor(t)).vector]);
          return out;
        },

        async dispose() {
          await Promise.allSettled([
            embedder?.dispose(),
            embedModel?.dispose(),
            context.dispose(),
            model.dispose(),
          ]);
        },
      };
    },

    async clearCache() {
      await fs.rm(path.join(cacheDir, "models"), { recursive: true, force: true });
    },
  };
}
