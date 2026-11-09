import { registerEngine, zeroth } from "@zeroth-ai/sdk";
import { createWebEngine } from "./engine.js";

/** The default browser engine. Pass `wasmUrl` to `createWebEngine` to serve the runtime yourself. */
export const webEngine = createWebEngine();

// Importing this package makes `zeroth.load()` run models in the browser with llama.cpp on WebAssembly.
registerEngine(webEngine);

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

export { createWebEngine } from "./engine.js";
export type { WebEngine, WebEngineOptions, WllamaLike } from "./engine.js";
export { webCatalog, webUnsupported } from "./catalog.js";
export type { WebModel } from "./catalog.js";
export { cacheStorageStore, memoryStore } from "./store.js";
export type { BlobStore } from "./store.js";
