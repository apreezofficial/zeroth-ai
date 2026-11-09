import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { ZerothError, createZeroth } from "@zeroth-ai/sdk";
import { webCatalog, type WebModel } from "./catalog.js";
import { createWebEngine, type ChunkLike, type WllamaLike } from "./engine.js";
import { memoryStore } from "./store.js";

const GB = 1024 ** 3;
const bytes = new TextEncoder().encode("pretend this is a gguf file");
const sha = createHash("sha256").update(bytes).digest("hex");

const tiny: WebModel = {
  id: "lfm-1b",
  name: "lfm-1b-q4",
  params: "1.2B",
  paramsB: 1.2,
  file: "tiny.gguf",
  url: "https://example.test/tiny.gguf",
  sha256: sha,
  sizeBytes: bytes.byteLength,
  memoryBytes: 1 * GB,
  upstream: "test",
  license: "test",
};
const tinyBig: WebModel = { ...tiny, id: "lfm3-1.7b", name: "lfm3-1.7b-q4", paramsB: 1.7, memoryBytes: 2 * GB };

const okFetch = (data: Uint8Array = bytes, counter = { n: 0 }) =>
  (async () => {
    counter.n++;
    return new Response(data as BodyInit);
  }) as unknown as typeof fetch;

const chunk = (content: string | null, extra: Partial<ChunkLike["choices"][number]["delta"]> = {}, finish: string | null = null): ChunkLike => ({
  choices: [{ delta: { content, ...extra }, finish_reason: finish }],
});

function fakeWllama(rounds: ChunkLike[][], seen: Record<string, unknown>[] = []): WllamaLike {
  let i = 0;
  return {
    async loadModel() {},
    async createChatCompletion(opts) {
      seen.push(JSON.parse(JSON.stringify({ ...opts, abortSignal: undefined })));
      const round = rounds[Math.min(i++, rounds.length - 1)] ?? [];
      return (async function* () {
        for (const c of round) yield c;
      })();
    },
    async exit() {},
  };
}

describe("web engine: resolve", () => {
  const engine = createWebEngine({ memoryBudgetBytes: 8 * GB });
  it("picks the largest browser model by default", async () => {
    assert.equal((await engine.resolve({})).id, "lfm3-1.7b");
  });
  it("picks the smallest for speed or battery", async () => {
    assert.equal((await engine.resolve({ prefer: "speed" })).id, "lfm-1b");
    assert.equal((await engine.resolve({ prefer: "battery" })).id, "lfm-1b");
  });
  it("honours maxDownloadMB", async () => {
    assert.equal((await engine.resolve({ maxDownloadMB: 800 })).id, "lfm-1b");
  });
  it("explains why models over 2 GB are not available", async () => {
    await assert.rejects(engine.resolve({ model: "granite-3b" }), (e: unknown) => e instanceof ZerothError && e.code === "MODEL_UNAVAILABLE" && /2 GB/.test(e.message));
  });
  it("rejects a model that does not fit the tab budget", async () => {
    const small = createWebEngine({ memoryBudgetBytes: 0.5 * GB });
    await assert.rejects(small.resolve({ model: "lfm-1b" }), { code: "INSUFFICIENT_MEMORY" });
  });
  it("only ships models that are under the 2 GB limit", () => {
    for (const m of webCatalog) assert.ok(m.sizeBytes < 2 * GB, m.id);
  });
});

describe("web engine: load", () => {
  it("downloads, verifies, caches, and skips the network the second time", async () => {
    const store = memoryStore();
    const counter = { n: 0 };
    const progress: number[] = [];
    const engine = createWebEngine({ catalog: [tiny], store, fetch: okFetch(bytes, counter), createWllama: async () => fakeWllama([[chunk("hi")]]) });
    const info = await engine.resolve({});
    const m1 = await engine.load(info, { onProgress: (p) => progress.push(p) });
    await m1.dispose();
    assert.equal(counter.n, 1);
    assert.equal(progress.at(-1), 1);
    const m2 = await engine.load(info, {});
    await m2.dispose();
    assert.equal(counter.n, 1, "second load must come from the cache");
  });

  it("rejects a corrupted download and does not cache it", async () => {
    const store = memoryStore();
    const bad = new Uint8Array(bytes.byteLength).fill(7);
    const engine = createWebEngine({ catalog: [tiny], store, fetch: okFetch(bad), createWllama: async () => fakeWllama([[]]) });
    await assert.rejects(engine.load(await engine.resolve({}), {}), { code: "CHECKSUM_MISMATCH" });
    assert.equal(await store.get(tiny.sha256), undefined);
  });

  it("rejects a truncated download", async () => {
    const engine = createWebEngine({ catalog: [tiny], store: memoryStore(), fetch: okFetch(bytes.slice(0, 5)), createWllama: async () => fakeWllama([[]]) });
    await assert.rejects(engine.load(await engine.resolve({}), {}), { code: "DOWNLOAD_FAILED" });
  });

  it("reports HTTP failures", async () => {
    const f = (async () => new Response("nope", { status: 503 })) as unknown as typeof fetch;
    const engine = createWebEngine({ catalog: [tiny], store: memoryStore(), fetch: f, createWllama: async () => fakeWllama([[]]) });
    await assert.rejects(engine.load(await engine.resolve({}), {}), { code: "DOWNLOAD_FAILED" });
  });

  it("maps runtime failures to ENGINE_UNAVAILABLE", async () => {
    const engine = createWebEngine({ catalog: [tiny], store: memoryStore(), fetch: okFetch(), createWllama: async () => { throw new Error("wasm 404"); } });
    await assert.rejects(engine.load(await engine.resolve({}), {}), { code: "ENGINE_UNAVAILABLE" });
  });
});

describe("web engine: through the SDK", () => {
  const make = (rounds: ChunkLike[][], seen: Record<string, unknown>[] = []) =>
    createZeroth(createWebEngine({ catalog: [tiny, tinyBig], memoryBudgetBytes: 8 * GB, store: memoryStore(), fetch: okFetch(), createWllama: async () => fakeWllama(rounds, seen) }));

  it("streams tokens", async () => {
    const ai = await make([[chunk("Hel"), chunk("lo"), chunk(null, {}, "stop")]]).load({ model: "lfm-1b" });
    assert.equal(await ai.complete("hi"), "Hello");
    await ai.unload();
  });

  it("sends a JSON schema to the runtime and validates the result", async () => {
    const seen: Record<string, unknown>[] = [];
    const ai = await make([[chunk('{"n":3}')]], seen).load({ model: "lfm-1b" });
    const out = await ai.json<{ n: number }>("count", { type: "object", properties: { n: { type: "number" } }, required: ["n"] });
    assert.deepEqual(out, { n: 3 });
    assert.equal((seen[0]!.response_format as { type: string }).type, "json_schema");
  });

  it("runs a tool the model calls and feeds the result back", async () => {
    const seen: Record<string, unknown>[] = [];
    const call = chunk(null, { tool_calls: [{ index: 0, id: "c1", function: { name: "add", arguments: '{"a":2,"b":3}' } }] }, "tool_calls");
    const ai = await make([[call], [chunk("The sum is 5")]], seen).load({ model: "lfm-1b" });
    ai.tools({ add: { description: "Add", parameters: { type: "object" }, run: ({ a, b }: { a: number; b: number }) => a + b } });
    assert.equal(await ai.complete("2+3?"), "The sum is 5");
    const second = seen[1]!.messages as { role: string; content: string }[];
    assert.equal(second.at(-1)!.role, "tool");
    assert.equal(second.at(-1)!.content, "5");
  });

  it("surfaces an abort as ZerothError ABORTED", async () => {
    const ctl = new AbortController();
    const ai = await make([[chunk("a"), chunk("b")]]).load({ model: "lfm-1b" });
    ctl.abort();
    await assert.rejects(ai.complete("x", { signal: ctl.signal }), { code: "ABORTED" });
  });

  it("says embed() is unavailable instead of failing obscurely", async () => {
    const ai = await make([[chunk("x")]]).load({ model: "lfm-1b" });
    await assert.rejects(ai.embed(["a"]), { code: "MODEL_UNAVAILABLE" });
  });
});
