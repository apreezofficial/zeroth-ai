# @zeroth-ai/sdk-react-native

Zeroth for React Native on iOS and Android. Runs open-weight models on the phone with llama.cpp through [llama.rn](https://github.com/mybigday/llama.rn). Nothing is sent to a server after the model is downloaded.

**Status: preview, not tested on a device.** The engine is complete and passes 16 tests against a mock `llama.rn` and a fake file system. It has **not been run on a real iPhone or Android phone yet**, and it is a preview on npm. Treat the first device run as the real test.

```tsx
import { zeroth } from "@zeroth-ai/sdk-react-native"

const ai = await zeroth.load({ model: "auto", onProgress: (p) => setProgress(p) })
for await (const token of ai.chat("Hello")) setText((t) => t + token)
```

## Install

Install the peer dependencies and link them as their READMEs describe:

```bash
npm i llama.rn react-native-fs
cd ios && pod install
```

## What it does

- `chat()`, `complete()`, `json()` (constrained to your JSON schema) and `tools()`.
- Downloads the model once to the app's documents folder, checks its SHA-256, and only then marks it ready. A half-finished download is never loaded.
- Works with all four catalogue models. Memory is the limit on phones: by default the engine assumes 4 GB of device memory and uses up to half of it, so `auto` picks `lfm3-1.7b`. Pass `deviceMemoryBytes` (for example from `react-native-device-info`) to unlock larger models:

```ts
import { createMobileEngine } from "@zeroth-ai/sdk-react-native"
import { registerEngine } from "@zeroth-ai/sdk"

registerEngine(createMobileEngine({ deviceMemoryBytes: 8 * 1024 ** 3 }))
```

## Limits

- Not run on a device yet (see above).
- `embed()` is not available, because the catalogue has no 2026 embedding model.
- Downloads restart from zero if interrupted. They do not resume.
