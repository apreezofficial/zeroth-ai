import type { Engine, LoadedModel } from "./engine.js";
import type { EngineGenerateOptions } from "./engine.js";
import { ZerothError } from "./errors.js";
import type {
  GenerateOptions,
  Input,
  JsonSchema,
  LoadOptions,
  Message,
  ModelId,
  ModelInfo,
  ToolMap,
  Zeroth,
} from "./types.js";
import { extractJson, validate } from "./validate.js";

const toMessages = (input: Input): Message[] =>
  typeof input === "string" ? [{ role: "user", content: input }] : input;

class Instance implements Zeroth {
  #loaded: LoadedModel | null;
  #tools: ToolMap = {};
  readonly model: ModelInfo;

  constructor(model: ModelInfo, loaded: LoadedModel) {
    this.model = model;
    this.#loaded = loaded;
  }

  get ready(): boolean {
    return this.#loaded !== null;
  }

  #model(): LoadedModel {
    if (!this.#loaded) throw new ZerothError("NOT_LOADED", "This model has been unloaded. Call zeroth.load() again.");
    return this.#loaded;
  }

  async *#stream(
    messages: Message[],
    options: GenerateOptions,
    extra: Pick<EngineGenerateOptions, "jsonSchema">,
  ): AsyncIterable<string> {
    const model = this.#model();
    const opts: EngineGenerateOptions = { ...options, ...extra, tools: this.#tools };
    for await (const token of model.generate(messages, opts)) {
      if (options.signal?.aborted) break;
      yield token;
    }
    if (options.signal?.aborted) throw new ZerothError("ABORTED", "Generation was aborted.");
  }

  chat(input: Input, options: GenerateOptions = {}): AsyncIterable<string> {
    return this.#stream(toMessages(input), options, {});
  }

  async complete(input: Input, options?: GenerateOptions): Promise<string> {
    let out = "";
    for await (const token of this.chat(input, options)) out += token;
    return out;
  }

  async json<T = unknown>(input: Input, schema: JsonSchema, options?: GenerateOptions): Promise<T> {
    const messages = toMessages(input);
    const instruction: Message = {
      role: "system",
      content: `Reply with only JSON that matches this schema: ${JSON.stringify(schema)}`,
    };
    let text = "";
    for await (const token of this.#stream([instruction, ...messages], options ?? {}, { jsonSchema: schema })) {
      text += token;
    }

    let value: unknown;
    try {
      value = extractJson(text);
    } catch (cause) {
      throw new ZerothError("INVALID_JSON", "The model did not return valid JSON.", { cause });
    }

    const problems = validate(schema, value);
    if (problems.length) {
      throw new ZerothError("SCHEMA_MISMATCH", `Output did not match the schema: ${problems.join("; ")}`);
    }
    return value as T;
  }

  async embed(texts: string[]): Promise<number[][]> {
    return this.#model().embed(texts);
  }

  tools(defs: ToolMap): void {
    this.#tools = { ...defs };
  }

  async unload(): Promise<void> {
    const loaded = this.#loaded;
    this.#loaded = null;
    await loaded?.dispose();
  }
}

const unavailable: Engine = {
  name: "unavailable",
  async resolve() {
    throw new ZerothError(
      "ENGINE_UNAVAILABLE",
      "No inference engine is registered yet. The Zeroth runtime is not available in this build.",
    );
  },
  async load() {
    throw new ZerothError("ENGINE_UNAVAILABLE", "No inference engine is registered.");
  },
};

export interface ZerothApi {
  /** Load (and download on first run) a model. Pass "auto" or a model id, or full options. */
  load(options?: LoadOptions | ModelId | "auto"): Promise<Zeroth>;
  /** Remove downloaded models from this device. */
  clearCache(): Promise<void>;
}

/** Bind the public API to an engine. Most apps use the default `zeroth` export instead. */
export function createZeroth(engine: Engine): ZerothApi {
  return {
    async load(options = {}) {
      const opts: LoadOptions = typeof options === "string" ? { model: options } : options;
      const info = await engine.resolve(opts);
      const loaded = await engine.load(info, opts);
      return new Instance(info, loaded);
    },
    async clearCache() {
      await engine.clearCache?.();
    },
  };
}

let current: Engine = unavailable;

/** Register the engine used by the default `zeroth` object. Runtimes call this on import. */
export function registerEngine(engine: Engine): void {
  current = engine;
}

export const zeroth: ZerothApi = {
  load: (options) => createZeroth(current).load(options),
  clearCache: () => createZeroth(current).clearCache(),
};
