import {
  ZerothError,
  type Engine,
  type EngineGenerateOptions,
  type LoadOptions,
  type LoadedModel,
  type Message,
  type ModelInfo,
  type ToolMap,
} from "@zeroth-ai/sdk";
import { webCatalog, webUnsupported, type WebModel } from "./catalog.js";
import { fetchVerified } from "./download.js";
import { cacheStorageStore, type BlobStore } from "./store.js";

const GB = 1024 ** 3;
const MAX_TOOL_ROUNDS = 5;

/** The part of wllama's API this engine uses. Lets tests inject a fake. */
export interface WllamaLike {
  loadModel(blobs: Blob[], params?: Record<string, unknown>): Promise<void>;
  createChatCompletion(options: Record<string, unknown>): Promise<AsyncIterable<ChunkLike>>;
  exit(): Promise<void>;
}

export interface ChunkLike {
  choices: {
    delta: {
      content?: string | null;
      tool_calls?: { index: number; id?: string; function?: { name?: string; arguments?: string } }[];
    };
    finish_reason: string | null;
  }[];
}

export interface WebEngineOptions {
  /**
   * URL of `wllama.wasm`. Serve the file from your own origin for apps that must work offline.
   * When omitted, the build from the jsDelivr CDN is used, which needs a connection on first load.
   */
  wasmUrl?: string;
  /** Where verified models are kept. Defaults to the browser Cache Storage. */
  store?: BlobStore;
  fetch?: typeof fetch;
  /** Override where a model is downloaded from, for example your own CDN or a test server. */
  urlFor?: (model: WebModel) => string;
  /** Context window in tokens. Smaller saves memory. Default 2048. */
  contextSize?: number;
  /** Memory the tab may use, in bytes. Default: 60% of `navigator.deviceMemory` when known. */
  memoryBudgetBytes?: number;
  catalog?: readonly WebModel[];
  createWllama?: (wasmUrl: string | undefined) => Promise<WllamaLike>;
}

export interface WebEngine extends Engine {
  readonly catalog: readonly WebModel[];
}

class Mutex {
  #tail: Promise<void> = Promise.resolve();
  lock(): Promise<() => void> {
    let release!: () => void;
    const next = new Promise<void>((r) => (release = r));
    const ready = this.#tail.then(() => release);
    this.#tail = this.#tail.then(() => next);
    return ready;
  }
}

async function defaultCreateWllama(wasmUrl: string | undefined): Promise<WllamaLike> {
  const { Wllama } = await import("@wllama/wllama");
  const paths = wasmUrl ? { default: wasmUrl } : (await import("@wllama/wllama/esm/wasm-from-cdn.js")).default;
  return new Wllama(paths) as unknown as WllamaLike;
}

function deviceBudget(explicit: number | undefined): number | undefined {
  if (explicit !== undefined) return explicit;
  const gb = (globalThis as { navigator?: { deviceMemory?: number } }).navigator?.deviceMemory;
  return gb ? gb * GB * 0.6 : undefined;
}

const toInfo = (m: WebModel): ModelInfo => ({ id: m.id, name: m.name, params: m.params, sizeMB: Math.round(m.sizeBytes / 1e6) });

function toOaiTools(tools: ToolMap | undefined) {
  const entries = Object.entries(tools ?? {});
  if (!entries.length) return undefined;
  return entries.map(([name, def]) => ({
    type: "function" as const,
    function: { name, description: def.description, parameters: def.parameters ?? { type: "object", properties: {} } },
  }));
}

export function createWebEngine(options: WebEngineOptions = {}): WebEngine {
  const catalog = options.catalog ?? webCatalog;
  const store = options.store ?? cacheStorageStore();
  const fetchImpl = options.fetch ?? ((...a: Parameters<typeof fetch>) => fetch(...a));
  const createWllama = options.createWllama ?? defaultCreateWllama;

  return {
    name: "wllama (WebAssembly)",
    catalog,

    async resolve(opts: LoadOptions): Promise<ModelInfo> {
      const budget = deviceBudget(options.memoryBudgetBytes);
      const fits = (m: WebModel) => budget === undefined || m.memoryBytes <= budget;

      if (opts.model && opts.model !== "auto") {
        const m = catalog.find((x) => x.id === opts.model);
        if (!m) {
          const why = webUnsupported.includes(opts.model)
            ? `${opts.model} is over the 2 GB single-file limit of a browser tab.`
            : `${opts.model} is not available in the browser.`;
          throw new ZerothError("MODEL_UNAVAILABLE", `${why} Use ${catalog.map((x) => x.id).join(" or ")}, or run it with @zeroth-ai/sdk-node.`);
        }
        if (!fits(m)) {
          throw new ZerothError("INSUFFICIENT_MEMORY", `${m.id} needs about ${(m.memoryBytes / GB).toFixed(1)} GB but this device allows about ${((budget ?? 0) / GB).toFixed(1)} GB for a tab.`);
        }
        return toInfo(m);
      }

      const limit = opts.maxDownloadMB ? opts.maxDownloadMB * 1e6 : Infinity;
      const pool = catalog.filter((m) => fits(m) && m.sizeBytes <= limit);
      if (pool.length) {
        const sorted = [...pool].sort((a, b) => a.paramsB - b.paramsB);
        const small = opts.prefer === "speed" || opts.prefer === "battery";
        return toInfo(small ? sorted[0]! : sorted[sorted.length - 1]!);
      }
      const fb = opts.fallback && catalog.find((x) => x.id === opts.fallback);
      if (fb && fits(fb)) return toInfo(fb);
      throw new ZerothError("INSUFFICIENT_MEMORY", "No browser model fits this device and the download limit you set.");
    },

    async load(info: ModelInfo, opts: LoadOptions): Promise<LoadedModel> {
      const entry = catalog.find((x) => x.id === info.id);
      if (!entry) throw new ZerothError("MODEL_UNAVAILABLE", `${info.id} is not available in the browser.`);

      let blob = await store?.get(entry.sha256).catch(() => undefined);
      if (blob && blob.size !== entry.sizeBytes) {
        await store?.delete(entry.sha256).catch(() => undefined);
        blob = undefined;
      }
      if (!blob) {
        blob = await fetchVerified(entry, {
          url: options.urlFor?.(entry) ?? entry.url,
          fetchImpl,
          onProgress: (f) => opts.onProgress?.(f * 0.95),
          signal: opts.signal,
        });
        // A full or blocked cache must not stop the model from loading this session.
        await store?.put(entry.sha256, blob).catch(() => undefined);
      }

      let wllama: WllamaLike;
      try {
        wllama = await createWllama(options.wasmUrl);
        await wllama.loadModel([blob], { n_ctx: options.contextSize ?? 2048 });
      } catch (cause) {
        throw new ZerothError("ENGINE_UNAVAILABLE", "The WebAssembly runtime could not load this model. Check that the wasm file is reachable and the device has enough memory.", { cause });
      }
      opts.onProgress?.(1);

      const mutex = new Mutex();
      return {
        async *generate(messages: Message[], gen: EngineGenerateOptions) {
          const release = await mutex.lock();
          try {
            const history: Record<string, unknown>[] = messages.map((m) => ({ role: m.role, content: m.content }));
            const tools = toOaiTools(gen.tools);
            for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
              const stream = await wllama.createChatCompletion({
                messages: history,
                stream: true,
                abortSignal: gen.signal,
                max_tokens: gen.maxTokens,
                temperature: gen.temperature,
                ...(tools && { tools }),
                ...(gen.jsonSchema && { response_format: { type: "json_schema", json_schema: { name: "response", schema: gen.jsonSchema, strict: true } } }),
              });
              const calls = new Map<number, { id: string; name: string; args: string }>();
              for await (const chunk of stream) {
                const choice = chunk.choices[0];
                if (!choice) continue;
                if (choice.delta.content) yield choice.delta.content;
                for (const tc of choice.delta.tool_calls ?? []) {
                  const cur = calls.get(tc.index) ?? { id: tc.id ?? `call_${round}_${tc.index}`, name: "", args: "" };
                  if (tc.id) cur.id = tc.id;
                  if (tc.function?.name) cur.name += tc.function.name;
                  if (tc.function?.arguments) cur.args += tc.function.arguments;
                  calls.set(tc.index, cur);
                }
              }
              if (!calls.size || !gen.tools) return;

              const list = [...calls.values()];
              history.push({
                role: "assistant",
                content: null,
                tool_calls: list.map((c) => ({ id: c.id, type: "function", function: { name: c.name, arguments: c.args || "{}" } })),
              });
              for (const c of list) {
                let result: unknown;
                const def = gen.tools[c.name];
                if (!def) result = { error: `Unknown tool ${c.name}` };
                else {
                  try {
                    result = await def.run(c.args ? JSON.parse(c.args) : {});
                  } catch (e) {
                    result = { error: e instanceof Error ? e.message : String(e) };
                  }
                }
                history.push({ role: "tool", tool_call_id: c.id, content: JSON.stringify(result ?? null) });
              }
            }
          } catch (e) {
            if (gen.signal?.aborted) return;
            throw e;
          } finally {
            release();
          }
        },

        async embed() {
          throw new ZerothError("MODEL_UNAVAILABLE", "embed() is not available yet: the catalogue has no 2026 embedding model.");
        },

        async dispose() {
          await wllama.exit();
        },
      };
    },

    async clearCache() {
      await store?.clear();
    },
  };
}
