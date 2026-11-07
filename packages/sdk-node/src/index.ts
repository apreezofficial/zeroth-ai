import { registerEngine, zeroth } from "@zeroth-ai/sdk";
import { createLlamaEngine } from "./engine.js";

/** The default engine, using the standard cache directory. */
export const llamaEngine = createLlamaEngine();

// Importing this package makes `zeroth.load()` run models locally with llama.cpp.
registerEngine(llamaEngine);

export { zeroth };
export { ZerothError } from "@zeroth-ai/sdk";
export type {
  GenerateOptions,
  Input,
  JsonSchema,
  LoadOptions,
  Message,
  ModelId,
  ModelInfo,
  Preference,
  ToolDefinition,
  ToolMap,
  Zeroth,
} from "@zeroth-ai/sdk";

export { createLlamaEngine, toChatHistory } from "./engine.js";
export type { LlamaEngine, LlamaEngineOptions } from "./engine.js";
export { catalog } from "./catalog.js";
export type { CatalogEntry } from "./catalog.js";
export { probeHardware, memoryBudget } from "./probe.js";
export type { Hardware } from "./probe.js";
export { selectModel } from "./select.js";
export { defaultCacheDir } from "./paths.js";
export { downloadVerified, isDownloaded } from "./download.js";
