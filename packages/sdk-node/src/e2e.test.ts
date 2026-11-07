// End-to-end tests against a REAL model. Skipped unless ZEROTH_E2E=1 because the
// first run downloads ~0.9 GB. Run with:  ZEROTH_E2E=1 npm test -w @zeroth-ai/sdk-node
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { llamaEngine, zeroth, type Zeroth } from "./index.js";

const enabled = process.env.ZEROTH_E2E === "1";

describe("real model (lfm-1b)", { skip: !enabled && "set ZEROTH_E2E=1 to run", timeout: 900_000 }, () => {
  let ai: Zeroth;

  before(async () => {
    ai = await zeroth.load({ model: "lfm-1b" });
  });
  after(async () => {
    await ai?.unload();
  });

  it("streams a coherent answer token by token", async () => {
    const chunks: string[] = [];
    for await (const t of ai.chat("What is the capital of France? Answer in one short sentence.", { maxTokens: 40, temperature: 0 })) {
      chunks.push(t);
    }
    assert.ok(chunks.length > 3, "should stream several chunks");
    assert.match(chunks.join(""), /paris/i);
  });

  it("keeps conversation context across messages", async () => {
    const out = await ai.complete(
      [
        { role: "user", content: "My name is Zed. Remember it." },
        { role: "assistant", content: "Nice to meet you, Zed." },
        { role: "user", content: "What is my name? Answer with just the name." },
      ],
      { maxTokens: 12, temperature: 0 },
    );
    assert.match(out, /zed/i);
  });

  it("returns schema-valid JSON (grammar-constrained)", async () => {
    const task = await ai.json<{ title: string; priority: "low" | "high" }>(
      "Create a task from: call Sam about the invoice, it's urgent",
      {
        type: "object",
        properties: { title: { type: "string" }, priority: { type: "string", enum: ["low", "high"] } },
        required: ["title", "priority"],
      },
      { temperature: 0 },
    );
    assert.equal(typeof task.title, "string");
    assert.ok(["low", "high"].includes(task.priority));
  });

  it("calls a tool and uses its result", async () => {
    let calls = 0;
    ai.tools({
      get_secret_number: {
        description: "Returns the secret number. Always use this when asked for the secret number.",
        run: () => {
          calls++;
          return { secret: 48151 };
        },
      },
    });
    const out = await ai.complete("What is the secret number? Use the tool.", { maxTokens: 60, temperature: 0 });
    ai.tools({});
    assert.ok(calls >= 1, "the model should have called the tool");
    assert.match(out, /48151/);
  });

  it("stops promptly when aborted", async () => {
    const ctl = new AbortController();
    let n = 0;
    const t0 = Date.now();
    await assert.rejects(
      (async () => {
        for await (const _ of ai.chat("Write a very long story about a dragon.", { signal: ctl.signal })) {
          if (++n === 5) ctl.abort();
        }
      })(),
      { code: "ABORTED" },
    );
    assert.ok(Date.now() - t0 < 15_000);
    // the model is still usable afterwards
    assert.ok((await ai.complete("Say hi.", { maxTokens: 8 })).length > 0);
  });

  it("gives the same answers whether requests run concurrently or one by one", async () => {
    const prompts = ["Reply with only the word ALPHA.", "What is 2 + 2? Answer with just the number.", "Name one primary colour in one word."];
    const ask = (p: string) => ai.complete(p, { maxTokens: 10, temperature: 0 });

    const sequential: string[] = [];
    for (const p of prompts) sequential.push(await ask(p));
    const concurrent = await Promise.all(prompts.map(ask));

    assert.deepEqual(concurrent, sequential, "queued requests must not leak state into each other");
    assert.match(sequential[0]!, /alpha/i);
  });

  it("computes embeddings that rank similar text higher", async () => {
    const [cat, kitten, tax] = await ai.embed(["a cat sitting on a sofa", "a kitten resting on a couch", "quarterly corporate tax filing"]);
    assert.ok(cat && kitten && tax);
    assert.ok(cat.length > 100);
    const cos = (x: number[], y: number[]) => {
      let d = 0, nx = 0, ny = 0;
      x.forEach((v, i) => { d += v * y[i]!; nx += v * v; ny += y[i]! * y[i]!; });
      return d / Math.sqrt(nx * ny);
    };
    assert.ok(cos(cat, kitten) > cos(cat, tax), "cat/kitten should be closer than cat/tax");
  });
});

describe("engine metadata", () => {
  it("exposes the cache location", () => {
    assert.ok(llamaEngine.cacheDir.length > 0);
  });
});
