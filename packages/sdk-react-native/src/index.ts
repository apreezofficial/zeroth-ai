import { registerEngine, zeroth } from "@zeroth-ai/sdk";
import { createMobileEngine } from "./engine.js";

/** The default React Native engine. Call `createMobileEngine` yourself to pass deviceMemoryBytes. */
export const mobileEngine = createMobileEngine();

// Importing this package makes `zeroth.load()` run models on the phone with llama.cpp.
registerEngine(mobileEngine);

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

export { createMobileEngine } from "./engine.js";
export type { MobileEngine, MobileEngineOptions, LlamaContextLike } from "./engine.js";
export { mobileCatalog } from "./catalog.js";
export type { MobileModel } from "./catalog.js";
export { ensureModel, reactNativeFiles } from "./files.js";
export type { ModelFiles } from "./files.js";
