import os from "node:os";
import type { Llama } from "node-llama-cpp";

export interface Hardware {
  platform: NodeJS.Platform;
  arch: string;
  cpuCount: number;
  totalMemBytes: number;
  /** Accelerator in use, or false for CPU only. */
  gpu: false | "metal" | "cuda" | "vulkan";
  /** Dedicated GPU memory (discrete GPUs). */
  vramBytes?: number;
  /** Memory the GPU can address on unified-memory machines (Apple Silicon). */
  unifiedBytes?: number;
}

/** How much memory a model may use while running, leaving headroom for the app and the OS. */
export function memoryBudget(h: Pick<Hardware, "gpu" | "totalMemBytes" | "vramBytes" | "unifiedBytes">): number {
  if (h.gpu === "metal") return Math.round((h.unifiedBytes ?? h.totalMemBytes * 0.65) * 0.9);
  if (h.gpu === "cuda" || h.gpu === "vulkan") {
    return Math.round(Math.max((h.vramBytes ?? 0) * 0.9, h.totalMemBytes * 0.5));
  }
  return Math.round(h.totalMemBytes * 0.5);
}

export async function probeHardware(llama: Llama): Promise<Hardware> {
  const gpu = (llama.gpu || false) as Hardware["gpu"];
  let vramBytes: number | undefined;
  let unifiedBytes: number | undefined;
  if (gpu) {
    try {
      const v = await llama.getVramState();
      if (gpu === "metal") unifiedBytes = v.unifiedSize || v.total;
      else vramBytes = v.total;
    } catch {
      /* VRAM info is best effort */
    }
  }
  return {
    platform: process.platform,
    arch: process.arch,
    cpuCount: os.cpus().length,
    totalMemBytes: os.totalmem(),
    gpu,
    vramBytes,
    unifiedBytes,
  };
}
