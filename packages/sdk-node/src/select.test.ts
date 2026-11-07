import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { catalog } from "./catalog.js";
import { memoryBudget } from "./probe.js";
import { selectModel } from "./select.js";

const GiB = 1024 ** 3;
const pick = (totalGiB: number, options = {}, gpu: "metal" | false = false, isCached = () => false) => {
  const totalMemBytes = totalGiB * GiB;
  const budgetBytes = memoryBudget({ gpu, totalMemBytes, unifiedBytes: gpu === "metal" ? totalMemBytes * 0.7 : undefined });
  return selectModel({ catalog, budgetBytes, totalMemBytes, options, isCached }).id;
};

describe("selectModel (auto)", () => {
  it("fits an 8 GB Apple Silicon laptop with the 3B model", () => {
    assert.equal(pick(8, {}, "metal"), "granite-3b");
  });
  it("picks the biggest model on a 64 GB machine", () => {
    assert.equal(pick(64, {}, "metal"), "granite-3b");
  });
  it("picks the largest fitting model on a 16 GB machine", () => {
    assert.equal(pick(16, {}, "metal"), "granite-3b");
  });
  it("prefer speed caps at the 3B tier, battery picks the smallest", () => {
    assert.equal(pick(64, { prefer: "speed" }, "metal"), "granite-3b");
    assert.equal(pick(64, { prefer: "battery" }, "metal"), "lfm-1b");
  });
  it("respects maxDownloadMB but ignores it for cached models", () => {
    assert.equal(pick(64, { maxDownloadMB: 1000 }, "metal"), "lfm-1b");
    assert.equal(pick(64, { maxDownloadMB: 1000 }, "metal", (() => true) as never), "granite-3b");
  });
  it("uses the fallback when nothing fits the download limit", () => {
    assert.equal(pick(64, { maxDownloadMB: 100, fallback: "lfm-1b" }, "metal"), "lfm-1b");
  });
  it("falls back to the smallest model on a tiny device rather than failing", () => {
    assert.equal(pick(3), "lfm-1b");
  });
  it("throws when even the smallest model cannot fit", () => {
    assert.throws(() => pick(1), { code: "INSUFFICIENT_MEMORY" });
  });
});

describe("selectModel (explicit)", () => {
  it("honours an explicit model", () => {
    assert.equal(pick(16, { model: "lfm-1b" }), "lfm-1b");
  });
  it("rejects models the Node runtime does not ship", () => {
    assert.throws(() => pick(64, { model: "vision-8b" }), { code: "MODEL_UNAVAILABLE" });
  });
  it("rejects a model far too big for the device", () => {
    assert.throws(() => pick(2, { model: "granite-3b" }), { code: "INSUFFICIENT_MEMORY" });
  });
});

describe("memoryBudget", () => {
  it("uses unified memory on Apple Silicon and half of RAM on CPU", () => {
    assert.equal(memoryBudget({ gpu: "metal", totalMemBytes: 10 * GiB, unifiedBytes: 7 * GiB }), Math.round(7 * GiB * 0.9));
    assert.equal(memoryBudget({ gpu: false, totalMemBytes: 16 * GiB }), 8 * GiB);
  });
  it("prefers VRAM on discrete GPUs", () => {
    assert.equal(memoryBudget({ gpu: "cuda", totalMemBytes: 16 * GiB, vramBytes: 24 * GiB }), Math.round(24 * GiB * 0.9));
  });
});
