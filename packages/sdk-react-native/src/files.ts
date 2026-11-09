import { ZerothError } from "@zeroth-ai/sdk";
import type { MobileModel } from "./catalog.js";

/** File access the engine needs. The default uses react-native-fs; tests pass a fake. */
export interface ModelFiles {
  /** Folder models are stored in. */
  dir: string;
  exists(path: string): Promise<boolean>;
  size(path: string): Promise<number>;
  sha256(path: string): Promise<string>;
  mkdir(path: string): Promise<void>;
  move(from: string, to: string): Promise<void>;
  /** Create a small marker file. */
  touch(path: string): Promise<void>;
  remove(path: string): Promise<void>;
  /** Download `url` to `dest`, reporting progress as 0..1. Must reject on HTTP errors. */
  download(url: string, dest: string, onProgress: (fraction: number) => void, signal?: AbortSignal): Promise<void>;
}

export async function reactNativeFiles(): Promise<ModelFiles> {
  const RNFS = await import("react-native-fs");
  const dir = `${RNFS.DocumentDirectoryPath}/zeroth/models`;
  return {
    dir,
    exists: (p) => RNFS.exists(p),
    size: async (p) => Number((await RNFS.stat(p)).size),
    sha256: (p) => RNFS.hash(p, "sha256"),
    mkdir: (p) => RNFS.mkdir(p),
    move: (a, b) => RNFS.moveFile(a, b),
    touch: (p) => RNFS.writeFile(p, "ok", "utf8"),
    remove: async (p) => {
      if (await RNFS.exists(p)) await RNFS.unlink(p);
    },
    async download(url, dest, onProgress, signal) {
      const job = RNFS.downloadFile({
        fromUrl: url,
        toFile: dest,
        progressInterval: 500,
        progress: ({ bytesWritten, contentLength }) => {
          if (contentLength > 0) onProgress(Math.min(bytesWritten / contentLength, 1));
        },
      });
      const stop = () => RNFS.stopDownload(job.jobId);
      signal?.addEventListener("abort", stop, { once: true });
      try {
        const res = await job.promise;
        if (res.statusCode < 200 || res.statusCode >= 300) throw new Error(`HTTP ${res.statusCode}`);
      } finally {
        signal?.removeEventListener("abort", stop);
      }
    },
  };
}

/** Download (if needed), verify and return the path of a model file on disk. */
export async function ensureModel(
  model: MobileModel,
  files: ModelFiles,
  opts: { url?: string; onProgress?: (fraction: number) => void; signal?: AbortSignal },
): Promise<string> {
  const final = `${files.dir}/${model.file}`;
  const marker = `${final}.ok`;
  if ((await files.exists(final)) && (await files.exists(marker)) && (await files.size(final)) === model.sizeBytes) {
    return final;
  }

  await files.mkdir(files.dir);
  const part = `${final}.part`;
  await files.remove(final);
  await files.remove(marker);
  await files.remove(part);

  try {
    await files.download(opts.url ?? model.url, part, (f) => opts.onProgress?.(f * 0.95), opts.signal);
  } catch (cause) {
    await files.remove(part);
    if (opts.signal?.aborted) throw new ZerothError("ABORTED", "Download was cancelled.", { cause });
    throw new ZerothError("DOWNLOAD_FAILED", `Downloading ${model.name} failed. Check the connection and try again.`, { cause });
  }

  const size = await files.size(part);
  if (size !== model.sizeBytes) {
    await files.remove(part);
    throw new ZerothError("DOWNLOAD_FAILED", `${model.name} arrived as ${size} bytes, expected ${model.sizeBytes}.`);
  }
  if ((await files.sha256(part)).toLowerCase() !== model.sha256) {
    await files.remove(part);
    throw new ZerothError("CHECKSUM_MISMATCH", `${model.name} failed its SHA-256 check. The file was discarded.`);
  }
  await files.move(part, final);
  // The marker is written last, so a half-finished download is never mistaken for a good file.
  await files.touch(marker);
  return final;
}
