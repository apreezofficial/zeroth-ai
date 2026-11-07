# Zeroth

On-device AI for any app. One SDK runs a full language model on the user's device: no servers, no API keys, no per-token bill.

This repo is a small monorepo (npm workspaces).

```
zeroth/
├── apps/
│   └── web/            @zeroth/web  — the marketing site and docs (Next.js, Tailwind)
├── packages/
│   └── sdk/            @zeroth/sdk  — the SDK (TypeScript)
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

## Status

- **Website** is a working landing site plus docs, with placeholder copy and stats. Forms are not connected to a backend yet.
- **SDK** is a typed scaffold: the public API from the docs, a pluggable `Engine` interface, schema validation for `json()`, and a mock engine for tests. There is **no real inference engine yet**, so `zeroth.load()` throws `ENGINE_UNAVAILABLE` until one is registered.
- `@zeroth/sdk` is marked `"private": true` so it cannot be published by accident. Remove that when you are ready to release.

See [`packages/sdk/README.md`](packages/sdk/README.md) for the SDK design and roadmap.
