import Link from "next/link";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/Interactive";
import { Callout, Fields, H2 } from "@/components/docs/ui";

const code = (src: string, file: string) => <CodeBlock code={src} file={file} className="mt-5" />;

const faq: [string, string][] = [
  ["Does it need the internet?", "Only once per model, to download it. After that every call runs on the device with no network access."],
  ["Do I need an API key or an account?", "No. There is nothing to sign up for and nothing to authenticate. The SDK talks to no Zeroth server."],
  ["Is user data sent anywhere?", "No. Prompts, files and outputs stay in your process. The only network request the SDK ever makes is the model download."],
  ["Which platforms work today?", "Node and desktop apps (Electron, Tauri sidecars) work today. A browser runtime (WebAssembly) and a React Native runtime for iOS and Android are previews in the repo, not on npm yet."],
  ["Which models does it run?", "Open-weight models in GGUF form: LFM2.5 1.2B, LFM3 1.7B, Granite 4.2 3B and Gemma 4 E2B. There is no embedding model yet. See Models and licences."],
  ["Can I ship it in a commercial product?", "The SDK code is yours to license. Each model carries its own upstream licence, so read it before you ship. We list them on the models page."],
  ["How much memory does it need?", "About 1.4 GB for lfm-1b and 3.3 GB for granite-3b. Zeroth checks your machine and will not auto-pick a model that does not fit."],
];

export const bodies: Record<string, () => ReactNode> = {
  introduction: () => (
    <>
      <H2 id="what-is-zeroth">What is Zeroth</H2>
      <p>
        Zeroth is an SDK that runs a language model <strong>inside your app, on the user’s device</strong>. There is no server to host,
        no API key to protect and no per-token bill. Prompts and answers never leave the machine.
      </p>
      <p>You call a small, typed API. Zeroth picks a model that fits the hardware, downloads it once, and streams answers from local memory.</p>
      {code(`import { zeroth } from "@zeroth-ai/sdk-node"

const ai = await zeroth.load("auto")

for await (const token of ai.chat("Plan my day")) {
  process.stdout.write(token)
}`, "app.ts")}

      <H2 id="how-it-works">How it works</H2>
      <ol>
        <li><strong>Probe.</strong> Zeroth reads the machine’s memory and GPU (Metal, CUDA, Vulkan or CPU).</li>
        <li><strong>Select.</strong> It chooses the largest model that fits comfortably, or the one you ask for.</li>
        <li><strong>Download once.</strong> The model is fetched, checked against a SHA-256 hash, and cached on disk.</li>
        <li><strong>Run locally.</strong> Inference uses <a href="https://github.com/ggml-org/llama.cpp">llama.cpp</a> in-process. Nothing is sent anywhere.</li>
      </ol>

      <H2 id="status">What works today</H2>
      <Callout type="note" title="Status">
        <p>
          The <strong>Node and desktop runtime works</strong> and is on npm as <code>@zeroth-ai/sdk-node</code>. This documentation covers it.
          A browser runtime (<code>@zeroth-ai/sdk-web</code>, WebAssembly) and a React Native runtime for iOS and Android
          (<code>@zeroth-ai/sdk-react-native</code>) are <strong>previews</strong> in the repo and not on npm yet. The browser runtime has
          run a real model in a browser. The mobile one passes its tests against a mock runtime and has not run on a real phone yet.
        </p>
      </Callout>
      <ul>
        <li>Streaming chat, message history and cancellation</li>
        <li>Schema-validated JSON output</li>
        <li>Tool calling and embeddings</li>
        <li>Resumable, checksum-verified model downloads</li>
        <li>A command line for pulling models and trying prompts</li>
      </ul>
    </>
  ),

  installation: () => (
    <>
      <H2 id="requirements">Requirements</H2>
      <ul>
        <li><strong>Node.js 20.11 or newer.</strong></li>
        <li><strong>macOS, Linux or Windows</strong>, on x64 or arm64. Apple Silicon uses the GPU through Metal.</li>
        <li><strong>Memory</strong> for the model you pick: about 1.4 GB for the smallest, 3.3 GB for the 3B model.</li>
        <li><strong>Disk</strong> for downloads: 0.7 GB to 3.4 GB depending on the model.</li>
      </ul>

      <H2 id="from-the-repo">Install from the repo</H2>
      <p>The Node package is on npm: <code>npm i @zeroth-ai/sdk-node</code>. To use the web and React Native previews, or to work on Zeroth itself, clone the repository and build it.</p>
      {code(`git clone https://github.com/ai-zeroth/zeroth.git
cd zeroth
npm install
npm run build`, "terminal")}
      <Callout type="tip">
        <p>Once the packages are published you will install with <code>npm i @zeroth-ai/sdk-node</code>. The code you write will not change.</p>
      </Callout>

      <H2 id="try-the-cli">Try the CLI</H2>
      <p>Check what your machine can run, then chat with a model. The first run downloads it.</p>
      {code(`npm run cli -- models        # what fits this machine
npm run cli -- pull lfm-1b  # download and verify a model
npm run cli -- chat          # chat fully offline`, "terminal")}
      <p>See <Link href="/docs/cli">Command line</Link> for every command.</p>

      <H2 id="where-models-live">Where models live</H2>
      <p>Models are cached outside your project, so they are shared between apps and survive reinstalls.</p>
      <Fields cols={["Platform", "Location"]} rows={[
        ["macOS", "~/Library/Caches/zeroth"],
        ["Linux", "$XDG_CACHE_HOME/zeroth or ~/.cache/zeroth"],
        ["Windows", "%LOCALAPPDATA%\\zeroth"],
      ]} />
      <p>Set <code>ZEROTH_HOME</code> to use a different folder.</p>
    </>
  ),

  quickstart: () => (
    <>
      <H2 id="load-and-chat">Load and chat</H2>
      <p>
        Pass <code>{'"auto"'}</code> and Zeroth picks a model that fits the device. The first run downloads it. Every run after that starts from disk.
      </p>
      {code(`import { zeroth } from "@zeroth-ai/sdk-node"

const ai = await zeroth.load({
  model: "auto",
  onProgress: (p) => console.log(\`downloading \${Math.round(p * 100)}%\`),
})

console.log("loaded", ai.model.name) // e.g. "granite-3b-q4"

for await (const token of ai.chat("Why does on-device AI help privacy?")) {
  process.stdout.write(token)
}`, "chat.ts")}

      <H2 id="get-json">Get structured JSON</H2>
      <p>Describe the shape you want. You get a validated object back, not text to parse.</p>
      {code(`const task = await ai.json("Create a task from: email Priya the Q3 deck by Friday", {
  type: "object",
  properties: { title: { type: "string" }, due: { type: "string" } },
  required: ["title"],
})

console.log(task) // { title: "Email Priya the Q3 deck", due: "Friday" }`, "json.ts")}

      <H2 id="clean-up">Clean up</H2>
      <p>Unload the model when you are done to free its memory.</p>
      {code(`await ai.unload()`, "cleanup.ts")}
      <p>Next, learn how <Link href="/docs/loading-models">loading models</Link> chooses what to run.</p>
    </>
  ),

  "loading-models": () => (
    <>
      <H2 id="auto-or-named">Auto or named</H2>
      <p>The simplest call lets Zeroth decide. You can also name a model, or pass options.</p>
      {code(`await zeroth.load("auto")          // best fit for this device
await zeroth.load("lfm-1b")          // a specific model
await zeroth.load({ prefer: "speed", maxDownloadMB: 2500 })`, "load.ts")}

      <H2 id="options">Options</H2>
      <Fields cols={["Option", "Type", "Description"]} rows={[
        ["model", '"auto" | ModelId', 'Which model to run. Default "auto".'],
        ["prefer", '"quality" | "speed" | "battery"', "What to optimise for when picking automatically. Default quality."],
        ["maxDownloadMB", "number", "Skip models whose download is larger. Models already on disk are always allowed."],
        ["fallback", "ModelId", "Use this model if nothing else fits."],
        ["onProgress", "(fraction: number) => void", "Called with 0 to 1 during the first-run download."],
        ["signal", "AbortSignal", "Cancel the download. Progress is kept and resumes next time."],
      ]} />

      <H2 id="how-auto-picks">How auto picks</H2>
      <p>Zeroth estimates how much memory each model needs and compares it with what the device can spare.</p>
      <ul>
        <li><strong>quality</strong> (default) picks the largest model that fits.</li>
        <li><strong>speed</strong> picks the largest model of 3B parameters or fewer.</li>
        <li><strong>battery</strong> picks the smallest model.</li>
      </ul>
      <p>
        On a laptop with 8 GB of memory this means <code>granite-3b</code> for quality and <code>lfm-1b</code> for battery. Every model in the catalogue fits on a 64 GB machine, so auto picks the largest one there.
        If you name a model that is far too big, you get an <code>INSUFFICIENT_MEMORY</code> error instead of a frozen machine.
      </p>

      <H2 id="first-run-download">The first-run download</H2>
      <p>Downloads are built to survive bad networks.</p>
      <ul>
        <li><strong>Resumable.</strong> An interrupted download continues from where it stopped.</li>
        <li><strong>Retried.</strong> Dropped connections retry automatically with backoff.</li>
        <li><strong>Verified.</strong> The file’s SHA-256 must match before it is used. A corrupt file is deleted.</li>
      </ul>
      <Callout type="tip">
        <p>Models are large. Show <code>onProgress</code> in your UI, or preload during setup so users never wait. See <Link href="/docs/offline">Working offline</Link>.</p>
      </Callout>
    </>
  ),

  chat: () => (
    <>
      <H2 id="stream-a-reply">Stream a reply</H2>
      <p><code>chat()</code> returns an async iterable. Each item is the next piece of text.</p>
      {code(`for await (const token of ai.chat("Explain WebGPU in one line.")) {
  ui.append(token)
}`, "stream.ts")}
      <p>If you only need the final text, use <code>complete()</code>.</p>
      {code(`const answer = await ai.complete("Explain WebGPU in one line.")`, "complete.ts")}

      <H2 id="conversations">Conversations</H2>
      <p>
        The model has no memory between calls. To hold a conversation, pass the full message list each time. Include a system message to set behaviour.
      </p>
      {code(`const history = [
  { role: "system", content: "Answer in one sentence." },
  { role: "user", content: "My name is Zed." },
  { role: "assistant", content: "Nice to meet you, Zed." },
  { role: "user", content: "What is my name?" },
]

const reply = await ai.complete(history)`, "history.ts")}
      <p>The last message must come from the user.</p>

      <H2 id="limits-and-cancel">Limits and cancel</H2>
      <Fields cols={["Option", "Type", "Description"]} rows={[
        ["maxTokens", "number", "Stop after this many tokens."],
        ["temperature", "number", "0 is repeatable. Higher is more varied."],
        ["signal", "AbortSignal", "Stop generation. The call then throws ABORTED."],
      ]} />
      {code(`const ctl = new AbortController()
stopButton.onclick = () => ctl.abort()

try {
  for await (const t of ai.chat("Write a long story.", { signal: ctl.signal })) ui.append(t)
} catch (e) {
  if (e.code !== "ABORTED") throw e
}`, "cancel.ts")}

      <H2 id="good-to-know">Good to know</H2>
      <ul>
        <li><strong>One at a time.</strong> Calls to the same loaded model are queued, so concurrent requests are safe.</li>
        <li><strong>Context window.</strong> It defaults to 4096 tokens. Very long histories will be trimmed by the engine.</li>
        <li><strong>Each call is independent.</strong> The engine re-reads the history you pass, so nothing leaks between calls.</li>
      </ul>
    </>
  ),

  "structured-output": () => (
    <>
      <H2 id="ask-for-json">Ask for JSON</H2>
      <p>
        <code>json()</code> constrains the model so it can only produce valid JSON for your schema, then validates the result again before returning it.
      </p>
      {code(`const review = await ai.json<{ sentiment: "good" | "bad"; score: number }>(
  "Review: the battery lasts two days and the screen is gorgeous.",
  {
    type: "object",
    properties: {
      sentiment: { type: "string", enum: ["good", "bad"] },
      score: { type: "number" },
    },
    required: ["sentiment", "score"],
  },
)`, "review.ts")}

      <H2 id="supported-schema">Supported schema</H2>
      <p>A practical subset of JSON Schema is supported.</p>
      <Fields rows={[
        ["type", "object, array, string, number, integer, boolean, null"],
        ["properties / required", "Fields of an object, and which are mandatory."],
        ["items", "The schema for each element of an array."],
        ["enum", "A fixed list of allowed values."],
      ]} />

      <H2 id="when-it-fails">When it fails</H2>
      <ul>
        <li><code>INVALID_JSON</code>: the output could not be parsed as JSON.</li>
        <li><code>SCHEMA_MISMATCH</code>: it parsed, but did not satisfy your schema. The error lists each problem.</li>
      </ul>
      <Callout type="warn">
        <p>Constrained output does not make the model <em>correct</em>, only well-formed. Validate values that matter to your app.</p>
      </Callout>
    </>
  ),

  tools: () => (
    <>
      <H2 id="define-a-tool">Define a tool</H2>
      <p>A tool is a function in your app plus a description and a schema for its arguments. The model decides when to call it.</p>
      {code(`ai.tools({
  searchNotes: {
    description: "Search the user's notes. Use this to find notes by keyword.",
    parameters: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
    run: async ({ query }) => db.search(query),
  },
})

const answer = await ai.complete("Find my notes about the Q3 deck and summarise them.")`, "tools.ts")}

      <H2 id="how-calls-work">How calls work</H2>
      <ol>
        <li>The model reads your prompt and the tool descriptions.</li>
        <li>If a tool helps, it emits a call with arguments.</li>
        <li>Zeroth runs your function and gives the result back to the model.</li>
        <li>The model writes its final answer using that result.</li>
      </ol>
      <p>If your function throws, the error message is returned to the model instead of crashing the call, so it can recover.</p>

      <H2 id="limits">Limits</H2>
      <ul>
        <li>Calling <code>tools()</code> replaces the previous set. Pass <code>{"{}"}</code> to clear it.</li>
        <li><code>json()</code> ignores tools. The underlying engine cannot combine constrained output with function calling.</li>
        <li>Small models call tools less reliably. Write clear descriptions and prefer a 3B or larger model for tool use.</li>
      </ul>
    </>
  ),

  embeddings: () => (
    <>
      <H2 id="embed-text">Embed text</H2>
      <p>
        <code>embed()</code> returns one vector per input string. There is no embedding model in the 2026 catalogue yet, so <code>embed()</code> is not available until one is added.
      </p>
      {code(`const [a, b] = await ai.embed(["invoice from March", "billing for march"])
console.log(a.length) // 768`, "embed.ts")}

      <H2 id="rank-by-similarity">Rank by similarity</H2>
      <p>Compare vectors with cosine similarity to find the closest match for a query.</p>
      {code(`const cosine = (x: number[], y: number[]) => {
  let dot = 0, nx = 0, ny = 0
  x.forEach((v, i) => { dot += v * y[i]; nx += v * v; ny += y[i] * y[i] })
  return dot / Math.sqrt(nx * ny)
}

const docs = ["cat on a sofa", "quarterly tax filing", "kitten on a couch"]
const [query, ...vectors] = await ai.embed(["a cat sitting down", ...docs])

const ranked = docs
  .map((text, i) => ({ text, score: cosine(query, vectors[i]) }))
  .sort((p, q) => q.score - p.score)`, "search.ts")}
    </>
  ),

  offline: () => (
    <>
      <H2 id="what-uses-the-network">What uses the network</H2>
      <p>Exactly one thing: downloading a model the first time you need it. Everything else runs locally.</p>
      <Fields cols={["Action", "Network"]} rows={[
        ["load() with the model already on disk", "None"],
        ["chat(), complete(), json(), tools()", "None"],
        ["embed()", "Not available yet (no embedding model in the catalogue)"],
        ["load() for a new model", "Downloads it once, with resume and verification"],
      ]} />

      <H2 id="preload">Preload during setup</H2>
      <p>Fetch models at install or onboarding time so the first real use is instant.</p>
      {code(`const ai = await zeroth.load({ model: "auto", onProgress: showProgressBar })
await ai.embed(["warm up"]) // also fetches the embedding model
await ai.unload()`, "preload.ts")}
      <p>Or from a terminal: <code>npm run cli -- pull auto</code>.</p>

      <H2 id="air-gapped">Air-gapped machines</H2>
      <p>
        Download on a connected machine, then copy the model folder to the offline one. Point <code>ZEROTH_HOME</code> at it. The
        <code>.ok</code> marker files next to each model tell Zeroth they were verified.
      </p>
      {code(`# connected machine
npm run cli -- pull auto

# offline machine
export ZEROTH_HOME=/path/to/copied/zeroth`, "terminal")}

      <H2 id="clearing-the-cache">Clearing the cache</H2>
      {code(`await zeroth.clearCache()   // from code
npm run cli -- clear-cache  // from the terminal`, "cache.ts")}
    </>
  ),

  cli: () => (
    <>
      <H2 id="commands">Commands</H2>
      <Fields rows={[
        ["zeroth models", "Shows this machine, which models fit it, and which are downloaded."],
        ["zeroth pull [model]", "Downloads and verifies a model. Defaults to auto."],
        ['zeroth run "<prompt>"', "Streams one answer."],
        ["zeroth chat", "Interactive chat. Type /reset to start over and /exit to quit."],
        ["zeroth clear-cache", "Deletes downloaded models."],
      ]} />
      <p>From the repo, run any of these with <code>npm run cli -- &lt;command&gt;</code>.</p>

      <H2 id="options">Options</H2>
      <Fields cols={["Option", "Description"]} rows={[
        ["--model <id|auto>", "lfm-1b, lfm3-1.7b, granite-3b, gemma-e2b, or auto."],
        ["--prefer <mode>", "quality, speed or battery."],
        ["--max-tokens <n>", "Limit the length of the answer."],
        ["--system \"<text>\"", "A system prompt."],
        ["--json '<schema>'", "run only: answer as JSON matching this JSON Schema."],
      ]} />

      <H2 id="examples">Examples</H2>
      {code(`npm run cli -- models
npm run cli -- pull lfm-1b
npm run cli -- run "Explain WebGPU in one line" --model lfm-1b
npm run cli -- run "Task: email Priya by Friday" --json '{"type":"object","properties":{"title":{"type":"string"}},"required":["title"]}'
npm run cli -- chat --system "You are a concise assistant."`, "terminal")}
    </>
  ),

  models: () => (
    <>
      <H2 id="catalogue">Catalogue</H2>
      <p>All models are open-weight and quantised to 4-bit (GGUF) so they stay small and fast.</p>
      <Fields cols={["Model", "Built on", "Download"]} rows={[
        ["lfm-1b", "LFM2.5 1.2B Instruct (Liquid AI)", "0.7 GB"],
        ["lfm3-1.7b", "LFM3 1.7B (Liquid AI)", "1.1 GB"],
        ["granite-3b", "Granite 4.2 3B (IBM)", "2.2 GB"],
        ["gemma-e2b", "Gemma 4 E2B, QAT 4-bit (Google)", "3.4 GB"],
      ]} />
      <Callout type="note">
        <p>A vision model (<code>vision-8b</code>) is planned. The current engine cannot read images yet.</p>
      </Callout>

      <H2 id="memory">Memory needs</H2>
      <p>Approximate memory while running, including the working context. Zeroth will not auto-pick a model that does not fit.</p>
      <Fields cols={["Model", "Memory"]} rows={[
        ["lfm-1b", "about 1.4 GB"],
        ["lfm3-1.7b", "about 1.9 GB"],
        ["granite-3b", "about 3.3 GB"],
        ["gemma-e2b", "about 4.7 GB"],
      ]} />
      <p>Run <code>npm run cli -- models</code> to see which fit your machine.</p>

      <H2 id="licences">Licences</H2>
      <p>Each model keeps its upstream licence. Read it before you ship a model in a product.</p>
      <Fields cols={["Model", "Licence"]} rows={[
        ["lfm-1b, lfm3-1.7b", "LFM Open License (Liquid AI)"],
        ["granite-3b, gemma-e2b", "Apache 2.0"],
      ]} />
    </>
  ),

  errors: () => (
    <>
      <H2 id="handling-errors">Handling errors</H2>
      <p>Every SDK error is a <code>ZerothError</code> with a stable <code>code</code> you can branch on.</p>
      {code(`import { ZerothError } from "@zeroth-ai/sdk-node"

try {
  const ai = await zeroth.load("granite-3b")
} catch (e) {
  if (e instanceof ZerothError && e.code === "INSUFFICIENT_MEMORY") {
    // fall back to a smaller model
  } else throw e
}`, "errors.ts")}

      <H2 id="codes">Error codes</H2>
      <Fields rows={[
        ["ENGINE_UNAVAILABLE", "No runtime is registered. Import @zeroth-ai/sdk-node, or register your own engine."],
        ["NOT_LOADED", "You used a model after unload(). Call zeroth.load() again."],
        ["MODEL_UNAVAILABLE", "That model id is not available in this runtime. The message lists what is."],
        ["INSUFFICIENT_MEMORY", "The model is too big for this device. Choose a smaller one or use auto."],
        ["DOWNLOAD_FAILED", "The download failed after retries. Check the connection and try again. Progress is kept."],
        ["CHECKSUM_MISMATCH", "The downloaded file did not match its hash and was deleted. Try again."],
        ["INVALID_JSON", "json() could not parse the model output as JSON."],
        ["SCHEMA_MISMATCH", "json() output parsed but broke your schema. The message lists each problem."],
        ["ABORTED", "You cancelled with an AbortSignal. Safe to ignore."],
      ]} />
    </>
  ),

  api: () => (
    <>
      <H2 id="zeroth">zeroth</H2>
      <Fields cols={["Method", "Returns", "Description"]} rows={[
        ["load(options?)", "Promise<Zeroth>", 'Loads a model. Accepts "auto", a model id, or LoadOptions.'],
        ["clearCache()", "Promise<void>", "Deletes downloaded models from this device."],
      ]} />

      <H2 id="instance">The loaded model</H2>
      <Fields cols={["Member", "Type", "Description"]} rows={[
        ["model", "ModelInfo", "id, name, params and sizeMB of the loaded model."],
        ["ready", "boolean", "True until you call unload()."],
        ["chat(input, options?)", "AsyncIterable<string>", "Streams text for a prompt or message list."],
        ["complete(input, options?)", "Promise<string>", "The full answer as one string."],
        ["json(input, schema, options?)", "Promise<T>", "A validated object matching the schema."],
        ["embed(texts)", "Promise<number[][]>", "One vector per input string."],
        ["tools(defs)", "void", "Registers functions the model may call. Replaces the previous set."],
        ["unload()", "Promise<void>", "Frees the model. It cannot be used afterwards."],
      ]} />

      <H2 id="load-options">LoadOptions</H2>
      <Fields cols={["Option", "Type", "Description"]} rows={[
        ["model", '"auto" | ModelId', 'Default "auto".'],
        ["prefer", '"quality" | "speed" | "battery"', "Default quality."],
        ["maxDownloadMB", "number", "Skip models with a bigger download."],
        ["fallback", "ModelId", "Used if nothing else fits."],
        ["onProgress", "(fraction: number) => void", "Download progress from 0 to 1."],
        ["signal", "AbortSignal", "Cancels the download."],
      ]} />

      <H2 id="generate-options">GenerateOptions</H2>
      <Fields cols={["Option", "Type", "Description"]} rows={[
        ["maxTokens", "number", "Stop after this many tokens."],
        ["temperature", "number", "0 is repeatable. Higher is more varied."],
        ["signal", "AbortSignal", "Stops generation and throws ABORTED."],
      ]} />
      <p>
        The input to <code>chat</code>, <code>complete</code> and <code>json</code> is a string or a list of <code>{"{ role, content }"}</code> messages, where role is
        <code>system</code>, <code>user</code> or <code>assistant</code>.
      </p>
    </>
  ),

  faq: () => (
    <>
      <H2 id="questions">Questions</H2>
      <div className="mt-5 divide-y divide-black/10 border-y border-black/10">
        {faq.map(([q, a]) => (
          <details key={q} className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[16px] font-semibold">
              {q}
              <span className="shrink-0 text-xl leading-none transition-transform group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="pb-5 text-[15px] leading-[1.65] text-black/75">{a}</p>
          </details>
        ))}
      </div>
    </>
  ),
};
