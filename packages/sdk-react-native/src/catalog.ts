import type { ModelId } from "@zeroth-ai/sdk";

export interface MobileModel {
  id: ModelId;
  name: string;
  params: string;
  paramsB: number;
  file: string;
  url: string;
  /** Expected SHA-256 of the file (hex). Downloads are verified against it. */
  sha256: string;
  sizeBytes: number;
  /** Rough memory while running: weights plus KV cache and overhead. */
  memoryBytes: number;
  upstream: string;
  license: string;
}

const GB = 1024 ** 3;
const hf = (repo: string, file: string) => `https://huggingface.co/${repo}/resolve/main/${file}`;
const mem = (size: number) => Math.round(size * 1.25 + 0.5 * GB);

/** The same 2026 models as the Node runtime, with the same hashes. */
export const mobileCatalog: readonly MobileModel[] = [
  {
    id: "lfm-1b", name: "lfm-1b-q4", params: "1.2B", paramsB: 1.2,
    file: "LFM2.5-1.2B-Instruct-Q4_K_M.gguf",
    url: hf("LiquidAI/LFM2.5-1.2B-Instruct-GGUF", "LFM2.5-1.2B-Instruct-Q4_K_M.gguf"),
    sha256: "b1b3de114215d9507409a662a501a631095a479a419584e8a2ded6304b19b4f5",
    sizeBytes: 730895168, memoryBytes: mem(730895168),
    upstream: "LFM2.5 1.2B Instruct (Liquid AI, Jan 2026)", license: "LFM Open License (Liquid AI)",
  },
  {
    id: "lfm3-1.7b", name: "lfm3-1.7b-q4", params: "1.7B", paramsB: 1.7,
    file: "LFM3-1.7B-Q4_K_M.gguf",
    url: hf("LiquidAI/LFM3-1.7B-GGUF", "LFM3-1.7B-Q4_K_M.gguf"),
    sha256: "3793e1e6e2266919d6e015287221b41100175a98eddaba92e111aed3b05c93c4",
    sizeBytes: 1099627808, memoryBytes: mem(1099627808),
    upstream: "LFM3 1.7B (Liquid AI, Oct 2026)", license: "LFM Open License (Liquid AI)",
  },
  {
    id: "granite-3b", name: "granite-3b-q4", params: "3B", paramsB: 3,
    file: "granite-4.2-3b-Q4_K_M.gguf",
    url: hf("ibm-granite/granite-4.2-3b-GGUF", "granite-4.2-3b-Q4_K_M.gguf"),
    sha256: "e0406663965846ae22a403456eb826ccce5f450840491f71952f18a7cb78e7d5",
    sizeBytes: 2244011552, memoryBytes: mem(2244011552),
    upstream: "IBM Granite 4.2 3B (Aug 2026)", license: "Apache 2.0",
  },
  {
    id: "gemma-e2b", name: "gemma-e2b-q4", params: "E2B (≈2B effective)", paramsB: 2,
    file: "gemma-4-E2B_q4_0-it.gguf",
    url: hf("google/gemma-4-E2B-it-qat-q4_0-gguf", "gemma-4-E2B_q4_0-it.gguf"),
    sha256: "fa401b55b07ee70a54c6dae3903c783a6e65064312529ea57175cb5f8dec6634",
    sizeBytes: 3349516256, memoryBytes: mem(3349516256),
    upstream: "Google Gemma 4 E2B, quantisation-aware trained (May 2026)", license: "Apache 2.0",
  },
];
