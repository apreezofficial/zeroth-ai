# Zeroth

On-device AI for any app. One SDK runs a full language model on the user's device: no servers, no API keys, no per-token bill.

This repo is a small monorepo (npm workspaces).

```
zeroth/
├── apps/
│   └── web/            @zeroth-ai/web  — the marketing site and docs (Next.js, Tailwind)
├── packages/
│   ├── sdk/            @zeroth-ai/sdk       — core API, types, engine interface (no native code)
│   ├── sdk-node/       @zeroth-ai/sdk-node  — real runtime for Node/Electron: llama.cpp, CLI
│   ├── sdk-web/        @zeroth-ai/sdk-web   — browser runtime: llama.cpp on WebAssembly (preview)
│   └── sdk-react-native/ @zeroth-ai/sdk-react-native — iOS and Android via llama.rn (preview)
├── tsconfig.base.json  shared TypeScript settings for packages
└── package.json        workspace root and scripts
```

## Quick start

Requires Node 20.11 or newer.

```bash
npm install
npm run dev          # site on http://localhost:3000
```

## Scripts (run from the repo root)

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the website in dev mode |
| `npm run build` | Build the SDK, then the website |
| `npm run build:sdk` / `build:web` | Build one package |
| `npm test` | Run all tests (SDK) |
| `npm run typecheck` | Type-check every workspace |
| `npm run lint` | Lint every workspace |

Target one workspace with `-w`, for example `npm run test -w @zeroth-ai/sdk`.

## Try it

```bash
npm install && npm run build
npm run cli -- models              # which models fit this machine
npm run cli -- pull lfm-1b        # download + verify (0.8 GB, once)
npm run cli -- chat                # chat fully offline
```

## Status

- **`@zeroth-ai/sdk-node` works.** It runs real open-weight models locally (Metal, CUDA, Vulkan, CPU) with streaming, grammar-constrained JSON, tool calling, embeddings, abort, and resumable SHA-256-verified downloads. See [`packages/sdk-node/README.md`](packages/sdk-node/README.md).
- **`@zeroth-ai/sdk-web` is a preview.** It runs llama.cpp on WebAssembly and has loaded and run a real model (`lfm-1b`) in a browser, including JSON output and an offline reload from cache. Only models under 2 GB work in a tab (`lfm-1b`, `lfm3-1.7b`). Not published yet.
- **`@zeroth-ai/sdk-react-native` is a preview.** The engine is complete and passes its tests against a mock `llama.rn`, but it has **not run on a real iOS or Android device yet**. Not published yet.
- **Website** is a working landing site plus docs, with placeholder customer quotes and stats. Forms are not connected to a backend.
- Both packages are **publish-ready** under the `@zeroth-ai` npm org but **not published yet**. See [Publishing](#publishing).

See [`packages/sdk/README.md`](packages/sdk/README.md) for the core API design and roadmap.

## Publishing

Packages live under the [`@zeroth-ai`](https://www.npmjs.com/org/zeroth-ai) npm org. Publish the core first, because `@zeroth-ai/sdk-node` depends on it.

```bash
npm login                                   # as the org owner
npm publish -w @zeroth-ai/sdk               # prepublishOnly builds and tests first
npm publish -w @zeroth-ai/sdk-node
```

- npm asks for a one-time code if 2FA is on (`--otp=123456`). Turn 2FA on for the account and consider enforcing it for the org.
- Bump `version` in each package before every release. `@zeroth-ai/sdk-node` depends on `@zeroth-ai/sdk` by range (`^0.1.0`).
- No `LICENSE` is set yet, so by default all rights are reserved. Add one (and a `"license"` field) before publishing if you want others to use the code.
- After publishing, update the install notes in `apps/web/src/lib/docs-content.tsx` and the READMEs to say `npm i @zeroth-ai/sdk-node`.
- Check what ships with `npm pack -w <package> --dry-run`.

