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
import { mobileCatalog, type MobileModel } from "./catalog.js";
import { ensureModel, reactNativeFiles, type ModelFiles } from "./files.js";

const GB = 1024 ** 3;
const MAX_TOOL_ROUNDS = 5;

/** The part of llama.rn this engine uses. Lets tests inject a fake. */
export interface LlamaContextLike {
  completion(params: Record<string, unknown>, callback?: (data: { token: string }) => void): Promise<{ text: string; tool_calls?: { id?: string; function: { name: string; arguments: string } }[] }>;
  stopCompletion(): Promise<void>;
  release(): Promise<void>;
}

export interface MobileEngineOptions {
  /** Total device memory in bytes, for example from react-native-device-info. Default assumes 4 GB. */
  deviceMemoryBytes?: number;
  /** Context window in tokens. Smaller saves memory. Default 2048. */
  contextSize?: number;
  /** Offload layers to the GPU (Metal on iOS, OpenCL on Android where available). Default 99. */
  gpuLayers?: number;
  /** Override where a model is downloaded from, for example your own CDN. */
  urlFor?: (model: MobileModel) => string;
  catalog?: readonly MobileModel[];
  files?: ModelFiles;
  initLlama?: (params: Record<string, unknown>) => Promise<LlamaContextLike>;
}

export interface MobileEngine extends Engine {
  readonly catalog: readonly MobileModel[];
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

const toInfo = (m: MobileModel): ModelInfo => ({ id: m.id, name: m.name, params: m.params, sizeMB: Math.round(m.sizeBytes / 1e6) });

function toOaiTools(tools: ToolMap | undefined) {
  const entries = Object.entries(tools ?? {});
  if (!entries.length) return undefined;
  return entries.map(([name, def]) => ({
    type: "function" as const,
    function: { name, description: def.description, parameters: def.parameters ?? { type: "object", properties: {} } },
  }));
}

const STOP_WORDS = ["</s>", "<|end|>", "<|eot_id|>", "<|end_of_text|>", "<|im_end|>", "<|endoftext|>"];

export function createMobileEngine(options: MobileEngineOptions = {}): MobileEngine {
  const catalog = options.catalog ?? mobileCatalog;
  const budget = (options.deviceMemoryBytes ?? 4 * GB) * 0.5;
  const fits = (m: MobileModel) => m.memoryBytes <= budget;
  let filesPromise: Promise<ModelFiles> | undefined;
  const getFiles = () => (options.files ? Promise.resolve(options.files) : (filesPromise ??= reactNativeFiles()));
  const init = options.initLlama ?? (async (params) => (await import("llama.rn")).initLlama(params) as Promise<LlamaContextLike>);

  return {
    name: "llama.rn (llama.cpp)",
    catalog,

    async resolve(opts: LoadOptions): Promise<ModelInfo> {
      if (opts.model && opts.model !== "auto") {
        const m = catalog.find((x) => x.id === opts.model);
        if (!m) throw new ZerothError("MODEL_UNAVAILABLE", `${opts.model} is not in the mobile catalogue.`);
        if (!fits(m)) {
          throw new ZerothError("INSUFFICIENT_MEMORY", `${m.id} needs about ${(m.memoryBytes / GB).toFixed(1)} GB but about ${(budget / GB).toFixed(1)} GB is available. Pass deviceMemoryBytes if this device has more.`);
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
      throw new ZerothError("INSUFFICIENT_MEMORY", "No model fits this device and the download limit you set.");
    },

    async load(info: ModelInfo, opts: LoadOptions): Promise<LoadedModel> {
      const entry = catalog.find((x) => x.id === info.id);
      if (!entry) throw new ZerothError("MODEL_UNAVAILABLE", `${info.id} is not in the mobile catalogue.`);

      const files = await getFiles();
      const path = await ensureModel(entry, files, { url: options.urlFor?.(entry), onProgress: opts.onProgress, signal: opts.signal });

      let ctx: LlamaContextLike;
      try {
        ctx = await init({ model: path, n_ctx: options.contextSize ?? 2048, n_gpu_layers: options.gpuLayers ?? 99, use_mlock: false });
      } catch (cause) {
        throw new ZerothError("ENGINE_UNAVAILABLE", "llama.rn could not load this model. Check that llama.rn is installed and linked, and that the device has enough memory.", { cause });
      }
      opts.onProgress?.(1);

      const mutex = new Mutex();
      return {
        async *generate(messages: Message[], gen: EngineGenerateOptions) {
          const release = await mutex.lock();
          const history: Record<string, unknown>[] = messages.map((m) => ({ role: m.role, content: m.content }));
          const tools = toOaiTools(gen.tools);
          const onAbort = () => void ctx.stopCompletion();
          gen.signal?.addEventListener("abort", onAbort, { once: true });
          try {
            for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
              // llama.rn reports tokens through a callback; bridge it to an async iterator.
              const queue: string[] = [];
              let wake: (() => void) | undefined;
              let done = false;
              let failure: unknown;
              const push = (t: string) => {
                queue.push(t);
                wake?.();
              };
              const run = ctx
                .completion(
                  {
                    messages: history,
                    n_predict: gen.maxTokens ?? -1,
                    temperature: gen.temperature,
                    stop: STOP_WORDS,
                    ...(tools && { tools, jinja: true, tool_choice: "auto" }),
                    ...(gen.jsonSchema && { response_format: { type: "json_schema", json_schema: { strict: true, schema: gen.jsonSchema } } }),
                  },
                  (d) => push(d.token),
                )
                .catch((e) => {
                  failure = e;
                  return undefined;
                })
                .finally(() => {
                  done = true;
                  wake?.();
                });

              while (!done || queue.length) {
                if (queue.length) yield queue.shift()!;
                else await new Promise<void>((r) => (wake = r));
              }
              const result = await run;
              if (failure && !gen.signal?.aborted) throw failure;
              if (gen.signal?.aborted) return;

              const calls = result?.tool_calls ?? [];
              if (!calls.length || !gen.tools) return;

              history.push({
                role: "assistant",
                content: result?.text ?? "",
                tool_calls: calls.map((c, i) => ({ id: c.id ?? `call_${round}_${i}`, type: "function", function: c.function })),
              });
              for (const [i, c] of calls.entries()) {
                const def = gen.tools[c.function.name];
                let out: unknown;
                if (!def) out = { error: `Unknown tool ${c.function.name}` };
                else {
                  try {
                    out = await def.run(c.function.arguments ? JSON.parse(c.function.arguments) : {});
                  } catch (e) {
                    out = { error: e instanceof Error ? e.message : String(e) };
                  }
                }
                history.push({ role: "tool", tool_call_id: c.id ?? `call_${round}_${i}`, content: JSON.stringify(out ?? null) });
              }
            }
          } finally {
            gen.signal?.removeEventListener("abort", onAbort);
            release();
          }
        },

        async embed() {
          throw new ZerothError("MODEL_UNAVAILABLE", "embed() is not available yet: the catalogue has no 2026 embedding model.");
        },

        async dispose() {
          await ctx.release();
        },
      };
    },

    async clearCache() {
      const files = await getFiles();
      for (const m of catalog) {
        const p = `${files.dir}/${m.file}`;
        await files.remove(p);
        await files.remove(`${p}.ok`);
        await files.remove(`${p}.part`);
      }
    },
  };
}
