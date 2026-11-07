import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toChatHistory } from "./engine.js";

describe("toChatHistory", () => {
  it("turns a single prompt into no history", () => {
    assert.deepEqual(toChatHistory([{ role: "user", content: "hi" }]), { history: [], prompt: "hi" });
  });

  it("puts system text first and keeps turn order", () => {
    const out = toChatHistory([
      { role: "system", content: "Be brief." },
      { role: "user", content: "a" },
      { role: "assistant", content: "b" },
      { role: "user", content: "c" },
    ]);
    assert.equal(out.prompt, "c");
    assert.deepEqual(out.history, [
      { type: "system", text: "Be brief." },
      { type: "user", text: "a" },
      { type: "model", response: ["b"] },
    ]);
  });

  it("merges consecutive messages from the same role", () => {
    const out = toChatHistory([
      { role: "system", content: "one" },
      { role: "system", content: "two" },
      { role: "user", content: "a" },
      { role: "user", content: "b" },
    ]);
    assert.equal(out.prompt, "a\n\nb");
    assert.deepEqual(out.history, [{ type: "system", text: "one\n\ntwo" }]);
  });

  it("requires the last message to come from the user", () => {
    assert.throws(() => toChatHistory([{ role: "assistant", content: "x" }]), TypeError);
    assert.throws(() => toChatHistory([]), TypeError);
  });
});
