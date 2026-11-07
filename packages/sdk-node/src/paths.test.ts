import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultCacheDir } from "./paths.js";

describe("defaultCacheDir", () => {
  it("honours ZEROTH_HOME first", () => {
    assert.equal(defaultCacheDir({ ZEROTH_HOME: "/x" }, "darwin", "/h"), "/x");
  });
  it("uses the platform cache location", () => {
    assert.equal(defaultCacheDir({}, "darwin", "/Users/a"), "/Users/a/Library/Caches/zeroth");
    assert.equal(defaultCacheDir({}, "linux", "/home/a"), "/home/a/.cache/zeroth");
    assert.equal(defaultCacheDir({ XDG_CACHE_HOME: "/c" }, "linux", "/home/a"), "/c/zeroth");
  });
});
