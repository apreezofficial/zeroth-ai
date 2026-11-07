import { ZerothError, type LoadOptions } from "@zeroth/sdk";
import type { CatalogEntry } from "./catalog.js";

export interface SelectInput {
  catalog: readonly CatalogEntry[];
  /** Memory a model may use (see memoryBudget). */
  budgetBytes: number;
  totalMemBytes: number;
  options: LoadOptions;
  /** Models already on disk cost no download. */
  isCached?: (entry: CatalogEntry) => boolean;
}

const MB = 1_000_000;
const GiB = 1024 ** 3;
const fmt = (b: number) => `${(b / GiB).toFixed(1)} GB`;

/** Picks the model to load. Pure and deterministic so it is easy to test and explain. */
export function selectModel({ catalog, budgetBytes, totalMemBytes, options, isCached = () => false }: SelectInput): CatalogEntry {
  const chat = catalog.filter((e) => e.kind === "chat");
  const requested = options.model && options.model !== "auto" ? options.model : undefined;

  if (requested) {
    const entry = catalog.find((e) => e.id === requested);
    if (!entry) {
      throw new ZerothError(
        "MODEL_UNAVAILABLE",
        `"${requested}" is not available in the Node runtime. Available: ${catalog.map((e) => e.id).join(", ")}.`,
      );
    }
    if (entry.memoryBytes > totalMemBytes * 0.9) {
      throw new ZerothError(
        "INSUFFICIENT_MEMORY",
        `${entry.id} needs about ${fmt(entry.memoryBytes)} but this device has ${fmt(totalMemBytes)} of memory. Try a smaller model or "auto".`,
      );
    }
    return entry;
  }

  const fits = chat.filter((e) => {
    if (e.memoryBytes > budgetBytes) return false;
    if (options.maxDownloadMB !== undefined && !isCached(e) && e.sizeBytes > options.maxDownloadMB * MB) return false;
    return true;
  });

  if (fits.length === 0) {
    const fallback = options.fallback && chat.find((e) => e.id === options.fallback);
    if (fallback) return fallback;
    const smallest = [...chat].sort((a, b) => a.memoryBytes - b.memoryBytes)[0];
    if (smallest && smallest.memoryBytes <= totalMemBytes * 0.9 && options.maxDownloadMB === undefined) return smallest;
    throw new ZerothError(
      "INSUFFICIENT_MEMORY",
      `No model fits this device (budget ${fmt(budgetBytes)}${options.maxDownloadMB !== undefined ? `, max download ${options.maxDownloadMB} MB` : ""}).`,
    );
  }

  const bySize = [...fits].sort((a, b) => a.paramsB - b.paramsB);
  switch (options.prefer ?? "quality") {
    case "battery":
      return bySize[0]!;
    case "speed": {
      const small = bySize.filter((e) => e.paramsB <= 3.5);
      return (small.length ? small[small.length - 1] : bySize[0])!;
    }
    default:
      return bySize[bySize.length - 1]!;
  }
}
