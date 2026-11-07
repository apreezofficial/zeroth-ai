import type { GenerateOptions, JsonSchema, LoadOptions, Message, ModelInfo, ToolMap } from "./types.js";

/** Generation options as seen by an engine: the public ones plus what the SDK adds. */
export interface EngineGenerateOptions extends GenerateOptions {
  /** Functions the model may call. */
  tools?: ToolMap;
  /** When set, the engine should constrain output to valid JSON for this schema if it can. */
  jsonSchema?: JsonSchema;
}

/** A model that has been resolved, downloaded and is ready to run. */
export interface LoadedModel {
  generate(messages: Message[], options: EngineGenerateOptions): AsyncIterable<string>;
  embed(texts: string[]): Promise<number[][]>;
  dispose(): Promise<void>;
}

/**
 * The inference backend. The SDK's public API is engine-agnostic: native runtimes
 * (Metal, CUDA, Vulkan, WebGPU, CPU) implement this interface and register themselves.
 */
export interface Engine {
  readonly name: string;
  /** Probe the device and choose the best model for these options. */
  resolve(options: LoadOptions): Promise<ModelInfo>;
  /** Download (if needed), verify and load the model. */
  load(model: ModelInfo, options: LoadOptions): Promise<LoadedModel>;
  clearCache?(): Promise<void>;
}
