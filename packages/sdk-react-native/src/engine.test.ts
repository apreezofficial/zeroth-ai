import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { ZerothError, createZeroth } from "@zeroth-ai/sdk";
import type { MobileModel } from "./catalog.js";
import { createMobileEngine, type LlamaContextLike } from "./engine.js";
import type { ModelFiles } from "./files.js";

const GB = 1024 ** 3;
const bytes = new TextEncoder().encode("pretend this is a gguf file");
const sha = createHash("sha256").update(bytes).digest("hex");

const tiny: MobileModel = {
  id: "lfm-1b", name: "lfm-1b-q4", params: "1.2B", paramsB: 1.2, file: "tiny.gguf",
  url: "https://example.test/tiny.gguf", sha256: sha, sizeBytes: bytes.byteLength, memoryBytes: 1 * GB,
  upstream: "test", license: "test",
};

/** In-memory stand-in for react-native-fs. */
function fakeFiles(payload: Uint8Array = bytes, opts: { failDownload?: boolean } = {}) {
  const disk = new Map<string, number>();
  const hashes = new Map<string, string>();
  const calls = { downloads: 0 };
  const files: ModelFiles = {
    dir: "/models",
    async exists(p) { return disk.has(p); },
    async size(p) { return disk.get(p) ?? 0; },
    async sha256(p) { return hashes.get(p) ?? ""; },
    async mkdir() {},
    async move(a, b) { disk.set(b, disk.get(a)!); hashes.set(b, hashes.get(a)!); disk.delete(a); hashes.delete(a); },
    async touch(p) { disk.set(p, 2); },
    async remove(p) { disk.delete(p); hashes.delete(p); },
    async download(_url, dest, onProgress) {
      calls.downloads++;
      if (opts.failDownload) throw new Error("network down");
      onProgress(0.5);
      disk.set(dest, payload.byteLength);
      hashes.set(dest, createHash("sha256").update(payload).digest("hex"));
      onProgress(1);
    },
  };
  return { files, disk, calls };
}

function fakeCtx(script: { tokens: string[]; tool_calls?: { id?: string; function: { name: string; arguments: string } }[] }[], seen: Record<string, unknown>[] = [], stops = { n: 0 }): LlamaContextLike {
  let i = 0;
  return {
    async completion(params, cb) {
      seen.push(JSON.parse(JSON.stringify(params)));
      const step = script[Math.min(i++, script.length - 1)]!;
      for (const t of step.tokens) {
        await new Promise((r) => setTimeout(r, 0));
        cb?.({ token: t });
      }
      return { text: step.tokens.join(""), tool_calls: step.tool_calls };
    },
    async stopCompletion() { stops.n++; },
    async release() {},
  };
}

describe("mobile engine: resolve", () => {
  it("assumes 4 GB and picks the largest model that fits half of it", async () => {
    assert.equal((await createMobileEngine().resolve({})).id, "lfm3-1.7b");
  });
  it("uses a bigger model when the device reports more memory", async () => {
    assert.equal((await createMobileEngine({ deviceMemoryBytes: 8 * GB }).resolve({})).id, "granite-3b");
  });
  it("picks the smallest for speed or battery", async () => {
    const e = createMobileEngine({ deviceMemoryBytes: 8 * GB });
    assert.equal((await e.resolve({ prefer: "battery" })).id, "lfm-1b");
  });
  it("rejects a model that does not fit", async () => {
    await assert.rejects(createMobileEngine().resolve({ model: "granite-3b" }), { code: "INSUFFICIENT_MEMORY" });
  });
  it("ships the same four models as the Node runtime", () => {
    assert.deepEqual(createMobileEngine().catalog.map((m) => m.id), ["lfm-1b", "lfm3-1.7b", "granite-3b", "gemma-e2b"]);
  });
});

describe("mobile engine: load", () => {
  const mk = (f: ReturnType<typeof fakeFiles>, ctx: () => Promise<LlamaContextLike> = async () => fakeCtx([{ tokens: ["ok"] }])) =>
    createMobileEngine({ catalog: [tiny], files: f.files, initLlama: ctx });

  it("downloads, verifies, writes the marker, and skips the network next time", async () => {
    const f = fakeFiles();
    const e = mk(f);
    const progress: number[] = [];
    const m1 = await e.load(await e.resolve({}), { onProgress: (p) => progress.push(p) });
    await m1.dispose();
    assert.equal(f.calls.downloads, 1);
    assert.ok(f.disk.has("/models/tiny.gguf.ok"));
    assert.ok(!f.disk.has("/models/tiny.gguf.part"));
    assert.equal(progress.at(-1), 1);
    await (await e.load(await e.resolve({}), {})).dispose();
    assert.equal(f.calls.downloads, 1);
  });

  it("discards a file with the wrong checksum", async () => {
    const f = fakeFiles(new Uint8Array(bytes.byteLength).fill(9));
    const e = mk(f);
    await assert.rejects(e.load(await e.resolve({}), {}), { code: "CHECKSUM_MISMATCH" });
    assert.ok(![...f.disk.keys()].some((k) => k.startsWith("/models/tiny.gguf")));
  });

  it("discards a truncated download", async () => {
    const f = fakeFiles(bytes.slice(0, 4));
    const e = mk(f);
    await assert.rejects(e.load(await e.resolve({}), {}), { code: "DOWNLOAD_FAILED" });
    assert.equal(f.disk.size, 0);
  });

  it("reports network failures as DOWNLOAD_FAILED", async () => {
    const f = fakeFiles(bytes, { failDownload: true });
    const e = mk(f);
    await assert.rejects(e.load(await e.resolve({}), {}), { code: "DOWNLOAD_FAILED" });
  });

  it("maps a llama.rn failure to ENGINE_UNAVAILABLE", async () => {
    const e = mk(fakeFiles(), async () => { throw new Error("native module missing"); });
    await assert.rejects(e.load(await e.resolve({}), {}), { code: "ENGINE_UNAVAILABLE" });
  });
});

describe("mobile engine: through the SDK", () => {
  const make = (script: Parameters<typeof fakeCtx>[0], seen: Record<string, unknown>[] = [], stops = { n: 0 }) =>
    createZeroth(createMobileEngine({ catalog: [tiny], files: fakeFiles().files, initLlama: async () => fakeCtx(script, seen, stops) }));

  it("streams tokens from the native callback", async () => {
    const ai = await make([{ tokens: ["Hel", "lo", " there"] }]).load({ model: "lfm-1b" });
    const out: string[] = [];
    for await (const t of ai.chat("hi")) out.push(t);
    assert.deepEqual(out, ["Hel", "lo", " there"]);
  });

  it("passes the JSON schema to llama.rn and validates the result", async () => {
    const seen: Record<string, unknown>[] = [];
    const ai = await make([{ tokens: ['{"n":', "4}"] }], seen).load({ model: "lfm-1b" });
    assert.deepEqual(await ai.json("n?", { type: "object", properties: { n: { type: "number" } }, required: ["n"] }), { n: 4 });
    assert.equal((seen[0]!.response_format as { type: string }).type, "json_schema");
  });

  it("runs a tool call and feeds the result back", async () => {
    const seen: Record<string, unknown>[] = [];
    const ai = await make([
      { tokens: [""], tool_calls: [{ id: "c1", function: { name: "add", arguments: '{"a":2,"b":3}' } }] },
      { tokens: ["The sum is 5"] },
    ], seen).load({ model: "lfm-1b" });
    ai.tools({ add: { description: "Add", parameters: { type: "object" }, run: ({ a, b }: { a: number; b: number }) => a + b } });
    assert.equal(await ai.complete("2+3?"), "The sum is 5");
    const msgs = seen[1]!.messages as { role: string; content: string }[];
    assert.equal(msgs.at(-1)!.role, "tool");
    assert.equal(msgs.at(-1)!.content, "5");
  });

  it("stops the native generation when aborted", async () => {
    const stops = { n: 0 };
    const ai = await make([{ tokens: ["a", "b", "c", "d"] }], [], stops).load({ model: "lfm-1b" });
    const ctl = new AbortController();
    setTimeout(() => ctl.abort(), 0);
    await assert.rejects(ai.complete("x", { signal: ctl.signal }), { code: "ABORTED" });
    assert.ok(stops.n >= 1);
  });

  it("propagates native generation errors", async () => {
    const bad: LlamaContextLike = { async completion() { throw new Error("out of memory"); }, async stopCompletion() {}, async release() {} };
    const ai = await createZeroth(createMobileEngine({ catalog: [tiny], files: fakeFiles().files, initLlama: async () => bad })).load({ model: "lfm-1b" });
    await assert.rejects(ai.complete("x"), /out of memory/);
  });

  it("says embed() is unavailable", async () => {
    const ai = await make([{ tokens: ["x"] }]).load({ model: "lfm-1b" });
    await assert.rejects(ai.embed(["a"]), (e: unknown) => e instanceof ZerothError && e.code === "MODEL_UNAVAILABLE");
  });
});
