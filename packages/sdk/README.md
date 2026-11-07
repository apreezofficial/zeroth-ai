# @zeroth/sdk

Run a full AI model inside your app, on-device.

> **Status: scaffold.** The API, types, validation and test harness are real. The inference runtime is not built yet, so `zeroth.load()` rejects with `ENGINE_UNAVAILABLE` unless an engine is registered.

## API

```ts
import { zeroth } from "@zeroth/sdk"

const ai = await zeroth.load("auto")           // or "core-8b", or { prefer: "quality", ... }

for await (const token of ai.chat("Plan my day")) ui.append(token)

const text = await ai.complete("Explain WebGPU in one line.")
const task = await ai.json("Create a task from: call Sam Friday", schema)
const [a, b] = await ai.embed(["invoice", "billing"])

ai.tools({ searchNotes: { description: "Search notes", run: ({ query }) => db.search(query) } })
await ai.unload()
```

Errors are `ZerothError` with a `code`: `ENGINE_UNAVAILABLE`, `NOT_LOADED`, `INVALID_JSON`, `SCHEMA_MISMATCH`, `ABORTED`.

## Architecture

```
src/
├── index.ts      public exports
├── zeroth.ts     load(), the Zeroth instance, engine registry
├── engine.ts     Engine / LoadedModel: the interface a runtime implements
├── types.ts      public types (LoadOptions, Message, ModelId, ...)
├── validate.ts   JSON extraction and schema validation for json()
├── errors.ts     ZerothError
├── mock.ts       in-memory engine for tests and demos
└── testing.ts    "@zeroth/sdk/testing" entry (createMockEngine)
```

The public API is engine-agnostic. A native runtime (Metal, CUDA, Vulkan, WebGPU, CPU) implements `Engine` and calls `registerEngine()` on import. Everything above that layer stays the same on every platform.

### Try it without a runtime

```ts
import { createZeroth } from "@zeroth/sdk"
import { createMockEngine } from "@zeroth/sdk/testing"

const ai = await createZeroth(createMockEngine()).load("auto")
console.log(await ai.complete("hello")) // "Echo: hello"
```

## Develop

```bash
npm run build -w @zeroth/sdk
npm run test  -w @zeroth/sdk
```

## Roadmap

- [ ] First real engine (pick a target: WebGPU or llama.cpp bindings)
- [ ] Hardware probe and model selection in `resolve()`
- [ ] Resumable, checksum-verified model downloads
- [ ] Tool calling loop (the `tools()` registry is stored but not yet driven)
- [ ] Platform packages: Swift, Kotlin
- [ ] Remove `"private": true` and publish
