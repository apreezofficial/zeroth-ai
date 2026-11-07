import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { ZerothError } from "@zeroth-ai/sdk";

export interface DownloadOptions {
  url: string;
  dest: string;
  sizeBytes: number;
  /** Expected SHA-256 (hex). */
  sha256: string;
  onProgress?: (downloadedBytes: number, totalBytes: number) => void;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
  /** Network retries, each resuming from the bytes already on disk. Default 3. */
  retries?: number;
}

const marker = (dest: string) => `${dest}.ok`;

/** True when the file is fully downloaded and was verified. */
export async function isDownloaded(dest: string, sizeBytes: number): Promise<boolean> {
  try {
    const [st] = await Promise.all([fs.stat(dest), fs.access(marker(dest))]);
    return st.size === sizeBytes;
  } catch {
    return false;
  }
}

async function sha256File(file: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk as Buffer);
  return hash.digest("hex");
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function aborted(signal?: AbortSignal): never {
  throw new ZerothError("ABORTED", "Download was aborted. Progress is kept and will resume next time.", {
    cause: signal?.reason,
  });
}

/**
 * Downloads to `dest`, resuming a partial `.part` file, then verifies size and SHA-256
 * before atomically moving it into place.
 */
export async function downloadVerified(opts: DownloadOptions): Promise<void> {
  const { url, dest, sizeBytes, sha256, onProgress, signal, fetchImpl = fetch, retries = 3 } = opts;
  const part = `${dest}.part`;
  await fs.mkdir(path.dirname(dest), { recursive: true });

  let attempt = 0;
  for (;;) {
    if (signal?.aborted) aborted(signal);

    let start = 0;
    try {
      start = (await fs.stat(part)).size;
    } catch {
      /* no partial file yet */
    }
    if (start > sizeBytes) {
      await fs.rm(part, { force: true });
      start = 0;
    }

    try {
      if (start < sizeBytes) {
        const res = await fetchImpl(url, {
          headers: start > 0 ? { Range: `bytes=${start}-` } : {},
          signal,
        });
        if (res.status === 416) {
          await fs.rm(part, { force: true });
          continue;
        }
        if (!res.ok || !res.body) {
          throw new ZerothError("DOWNLOAD_FAILED", `Download failed: HTTP ${res.status} from ${new URL(url).host}.`);
        }
        // A server that ignores Range replies 200 with the whole file: start over.
        const resumed = res.status === 206 && start > 0;
        if (!resumed) start = 0;

        const fh = await fs.open(part, resumed ? "a" : "w");
        let done = start;
        let lastTick = 0;
        try {
          for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
            await fh.write(chunk);
            done += chunk.byteLength;
            const now = Date.now();
            if (onProgress && (now - lastTick > 100 || done === sizeBytes)) {
              lastTick = now;
              onProgress(done, sizeBytes);
            }
          }
        } finally {
          await fh.close();
        }
      }

      const size = (await fs.stat(part)).size;
      if (size !== sizeBytes) {
        throw new ZerothError("DOWNLOAD_FAILED", `Download incomplete: got ${size} of ${sizeBytes} bytes.`);
      }
      break;
    } catch (err) {
      if (signal?.aborted) aborted(signal);
      if (err instanceof ZerothError && err.code === "DOWNLOAD_FAILED" && /HTTP 4\d\d/.test(err.message)) throw err;
      if (++attempt > retries) {
        if (err instanceof ZerothError) throw err;
        throw new ZerothError("DOWNLOAD_FAILED", `Download failed after ${retries} retries: ${(err as Error).message}`, {
          cause: err,
        });
      }
      await sleep(400 * 2 ** (attempt - 1));
    }
  }

  const actual = await sha256File(part);
  if (actual !== sha256.toLowerCase()) {
    await fs.rm(part, { force: true });
    throw new ZerothError(
      "CHECKSUM_MISMATCH",
      `Downloaded file failed verification (expected ${sha256.slice(0, 12)}…, got ${actual.slice(0, 12)}…). It was deleted; try again.`,
    );
  }

  await fs.rename(part, dest);
  await fs.writeFile(marker(dest), JSON.stringify({ sha256: actual, sizeBytes, verifiedAt: new Date().toISOString() }));
  onProgress?.(sizeBytes, sizeBytes);
}
