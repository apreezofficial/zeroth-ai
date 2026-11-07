// Run from the repo root after `npm run build`:
//   node packages/sdk-node/examples/quickstart.mjs
import { zeroth } from "../dist/index.js";

const ai = await zeroth.load({
  model: "auto",
  onProgress: (p) => process.stderr.write(`\rdownloading ${(p * 100).toFixed(0)}%`),
});
console.log(`\nloaded ${ai.model.name}\n`);

for await (const token of ai.chat("In two sentences, why does on-device AI matter for privacy?")) {
  process.stdout.write(token);
}
console.log("\n");

const task = await ai.json("Create a task from: email Priya the Q3 deck by Friday", {
  type: "object",
  properties: { title: { type: "string" }, due: { type: "string" } },
  required: ["title"],
});
console.log(task);

await ai.unload();
