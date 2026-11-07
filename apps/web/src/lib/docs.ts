export const groups = ["Start here", "Guides", "Reference"] as const;
export type DocGroup = (typeof groups)[number];

export interface DocMeta {
  slug: string;
  title: string;
  group: DocGroup;
  description: string;
  keywords: string[];
  /** Must match the ids of the H2s in the page body. */
  headings: { id: string; title: string }[];
}

export const docs: DocMeta[] = [
  {
    slug: "introduction", title: "Introduction", group: "Start here",
    description: "What Zeroth is, how it works, and what is available today.",
    keywords: ["overview", "what is", "status", "platforms"],
    headings: [{ id: "what-is-zeroth", title: "What is Zeroth" }, { id: "how-it-works", title: "How it works" }, { id: "status", title: "What works today" }],
  },
  {
    slug: "installation", title: "Installation", group: "Start here",
    description: "Requirements and how to install the Node and Desktop runtime.",
    keywords: ["install", "setup", "requirements", "node", "build", "npm"],
    headings: [{ id: "requirements", title: "Requirements" }, { id: "from-the-repo", title: "Install from the repo" }, { id: "try-the-cli", title: "Try the CLI" }, { id: "where-models-live", title: "Where models live" }],
  },
  {
    slug: "quickstart", title: "Quickstart", group: "Start here",
    description: "Load a model, stream a reply and get JSON back in a few lines.",
    keywords: ["getting started", "hello world", "first", "example"],
    headings: [{ id: "load-and-chat", title: "Load and chat" }, { id: "get-json", title: "Get structured JSON" }, { id: "clean-up", title: "Clean up" }],
  },
  {
    slug: "loading-models", title: "Loading models", group: "Guides",
    description: "Pick a model by name or let Zeroth choose one that fits the device.",
    keywords: ["load", "auto", "prefer", "download", "maxDownloadMB", "fallback", "progress", "verify", "checksum"],
    headings: [{ id: "auto-or-named", title: "Auto or named" }, { id: "options", title: "Options" }, { id: "how-auto-picks", title: "How auto picks" }, { id: "first-run-download", title: "The first-run download" }],
  },
  {
    slug: "chat", title: "Chat and streaming", group: "Guides",
    description: "Stream tokens, send message lists, set limits and cancel generation.",
    keywords: ["chat", "stream", "complete", "messages", "temperature", "maxTokens", "abort", "cancel", "context"],
    headings: [{ id: "stream-a-reply", title: "Stream a reply" }, { id: "conversations", title: "Conversations" }, { id: "limits-and-cancel", title: "Limits and cancel" }, { id: "good-to-know", title: "Good to know" }],
  },
  {
    slug: "structured-output", title: "Structured output", group: "Guides",
    description: "Get validated JSON that matches your schema, not text you have to parse.",
    keywords: ["json", "schema", "grammar", "validate", "typed"],
    headings: [{ id: "ask-for-json", title: "Ask for JSON" }, { id: "supported-schema", title: "Supported schema" }, { id: "when-it-fails", title: "When it fails" }],
  },
  {
    slug: "tools", title: "Tools", group: "Guides",
    description: "Let the model call functions in your app, entirely on-device.",
    keywords: ["tools", "function calling", "agents", "parameters"],
    headings: [{ id: "define-a-tool", title: "Define a tool" }, { id: "how-calls-work", title: "How calls work" }, { id: "limits", title: "Limits" }],
  },
  {
    slug: "embeddings", title: "Embeddings", group: "Guides",
    description: "Turn text into vectors for semantic search, all on-device.",
    keywords: ["embed", "vectors", "search", "similarity", "rag"],
    headings: [{ id: "embed-text", title: "Embed text" }, { id: "rank-by-similarity", title: "Rank by similarity" }],
  },
  {
    slug: "offline", title: "Working offline", group: "Guides",
    description: "What touches the network, how to preload models, and air-gapped installs.",
    keywords: ["offline", "air-gapped", "network", "cache", "privacy", "preload", "ZEROTH_HOME"],
    headings: [{ id: "what-uses-the-network", title: "What uses the network" }, { id: "preload", title: "Preload during setup" }, { id: "air-gapped", title: "Air-gapped machines" }, { id: "clearing-the-cache", title: "Clearing the cache" }],
  },
  {
    slug: "cli", title: "Command line", group: "Reference",
    description: "The zeroth CLI: check hardware, pull models, run prompts and chat.",
    keywords: ["cli", "terminal", "commands", "pull", "run", "chat", "models"],
    headings: [{ id: "commands", title: "Commands" }, { id: "options", title: "Options" }, { id: "examples", title: "Examples" }],
  },
  {
    slug: "models", title: "Models and licences", group: "Reference",
    description: "Every model Zeroth can run, its size, memory needs and licence.",
    keywords: ["models", "licence", "license", "llama", "qwen", "nomic", "size", "memory", "vision"],
    headings: [{ id: "catalogue", title: "Catalogue" }, { id: "memory", title: "Memory needs" }, { id: "licences", title: "Licences" }],
  },
  {
    slug: "errors", title: "Errors", group: "Reference",
    description: "Every error code the SDK throws, what causes it and how to fix it.",
    keywords: ["error", "ZerothError", "code", "ABORTED", "INSUFFICIENT_MEMORY", "CHECKSUM_MISMATCH", "troubleshooting"],
    headings: [{ id: "handling-errors", title: "Handling errors" }, { id: "codes", title: "Error codes" }],
  },
  {
    slug: "api", title: "API reference", group: "Reference",
    description: "Every method and option in @zeroth/sdk.",
    keywords: ["api", "reference", "methods", "options", "types", "LoadOptions", "GenerateOptions"],
    headings: [{ id: "zeroth", title: "zeroth" }, { id: "instance", title: "The loaded model" }, { id: "load-options", title: "LoadOptions" }, { id: "generate-options", title: "GenerateOptions" }],
  },
  {
    slug: "faq", title: "FAQ", group: "Reference",
    description: "Common questions about privacy, size, platforms and licensing.",
    keywords: ["faq", "questions", "privacy", "internet", "licence"],
    headings: [{ id: "questions", title: "Questions" }],
  },
];

export const bySlug = (slug: string) => docs.find((d) => d.slug === slug);

export function neighbours(slug: string) {
  const i = docs.findIndex((d) => d.slug === slug);
  return { prev: i > 0 ? docs[i - 1] : undefined, next: i >= 0 && i < docs.length - 1 ? docs[i + 1] : undefined };
}

export function search(q: string): DocMeta[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const score = (d: DocMeta) => {
    if (d.title.toLowerCase().includes(needle)) return 3;
    if (d.keywords.some((k) => k.toLowerCase().includes(needle))) return 2;
    if (d.description.toLowerCase().includes(needle) || d.headings.some((h) => h.title.toLowerCase().includes(needle))) return 1;
    return 0;
  };
  return docs.map((d) => [d, score(d)] as const).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).map(([d]) => d);
}
