# Zeroth to-do

Last updated: 2026-11-09 (web and React Native previews added)

## ze-code (dev-only code model)

Status: planning. Nothing downloaded or installed for training yet.

- [ ] Confirm the Python 3.12 install from Homebrew finished (`python@3.12`).
- [ ] Install `mlx-lm` into a virtualenv outside the repo.
- [ ] Get approval, then download the base model `ibm-granite/granite-4.2-3b` (Apache-2.0, about 6 GB). Verify its hashes before use.
- [ ] Pick and document the code training set (source, licence, size). Get approval before downloading it.
- [ ] Clean the data and split off a held-out evaluation set.
- [ ] Run a LoRA / QLoRA fine-tune on the M1 (8 GB unified memory). Record time, memory and loss.
- [ ] Evaluate on the held-out set and record results in this file.
- [ ] Export to GGUF and check that the file loads with `node-llama-cpp`.
- [ ] Add `ze-code` to the catalogue, marked dev-only, with its SHA-256, size and licence.
- [ ] Label it "in development" on the site and in the docs.

## General model fine-tune (later)

- [ ] Fine-tune a general-purpose model on our own data (option 2 from the planning notes).

## Catalogue and downloads

- [ ] Load-test `lfm3-1.7b`, `granite-3b` and `gemma-e2b`. Hashes match Hugging Face, but none has been run yet.
- [ ] Measure speed and memory for each model, then replace "Not yet measured" on the site.
- [ ] Find a 2026 embedding model, since the catalogue has none and `embed()` is unavailable.
- [ ] Optional: delete the partial `LFM3-1.7B-Q4_K_M.gguf.part` (about 400 MB) in `~/Library/Caches/zeroth/models/`.

## Repo cleanup

- [x] Root `package.json` and lockfile cleaned: the stray dependencies from an earlier install were reverted (a copy is kept outside the repo).

## Website and docs

- [ ] Replace the placeholder customers and quotes on `/customers`.
- [ ] Build the "What it can do" page with real recorded examples.
- [ ] Build a terminal-style demo panel using real recordings.
- [ ] In-page playground on the site that runs `lfm-1b` in the visitor's browser with `@zeroth-ai/sdk-web` (the engine works; the page needs the wasm file hosted and a download-size warning).

## Publishing (needs the npm owner)

- [ ] **The published 0.1.0 packages still have the old model catalogue** (Llama 3.x, Qwen2.5). `npm i @zeroth-ai/sdk-node` installs those until 0.1.1 is out. Versions are already bumped in the repo.
- [ ] Publish in this order: `@zeroth-ai/sdk` 0.1.1, then `@zeroth-ai/sdk-node` 0.1.1, then `@zeroth-ai/sdk-web` 0.1.0 and `@zeroth-ai/sdk-react-native` 0.1.0.
- [ ] Set up a second 2FA method on GitHub (GitHub is warning about SMS-only).

## Web runtime (`@zeroth-ai/sdk-web`)

- [x] Engine, verified downloads, Cache Storage, JSON and tools, 16 unit tests.
- [x] Real-browser run of `lfm-1b`: load, answer, JSON output, offline reload from cache (2.0 s, no new download).
- [ ] Browser-test `lfm3-1.7b`, and measure real tokens per second on the Mac and on a phone browser.
- [ ] Support `granite-3b` and `gemma-e2b` by splitting the GGUF into shards under 2 GB.
- [ ] Resume interrupted downloads (currently restarts).

## React Native runtime (`@zeroth-ai/sdk-react-native`)

- [x] Engine, verified downloads, JSON and tools, 16 unit tests against a mock `llama.rn`.
- [ ] **Run it on a real iPhone and Android phone.** It has never run on a device.
- [ ] Resume interrupted downloads (currently restarts).
- [ ] Add an example app in `apps/` that exercises load, chat and JSON on a device.

## Shared

- [ ] Move the model table (ids, URLs, hashes, sizes) into one shared package. It is copied into `sdk-node`, `sdk-web` and `sdk-react-native` today.
- [ ] Find a 2026 embedding model so `embed()` works on every runtime.
