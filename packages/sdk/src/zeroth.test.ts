import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createZeroth, zeroth, ZerothError } from "./index.js";
import { createMockEngine } from "./testing.js";

const load = (opts = {}) => createZeroth(createMockEngine(opts)).load("auto");

describe("load", () => {
  it("resolves a model and reports progress", async () => {
    const seen: number[] = [];
    const ai = await createZeroth(createMockEngine()).load({ model: "core-8b", onProgress: (p) => seen.push(p) });
    assert.equal(ai.model.id, "core-8b");
    assert.equal(ai.model.name, "core-8b-q4");
    assert.equal(ai.ready, true);
    assert.deepEqual(seen, [1]);
  });

  it("fails clearly when no engine is registered", async () => {
    await assert.rejects(zeroth.load("auto"), (e: unknown) => {
      assert.ok(e instanceof ZerothError);
      assert.equal(e.code, "ENGINE_UNAVAILABLE");
      return true;
    });
  });
});

describe("chat", () => {
  it("streams tokens and complete() joins them", async () => {
    const ai = await load();
    const tokens: string[] = [];
    for await (const t of ai.chat("hello there")) tokens.push(t);
    assert.ok(tokens.length > 1);
    assert.equal(tokens.join(""), "Echo: hello there");
    assert.equal(await ai.complete("hello there"), "Echo: hello there");
  });

  it("accepts message lists and honours maxTokens", async () => {
    const ai = await load();
    const out = await ai.complete(
      [
        { role: "system", content: "Be brief." },
        { role: "user", content: "one two three" },
      ],
      { maxTokens: 2 },
    );
    assert.equal(out, "Echo: one ");
  });
});

describe("json", () => {
  const schema = {
    type: "object",
    properties: { title: { type: "string" }, due: { type: "string" } },
    required: ["title"],
  } as const;

  it("parses fenced JSON and validates it", async () => {
    const ai = await load({ reply: '```json\n{"title":"Call Sam","due":"Friday"}\n```' });
    const task = await ai.json<{ title: string; due: string }>("make a task", schema);
    assert.deepEqual(task, { title: "Call Sam", due: "Friday" });
  });

  it("rejects non-JSON output", async () => {
    const ai = await load({ reply: "sorry, I can't" });
    await assert.rejects(ai.json("x", schema), { code: "INVALID_JSON" });
  });

  it("rejects output that breaks the schema", async () => {
    const ai = await load({ reply: '{"due":"Friday"}' });
    await assert.rejects(ai.json("x", schema), { code: "SCHEMA_MISMATCH" });
  });
});

describe("embed", () => {
  it("returns deterministic vectors, one per text", async () => {
    const ai = await load();
    const [a, b] = await ai.embed(["invoice", "invoice"]);
    const [c] = await ai.embed(["something else"]);
    assert.equal(a?.length, 8);
    assert.deepEqual(a, b);
    assert.notDeepEqual(a, c);
  });
});

describe("unload", () => {
  it("frees the model and blocks further use", async () => {
    const ai = await load();
    await ai.unload();
    assert.equal(ai.ready, false);
    await assert.rejects(ai.complete("hi"), { code: "NOT_LOADED" });
    await assert.rejects(ai.embed(["hi"]), { code: "NOT_LOADED" });
  });
});

describe("engine contract", () => {
  it("passes tools and the json schema to the engine", async () => {
    const seen: { tools?: string[]; schema?: unknown }[] = [];
    const base = createMockEngine({ reply: '{"ok":true}' });
    const engine = {
      ...base,
      async load(model: Parameters<typeof base.load>[0], opts: Parameters<typeof base.load>[1]) {
        const loaded = await base.load(model, opts);
        return {
          ...loaded,
          generate(messages: Parameters<typeof loaded.generate>[0], o: Parameters<typeof loaded.generate>[1]) {
            seen.push({ tools: Object.keys(o.tools ?? {}), schema: o.jsonSchema });
            return loaded.generate(messages, o);
          },
        };
      },
    };
    const ai = await createZeroth(engine).load("auto");
    ai.tools({ lookup: { description: "Look something up", run: () => 1 } });

    await ai.complete("hi");
    await ai.json("hi", { type: "object" });

    assert.deepEqual(seen[0], { tools: ["lookup"], schema: undefined });
    assert.deepEqual(seen[1], { tools: ["lookup"], schema: { type: "object" } });
  });

  it("throws ABORTED when the signal fires mid-stream", async () => {
    const ai = await load({ tokenDelayMs: 5, reply: "a b c d e f g h" });
    const ctl = new AbortController();
    const run = (async () => {
      let n = 0;
      for await (const _ of ai.chat("x", { signal: ctl.signal })) if (++n === 2) ctl.abort();
    })();
    await assert.rejects(run, { code: "ABORTED" });
  });
});
