import type { Engine, LoadedModel } from "./engine.js";
import type { ModelInfo } from "./types.js";

export interface MockEngineOptions {
  /** Delay between streamed tokens, in ms. Default 0. */
  tokenDelayMs?: number;
  /** Fixed reply instead of echoing the prompt. */
  reply?: string;
  dimensions?: number;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** FNV-1a hash, so embeddings are deterministic without any model. */
const hash = (s: string, seed: number) => {
  let h = 2166136261 ^ seed;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 0xffffffff;
};

/**
 * A fake engine for tests, demos and building UI before the real runtime exists.
 * It echoes the last user message word by word and returns deterministic embeddings.
 */
export function createMockEngine(options: MockEngineOptions = {}): Engine {
  const { tokenDelayMs = 0, dimensions = 8 } = options;

  return {
    name: "mock",
    async resolve(opts): Promise<ModelInfo> {
      const id = opts.model && opts.model !== "auto" ? opts.model : (opts.fallback ?? "nano-1b");
      return { id, name: `${id}-q4`, params: "mock", sizeMB: 0 };
    },
    async load(_model, opts): Promise<LoadedModel> {
      opts.onProgress?.(1);
      return {
        async *generate(messages, gen) {
          const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
          const text = options.reply ?? `Echo: ${last}`;
          const words = text.match(/\S+\s*/g) ?? [];
          const limit = gen.maxTokens ?? words.length;
          for (const word of words.slice(0, limit)) {
            if (gen.signal?.aborted) return;
            if (tokenDelayMs) await sleep(tokenDelayMs);
            yield word;
          }
        },
        async embed(texts) {
          return texts.map((t) => Array.from({ length: dimensions }, (_, i) => hash(t, i)));
        },
        async dispose() {},
      };
    },
  };
}
