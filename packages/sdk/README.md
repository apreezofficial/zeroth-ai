# @zeroth-ai/sdk

Run a full AI model inside your app, on-device.

> The core API, types, validation and `Engine` interface. On its own it has no runtime: `zeroth.load()` rejects with `ENGINE_UNAVAILABLE` until an engine is registered. Use [`@zeroth-ai/sdk-node`](../sdk-node/README.md) for a working Node/Electron runtime.

## API

```ts
import { zeroth } from "@zeroth-ai/sdk"

const ai = await zeroth.load("auto")           // or "granite-3b", or { prefer: "quality", ... }

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
└── testing.ts    "@zeroth-ai/sdk/testing" entry (createMockEngine)
```

The public API is engine-agnostic. A native runtime (Metal, CUDA, Vulkan, WebGPU, CPU) implements `Engine` and calls `registerEngine()` on import. Everything above that layer stays the same on every platform.

### Try it without a runtime

```ts
import { createZeroth } from "@zeroth-ai/sdk"
import { createMockEngine } from "@zeroth-ai/sdk/testing"

const ai = await createZeroth(createMockEngine()).load("auto")
console.log(await ai.complete("hello")) // "Echo: hello"
```

## Develop

```bash
npm run build -w @zeroth-ai/sdk
npm run test  -w @zeroth-ai/sdk
```

## Roadmap

- [x] First real engine: llama.cpp for Node (`@zeroth-ai/sdk-node`)
- [x] Hardware probe and model selection
- [x] Resumable, checksum-verified model downloads
- [x] Tool calling (driven by the engine)
- [x] In-browser engine (WebAssembly, preview): `@zeroth-ai/sdk-web`
- [x] iOS and Android through React Native (preview): `@zeroth-ai/sdk-react-native`
- [ ] Native Swift and Kotlin packages
- [x] Published under the `@zeroth-ai` npm org
