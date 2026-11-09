import { ZerothError } from "@zeroth-ai/sdk";
import type { WebModel } from "./catalog.js";

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

export async function sha256Hex(blob: Blob): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()));
}

export interface FetchModelOptions {
  url: string;
  fetchImpl: typeof fetch;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

/** Download a model into memory, check its size and SHA-256, and return it as a Blob. */
export async function fetchVerified(model: WebModel, { url, fetchImpl, onProgress, signal }: FetchModelOptions): Promise<Blob> {
  let res: Response;
  try {
    res = await fetchImpl(url, { signal });
  } catch (cause) {
    if (signal?.aborted) throw new ZerothError("ABORTED", "Download was cancelled.", { cause });
    throw new ZerothError("DOWNLOAD_FAILED", `Could not reach ${new URL(url).host}. Check the connection and try again.`, { cause });
  }
  if (!res.ok || !res.body) {
    throw new ZerothError("DOWNLOAD_FAILED", `Downloading ${model.name} failed with HTTP ${res.status}.`);
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      onProgress?.(Math.min(loaded / model.sizeBytes, 1));
    }
  } catch (cause) {
    if (signal?.aborted) throw new ZerothError("ABORTED", "Download was cancelled.", { cause });
    throw new ZerothError("DOWNLOAD_FAILED", `The download of ${model.name} was interrupted after ${Math.round(loaded / 1e6)} MB.`, { cause });
  }

  if (loaded !== model.sizeBytes) {
    throw new ZerothError("DOWNLOAD_FAILED", `${model.name} arrived as ${loaded} bytes, expected ${model.sizeBytes}.`);
  }
  const blob = new Blob(chunks as BlobPart[]);
  const actual = await sha256Hex(blob);
  if (actual !== model.sha256) {
    throw new ZerothError("CHECKSUM_MISMATCH", `${model.name} failed its SHA-256 check. The file was discarded.`);
  }
  return blob;
}
