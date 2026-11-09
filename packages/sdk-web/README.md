# @zeroth-ai/sdk-web

Zeroth in the browser. Runs open-weight models on the user's device with llama.cpp compiled to WebAssembly (through [wllama](https://github.com/ngxson/wllama)). Nothing is sent to a server after the model is downloaded.

**Status: preview.** On npm as `@zeroth-ai/sdk-web`. It has loaded and run `lfm-1b` in a real browser tab: download, SHA-256 check, streaming, JSON output, and a reload from cache with no new download.

```ts
import { zeroth } from "@zeroth-ai/sdk-web"

const ai = await zeroth.load({ model: "auto", onProgress: (p) => console.log(p) })
for await (const token of ai.chat("Hello")) output += token
```

## What works

- `chat()`, `complete()`, `json()` (constrained to your JSON schema) and `tools()`.
- Models are downloaded once, checked against their published SHA-256, and kept in the browser's Cache Storage, so later loads work offline.
- `zeroth.load("auto")` picks `lfm3-1.7b` on devices with enough memory and `lfm-1b` otherwise.

## Limits

- **Only models under 2 GB.** WebAssembly memory is addressed through an `ArrayBuffer`. `lfm-1b` (0.7 GB) and `lfm3-1.7b` (1.1 GB) work. `granite-3b` and `gemma-e2b` do not, and `resolve()` says so. Use `@zeroth-ai/sdk-node` for those.
- **`embed()` is not available**, because the catalogue has no 2026 embedding model.
- **Offline apps must serve the wasm file themselves.** By default the runtime loads `wllama.wasm` from a CDN, which needs a connection the first time. Pass `wasmUrl` to `createWebEngine` to serve it from your own origin.
- **Speed.** Multi-threading needs a cross-origin-isolated page (`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`). Without those headers it runs on one thread.

## Serving the runtime yourself

```ts
import { createWebEngine } from "@zeroth-ai/sdk-web"
import { registerEngine } from "@zeroth-ai/sdk"

registerEngine(createWebEngine({ wasmUrl: "/wllama.wasm" }))
```

Copy `node_modules/@wllama/wllama/esm/wasm/wllama.wasm` to your public folder.
