# Zeroth

On-device AI for any app. One SDK runs a full language model on the user's device: no servers, no API keys, no per-token bill.

This repo is a small monorepo (npm workspaces).

```
zeroth/
├── apps/
│   └── web/            @zeroth/web  — the marketing site and docs (Next.js, Tailwind)
├── packages/
│   ├── sdk/            @zeroth/sdk       — core API, types, engine interface (no native code)
│   └── sdk-node/       @zeroth/sdk-node  — real runtime for Node/Electron: llama.cpp, CLI
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

Target one workspace with `-w`, for example `npm run test -w @zeroth/sdk`.

## Try it

```bash
npm install && npm run build
npm run cli -- models              # which models fit this machine
npm run cli -- pull nano-1b        # download + verify (0.8 GB, once)
npm run cli -- chat                # chat fully offline
```

## Status

- **`@zeroth/sdk-node` works.** It runs real open-weight models locally (Metal, CUDA, Vulkan, CPU) with streaming, grammar-constrained JSON, tool calling, embeddings, abort, and resumable SHA-256-verified downloads. See [`packages/sdk-node/README.md`](packages/sdk-node/README.md).
- **iOS, Android and in-browser runtimes are not built yet.** The docs and site show the API they will expose.
- **Website** is a working landing site plus docs, with placeholder customer quotes and stats. Forms are not connected to a backend.
- Packages are marked `"private": true` so nothing is published by accident.

See [`packages/sdk/README.md`](packages/sdk/README.md) for the core API design and roadmap.
