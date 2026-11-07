import type { ModelId } from "@zeroth-ai/sdk";

export interface CatalogEntry {
  id: ModelId;
  kind: "chat" | "embedding";
  /** Display name, e.g. "core-8b-q4". */
  name: string;
  /** Human-readable parameter count. */
  params: string;
  /** Parameter count in billions, used for ranking. */
  paramsB: number;
  file: string;
  url: string;
  /** Expected SHA-256 of the file (hex). Downloads are verified against it. */
  sha256: string;
  sizeBytes: number;
  /** Estimated resident memory while running (weights + KV cache + overhead). */
  memoryBytes: number;
  /** Upstream open-weight model this entry is built on. */
  upstream: string;
  license: string;
}

const GB = 1024 ** 3;
const hf = (repo: string, file: string) => `https://huggingface.co/${repo}/resolve/main/${file}`;
const chatMem = (size: number) => Math.round(size * 1.25 + 0.5 * GB);

/**
 * Models the Node runtime can run today. `vision-8b` is not listed because the
 * llama.cpp bindings used here do not support image input yet.
 */
export const catalog: readonly CatalogEntry[] = [
  {
    id: "nano-1b",
    kind: "chat",
    name: "nano-1b-q4",
    params: "1.2B",
    paramsB: 1.24,
    file: "Llama-3.2-1B-Instruct-Q4_K_M.gguf",
    url: hf("bartowski/Llama-3.2-1B-Instruct-GGUF", "Llama-3.2-1B-Instruct-Q4_K_M.gguf"),
    sha256: "6f85a640a97cf2bf5b8e764087b1e83da0fdb51d7c9fab7d0fece9385611df83",
    sizeBytes: 807694464,
    memoryBytes: chatMem(807694464),
    upstream: "Llama 3.2 1B Instruct",
    license: "Llama 3.2 Community License",
  },
  {
    id: "lite-3b",
    kind: "chat",
    name: "lite-3b-q4",
    params: "3B",
    paramsB: 3.21,
    file: "Llama-3.2-3B-Instruct-Q4_K_M.gguf",
    url: hf("bartowski/Llama-3.2-3B-Instruct-GGUF", "Llama-3.2-3B-Instruct-Q4_K_M.gguf"),
    sha256: "6c1a2b41161032677be168d354123594c0e6e67d2b9227c84f296ad037c728ff",
    sizeBytes: 2019377696,
    memoryBytes: chatMem(2019377696),
    upstream: "Llama 3.2 3B Instruct",
    license: "Llama 3.2 Community License",
  },
  {
    id: "core-8b",
    kind: "chat",
    name: "core-8b-q4",
    params: "8B",
    paramsB: 8.03,
    file: "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf",
    url: hf("bartowski/Meta-Llama-3.1-8B-Instruct-GGUF", "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf"),
    sha256: "7b064f5842bf9532c91456deda288a1b672397a54fa729aa665952863033557c",
    sizeBytes: 4920739232,
    memoryBytes: chatMem(4920739232),
    upstream: "Llama 3.1 8B Instruct",
    license: "Llama 3.1 Community License",
  },
  {
    id: "pro-32b",
    kind: "chat",
    name: "pro-32b-q4",
    params: "32B",
    paramsB: 32.76,
    file: "Qwen2.5-32B-Instruct-Q4_K_M.gguf",
    url: hf("bartowski/Qwen2.5-32B-Instruct-GGUF", "Qwen2.5-32B-Instruct-Q4_K_M.gguf"),
    sha256: "2e5f6daea180dbc59f65a40641e94d3973b5dbaa32b3c0acf54647fa874e519e",
    sizeBytes: 19851336576,
    memoryBytes: chatMem(19851336576),
    upstream: "Qwen2.5 32B Instruct",
    license: "Apache 2.0",
  },
  {
    id: "embed-s",
    kind: "embedding",
    name: "embed-s-q4",
    params: "137M",
    paramsB: 0.137,
    file: "nomic-embed-text-v1.5.Q4_K_M.gguf",
    url: hf("nomic-ai/nomic-embed-text-v1.5-GGUF", "nomic-embed-text-v1.5.Q4_K_M.gguf"),
    sha256: "d4e388894e09cf3816e8b0896d81d265b55e7a9fff9ab03fe8bf4ef5e11295ac",
    sizeBytes: 84106624,
    memoryBytes: Math.round(84106624 * 1.5 + 0.125 * GB),
    upstream: "nomic-embed-text v1.5",
    license: "Apache 2.0",
  },
];
