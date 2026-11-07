/** Models Zeroth ships. Mirrors the catalogue on the website. */
export type ModelId =
  | "lfm-1b"
  | "lfm3-1.7b"
  | "granite-3b"
  | "gemma-e2b";

/** What to optimise for when picking a model automatically. */
export type Preference = "quality" | "speed" | "battery";

export interface LoadOptions {
  /** A specific model, or "auto" to let Zeroth pick for the device. Default: "auto". */
  model?: ModelId | "auto";
  prefer?: Preference;
  /** Never pick a model whose download exceeds this size. */
  maxDownloadMB?: number;
  /** Model to use if nothing else fits the device. */
  fallback?: ModelId;
  /** Called with 0..1 while a model downloads on first launch. */
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

export type Role = "system" | "user" | "assistant";

export interface Message {
  role: Role;
  content: string;
}

export type Input = string | Message[];

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

/** A small subset of JSON Schema, enough for validated structured output. */
export interface JsonSchema {
  type?: "object" | "array" | "string" | "number" | "integer" | "boolean" | "null";
  properties?: Record<string, JsonSchema>;
  required?: readonly string[];
  items?: JsonSchema;
  enum?: readonly unknown[];
}

export interface ToolDefinition<Args = Record<string, unknown>> {
  description: string;
  /** JSON Schema for the arguments the model should pass. Omit for tools that take none. */
  parameters?: JsonSchema;
  run(args: Args): unknown | Promise<unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToolMap = Record<string, ToolDefinition<any>>;

export interface ModelInfo {
  id: ModelId;
  /** Display name including quantisation, e.g. "granite-3b-q4". */
  name: string;
  params: string;
  sizeMB: number;
}

/** A loaded model. Everything here runs on the user's device. */
export interface Zeroth {
  readonly model: ModelInfo;
  /** True while a model is loaded and usable. */
  readonly ready: boolean;
  /** Stream tokens for a prompt or message list. */
  chat(input: Input, options?: GenerateOptions): AsyncIterable<string>;
  /** Full response as one string. */
  complete(input: Input, options?: GenerateOptions): Promise<string>;
  /** Response parsed as JSON and validated against `schema`. */
  json<T = unknown>(input: Input, schema: JsonSchema, options?: GenerateOptions): Promise<T>;
  /** One embedding vector per input string. */
  embed(texts: string[]): Promise<number[][]>;
  /** Register functions the model may call. Replaces the previous set. */
  tools(defs: ToolMap): void;
  /** Free model memory. The instance cannot be used afterwards. */
  unload(): Promise<void>;
}
