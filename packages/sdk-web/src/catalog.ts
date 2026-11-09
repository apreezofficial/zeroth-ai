import type { ModelId } from "@zeroth-ai/sdk";

export interface WebModel {
  id: ModelId;
  /** Display name, e.g. "lfm-1b-q4". */
  name: string;
  params: string;
  /** Parameter count in billions, used for ranking. */
  paramsB: number;
  file: string;
  url: string;
  /** Expected SHA-256 of the file (hex). Downloads are verified against it. */
  sha256: string;
  sizeBytes: number;
  /** Rough memory needed in a tab: weights plus KV cache and WebAssembly overhead. */
  memoryBytes: number;
  upstream: string;
  license: string;
}

const GB = 1024 ** 3;
const hf = (repo: string, file: string) => `https://huggingface.co/${repo}/resolve/main/${file}`;
const tabMem = (size: number) => Math.round(size * 1.5 + 0.5 * GB);

/**
 * Models that run in a browser tab. A single file must stay under 2 GB because
 * WebAssembly memory is addressed through an ArrayBuffer, so granite-3b (2.2 GB) and
 * gemma-e2b (3.4 GB) are Node and Desktop only for now.
 */
export const webCatalog: readonly WebModel[] = [
  {
    id: "lfm-1b",
    name: "lfm-1b-q4",
    params: "1.2B",
    paramsB: 1.2,
    file: "LFM2.5-1.2B-Instruct-Q4_K_M.gguf",
    url: hf("LiquidAI/LFM2.5-1.2B-Instruct-GGUF", "LFM2.5-1.2B-Instruct-Q4_K_M.gguf"),
    sha256: "b1b3de114215d9507409a662a501a631095a479a419584e8a2ded6304b19b4f5",
    sizeBytes: 730895168,
    memoryBytes: tabMem(730895168),
    upstream: "LFM2.5 1.2B Instruct (Liquid AI, Jan 2026)",
    license: "LFM Open License (Liquid AI)",
  },
  {
    id: "lfm3-1.7b",
    name: "lfm3-1.7b-q4",
    params: "1.7B",
    paramsB: 1.7,
    file: "LFM3-1.7B-Q4_K_M.gguf",
    url: hf("LiquidAI/LFM3-1.7B-GGUF", "LFM3-1.7B-Q4_K_M.gguf"),
    sha256: "3793e1e6e2266919d6e015287221b41100175a98eddaba92e111aed3b05c93c4",
    sizeBytes: 1099627808,
    memoryBytes: tabMem(1099627808),
    upstream: "LFM3 1.7B (Liquid AI, Oct 2026)",
    license: "LFM Open License (Liquid AI)",
  },
];

/** Models that exist in the Zeroth catalogue but are too big for a browser tab. */
export const webUnsupported: readonly ModelId[] = ["granite-3b", "gemma-e2b"];
