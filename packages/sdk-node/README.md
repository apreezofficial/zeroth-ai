# @zeroth-ai/sdk-node

Run AI models on the user's machine from Node, Electron or a Tauri sidecar. Powered by [llama.cpp](https://github.com/ggml-org/llama.cpp) through [node-llama-cpp](https://node-llama-cpp.withcat.ai), with Metal, CUDA, Vulkan and CPU backends.

After the first model download, nothing touches the network.

```ts
import { zeroth } from "@zeroth-ai/sdk-node"

const ai = await zeroth.load("auto")      // picks a model that fits this machine

for await (const token of ai.chat("Plan my day")) process.stdout.write(token)
```

Importing the package registers the engine, so the whole `@zeroth-ai/sdk` API works: `chat`, `complete`, `json`, `embed`, `tools`, `unload`.

## CLI

```bash
npm run build                                  # from the repo root
npm run cli -- models                          # what fits this machine
npm run cli -- pull lfm-1b                    # download + verify a model
npm run cli -- run "Explain WebGPU in one line"
npm run cli -- run "Task: email Priya by Friday" --json '{"type":"object","properties":{"title":{"type":"string"}},"required":["title"]}'
npm run cli -- chat
```

## What it does

| Feature | How |
| --- | --- |
| **Model selection** | Probes RAM and GPU, then picks the largest model that fits (`prefer: "quality"`), the ≤3B tier (`"speed"`) or the smallest (`"battery"`). Honours `maxDownloadMB` and `fallback`. Cached models cost no download. |
| **Downloads** | Resumable (HTTP Range), retried on network errors, SHA-256 verified before use, atomic rename. Corrupt files are deleted. |
| **Streaming** | Async iterable of text chunks. `AbortSignal` stops generation within a token. |
| **Structured output** | `ai.json(prompt, schema)` is grammar-constrained, so the model can only emit valid JSON for your schema, then validated again. |
| **Tools** | `ai.tools({ name: { description, parameters, run } })` is driven by the model. Tool errors are returned to the model, not thrown. |
| **Embeddings** | Not available yet: the 2026 catalogue has no embedding model. |
| **Concurrency** | Requests to one model are queued; each call re-evaluates its own history so state never leaks. |

## Models

Open-weight models, quantised to 4-bit (GGUF). Check each upstream license before you ship.

| id | upstream | download | license |
| --- | --- | --- | --- |
| `lfm-1b` | LFM2.5 1.2B Instruct | 0.7 GB | LFM Open License |
| `lfm3-1.7b` | LFM3 1.7B | 1.1 GB | LFM Open License |
| `granite-3b` | Granite 4.2 3B | 2.2 GB | Apache 2.0 |
| `gemma-e2b` | Gemma 4 E2B (QAT 4-bit) | 3.4 GB | Apache 2.0 |

`vision-8b` is not available yet: the llama.cpp bindings used here have no image input.

Models are stored in `~/Library/Caches/zeroth` (macOS), `~/.cache/zeroth` (Linux) or `%LOCALAPPDATA%\zeroth` (Windows). Override with `ZEROTH_HOME`.

## Develop

```bash
npm run build -w @zeroth-ai/sdk-node
npm run test  -w @zeroth-ai/sdk-node                          # unit tests, no model needed
ZEROTH_E2E=1 npm run test -w @zeroth-ai/sdk-node              # real-model tests (downloads ~0.9 GB once)
```

## Known limits

- Each generation re-reads its conversation history (no prompt cache between calls yet).
- A grammar and tool calling cannot be combined in one call (llama.cpp limitation), so `json()` ignores registered tools.
- Tool calling quality depends on the model; small models call tools less reliably.
- Context window is 4096 tokens by default (`createLlamaEngine({ contextSize })`).
