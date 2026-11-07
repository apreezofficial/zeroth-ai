import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { downloadVerified, isDownloaded } from "./download.js";

const data = randomBytes(1_500_000);
const sha = createHash("sha256").update(data).digest("hex");

let server: http.Server;
let base = "";
let dir = "";
let honourRange = true;
let failFirst = 0;
let requests: (string | undefined)[] = [];

before(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "zeroth-dl-"));
  server = http.createServer((req, res) => {
    requests.push(req.headers.range);
    if (failFirst > 0) {
      failFirst--;
      res.writeHead(200, { "content-length": data.length });
      res.write(data.subarray(0, 300_000));
      setTimeout(() => res.destroy(), 10); // drop the connection mid-body
      return;
    }
    const m = honourRange ? /bytes=(\d+)-/.exec(req.headers.range ?? "") : null;
    if (m) {
      const start = Number(m[1]);
      res.writeHead(206, { "content-length": data.length - start, "content-range": `bytes ${start}-${data.length - 1}/${data.length}` });
      res.end(data.subarray(start));
    } else {
      res.writeHead(200, { "content-length": data.length });
      res.end(data);
    }
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/m.bin`;
});

after(async () => {
  server.close();
  await fs.rm(dir, { recursive: true, force: true });
});

const reset = () => {
  honourRange = true;
  failFirst = 0;
  requests = [];
};

describe("downloadVerified", () => {
  it("downloads, verifies and marks the file", async () => {
    reset();
    const dest = path.join(dir, "a.bin");
    const progress: number[] = [];
    await downloadVerified({ url: base, dest, sizeBytes: data.length, sha256: sha, onProgress: (d, t) => progress.push(d / t) });
    assert.deepEqual(await fs.readFile(dest), data);
    assert.equal(await isDownloaded(dest, data.length), true);
    assert.equal(progress.at(-1), 1);
    await assert.rejects(fs.access(`${dest}.part`));
  });

  it("resumes a partial download with a Range request", async () => {
    reset();
    const dest = path.join(dir, "b.bin");
    await fs.writeFile(`${dest}.part`, data.subarray(0, 700_000));
    await downloadVerified({ url: base, dest, sizeBytes: data.length, sha256: sha });
    assert.deepEqual(await fs.readFile(dest), data);
    assert.equal(requests[0], "bytes=700000-");
  });

  it("restarts cleanly when the server ignores Range", async () => {
    reset();
    honourRange = false;
    const dest = path.join(dir, "c.bin");
    await fs.writeFile(`${dest}.part`, data.subarray(0, 500_000));
    await downloadVerified({ url: base, dest, sizeBytes: data.length, sha256: sha });
    assert.deepEqual(await fs.readFile(dest), data);
  });

  it("recovers from a dropped connection by resuming", async () => {
    reset();
    failFirst = 1;
    const dest = path.join(dir, "d.bin");
    await downloadVerified({ url: base, dest, sizeBytes: data.length, sha256: sha, retries: 2 });
    assert.deepEqual(await fs.readFile(dest), data);
    assert.ok(requests.length >= 2);
  });

  it("deletes the file and throws on a checksum mismatch", async () => {
    reset();
    const dest = path.join(dir, "e.bin");
    await assert.rejects(
      downloadVerified({ url: base, dest, sizeBytes: data.length, sha256: "0".repeat(64) }),
      { code: "CHECKSUM_MISMATCH" },
    );
    await assert.rejects(fs.access(dest));
    await assert.rejects(fs.access(`${dest}.part`));
  });

  it("fails fast on HTTP errors", async () => {
    reset();
    const bad = http.createServer((_q, r) => r.writeHead(404).end());
    await new Promise<void>((r) => bad.listen(0, "127.0.0.1", r));
    const url = `http://127.0.0.1:${(bad.address() as AddressInfo).port}/x`;
    await assert.rejects(
      downloadVerified({ url, dest: path.join(dir, "f.bin"), sizeBytes: 10, sha256: sha }),
      { code: "DOWNLOAD_FAILED" },
    );
    bad.close();
  });

  it("keeps partial progress when aborted", async () => {
    reset();
    const dest = path.join(dir, "g.bin");
    const ctl = new AbortController();
    await assert.rejects(
      downloadVerified({
        url: base,
        dest,
        sizeBytes: data.length,
        sha256: sha,
        signal: ctl.signal,
        onProgress: () => ctl.abort(),
      }),
      { code: "ABORTED" },
    );
    assert.equal(await isDownloaded(dest, data.length), false);
  });
});
