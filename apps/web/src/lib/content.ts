import type { Block } from "@/components/Blocks";

const b = (i: number, j: number, k: number, c: Block["c"]): Block => ({ i, j, k, c });

export type Feature = {
  slug: "embed" | "adapt" | "ship";
  tag: string;
  title: string;
  lead: string;
  icon: Block[];
  steps: { t: string; b: string }[];
  file: string;
  code: string;
  points: { t: string; b: string }[];
  next: Feature["slug"];
};

export const features: Feature[] = [
  {
    slug: "embed",
    tag: "EMBED",
    title: "Embed a model in three lines.",
    lead: "Load a full language model inside your app and stream tokens straight from the user’s device. No server to run, no API key to leak, no per-token bill.",
    icon: [b(0, 0, 0, "blue"), b(1, 0, 0, "blue"), b(0, 1, 0, "indigo"), b(0, 0, 1, "teal"), b(1, 0, 1, "blue"), b(0, 0, 2, "purple")],
    steps: [
      { t: "Install", b: "Add the SDK with your package manager. It ships the runtime, not the model." },
      { t: "Load", b: "Call load() once. The first run downloads a model, every run after that is instant and offline." },
      { t: "Chat", b: "Stream tokens, ask for JSON, call tools or compute embeddings from one small API." },
    ],
    file: "chat.ts",
    code: `import { zeroth } from "@zeroth-ai/sdk"

const ai = await zeroth.load("auto")

for await (const token of ai.chat("Summarise my notes")) {
  ui.append(token) // streams on-device
}`,
    points: [
      { t: "Streaming by default", b: "Tokens arrive as they are generated, so interfaces feel instant." },
      { t: "Structured output", b: "Ask for JSON that matches a schema and get validated objects back." },
      { t: "Tool calling", b: "Let the model call functions in your app, all without leaving the device." },
      { t: "Embeddings built in", b: "Semantic search over local documents with the same runtime." },
    ],
    next: "adapt",
  },
  {
    slug: "adapt",
    tag: "ADAPT",
    title: "Right-size the model for every device.",
    lead: "A flagship laptop and a three-year-old phone should not run the same model. Zeroth reads the hardware, picks the best fit from 1B to 3B parameters, and caches it locally.",
    icon: [b(0, 0, 0, "indigo"), b(1, 0, 0, "purple"), b(0, 0, 1, "purple"), b(1, 0, 1, "blue"), b(0, 0, 2, "teal"), b(1, 0, 2, "purple")],
    steps: [
      { t: "Probe", b: "On first launch we measure memory, GPU and NPU support in a few milliseconds." },
      { t: "Select", b: "The best quantised model that fits comfortably is chosen. You can pin a model any time." },
      { t: "Cache", b: "It downloads once, verifies its checksum, and lives on disk for offline use." },
    ],
    file: "models.ts",
    code: `const ai = await zeroth.load({
  prefer: "quality",       // or "speed" | "battery"
  maxDownloadMB: 2500,
  fallback: "lfm-1b",
})

console.log(ai.model.name) // "granite-3b-q4"`,
    points: [
      { t: "Hardware aware", b: "Metal, CUDA, Vulkan, WebGPU and CPU paths, chosen automatically." },
      { t: "Quantised for size", b: "4-bit builds keep quality high while staying small enough to ship." },
      { t: "Pin or auto", b: "Let Zeroth decide, or lock a specific model for reproducible behaviour." },
      { t: "Resumable downloads", b: "Flaky connection? Model downloads pick up where they stopped." },
    ],
    next: "ship",
  },
  {
    slug: "ship",
    tag: "SHIP",
    title: "One API. Every platform.",
    lead: "Write your AI feature once. The same calls run on iOS, Android, Web and Desktop, so every user gets private AI with zero backend for you to operate.",
    icon: [b(0, 0, 0, "teal"), b(1, 0, 0, "blue"), b(0, 1, 0, "teal"), b(0, 0, 1, "indigo"), b(1, 0, 1, "teal"), b(0, 0, 2, "blue")],
    steps: [
      { t: "Add the package", b: "One npm package per runtime: Node and Desktop, Web, and React Native for iOS and Android." },
      { t: "Wire one call", b: "Use the same chat(), json() and tools() calls on every runtime." },
      { t: "Release", b: "No servers to scale. Your AI feature costs the same at ten users or ten million." },
    ],
    file: "App.tsx",
    code: `import { zeroth } from "@zeroth-ai/sdk-react-native"

const ai = await zeroth.load("auto")

for await (const token of ai.chat("Plan my day")) {
  setText((t) => t + token)
}`,
    points: [
      { t: "iOS and Android", b: "A React Native package on llama.cpp. In preview, not yet tested on a device." },
      { t: "In the browser", b: "llama.cpp on WebAssembly. Runs a real model in a tab today, in preview." },
      { t: "Desktop ready", b: "Node, Electron and Tauri sidecars share one engine. Available on npm." },
      { t: "Models download once", b: "0.7 to 3.4 GB, verified by SHA-256, then cached for offline use." },
    ],
    next: "embed",
  },
];

export const models = [
  { id: "lfm-1b", params: "1.2B", size: "0.7 GB", ram: "2 GB", speed: "≈70 tok/s on a flagship phone (reported)", status: "available", tier: "Phones", best: "Short replies, classification, quick Q&A", platforms: "iOS · Android · Web · Desktop" },
  { id: "lfm3-1.7b", params: "1.7B", size: "1.1 GB", ram: "3 GB", speed: "≈44 tok/s on iPhone 17 Pro (reported)", status: "available", tier: "Phones", best: "Chat and rewriting on mid-range phones", platforms: "iOS · Android · Web · Desktop" },
  { id: "granite-3b", params: "3B", size: "2.2 GB", ram: "5 GB", speed: "≈43 tok/s on M1 Pro (estimate)", status: "available", tier: "Laptops", best: "General chat, summaries, tool use", platforms: "Web · Desktop · iPad" },
  { id: "gemma-e2b", params: "2B effective", size: "3.4 GB", ram: "6 GB", speed: "12–20 tok/s on recent Snapdragon (reported)", status: "available", tier: "Phones", best: "Quantisation-aware 4-bit build for small devices", platforms: "Desktop · Web" },
  { id: "ze-code", params: "3B (planned)", size: "—", ram: "—", speed: "—", status: "in development", tier: "Laptops", best: "Code completion and explanation, trained by Zeroth", platforms: "Desktop · Web (planned)" },
] as const;

export const platforms = [
  {
    id: "web",
    label: "Web",
    file: "app.ts",
    status: "preview",
    install: `Preview: in the repo, not on npm yet.`,
    note: "Web runs llama.cpp on WebAssembly. It has loaded and run a real model in a browser. Models over 2 GB (granite-3b, gemma-e2b) are Node and Desktop only for now.",
    code: `import { zeroth } from "@zeroth-ai/sdk-web"

const ai = await zeroth.load("auto")

for await (const token of ai.chat("Summarise this note")) {
  el.textContent += token
}`,
  },
  {
    id: "mobile",
    label: "iOS · Android",
    file: "App.tsx",
    status: "preview",
    install: `Preview: in the repo, not on npm yet.`,
    note: "iOS and Android use React Native with llama.rn. The engine passes its tests against a mock runtime and has not run on a real phone yet.",
    code: `import { zeroth } from "@zeroth-ai/sdk-react-native"

const ai = await zeroth.load("auto")

for await (const token of ai.chat("Summarise this note")) {
  setSummary((s) => s + token)
}`,
  },
  {
    id: "desktop",
    label: "Desktop",
    file: "main.ts",
    status: "available",
    install: `npm i @zeroth-ai/sdk-node`,
    note: "",
    code: `import { zeroth } from "@zeroth-ai/sdk-node"

const ai = await zeroth.load({ prefer: "quality" })

ipcMain.handle("ask", (_e, q) => ai.complete(q))`,
  },
] as const;

export const works = ["React", "Next.js", "SwiftUI", "Jetpack Compose", "Flutter", "React Native", "Electron", "Tauri"];

export const docsNav = [
  { group: "Start here", items: [["Introduction", "introduction"], ["Installation", "installation"], ["Quickstart", "quickstart"]] },
  { group: "Core concepts", items: [["Loading models", "loading-models"], ["Chat and streaming", "chat"], ["Structured output", "structured-output"], ["Embeddings", "embeddings"]] },
  { group: "Going further", items: [["Tools", "tools"], ["Working offline", "offline"], ["API reference", "api"], ["FAQ", "faq"]] },
] as const;
