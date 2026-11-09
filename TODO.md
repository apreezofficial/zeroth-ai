# Zeroth to-do

Last updated: 2026-11-09

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

- [ ] Decide on the uncommitted `package.json` and `package-lock.json` at the repo root. An earlier install added hundreds of unrelated dependencies and a `main` field. Revert them unless there is a reason to keep them.

## Website and docs

- [ ] Replace the placeholder customers and quotes on `/customers`.
- [ ] Build the "What it can do" page with real recorded examples.
- [ ] Build a terminal-style demo panel using real recordings.
- [ ] Browser WebGPU engine for the in-page playground (not started).
