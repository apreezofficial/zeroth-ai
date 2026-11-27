import type { Metadata } from "next";
import { ModelStudio } from "@/components/ModelStudio";
import { PageHero } from "@/components/PageParts";

export const metadata: Metadata = {
  title: "Model Studio — Zeroth",
  description: "Find open GGUF models, download their weights, and generate a custom local Zeroth runtime profile.",
};

export default function StudioPage() {
  return <>
    <PageHero
      title={<>Your model.<br />Your device.<br />Your rules.</>}
      sub="Explore thousands of open GGUF models, choose a quantization, set the assistant’s behavior, and export a runnable local profile. Your weights stay on your machine."
    />
    <section className="bg-gray py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6"><ModelStudio /></div>
    </section>
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-6 md:grid-cols-3">
        {[
          ["A profile, not a training run", "Studio assembles open weights with your system instructions and runtime settings. Fine-tuning needs a separate training workflow and compute."],
          ["Weights come from their publisher", "Large model files download directly from Hugging Face. Review the license and model card; each publisher sets its own terms."],
          ["Run it on your machine", "The exported Node config loads your GGUF locally through Zeroth. Install @zeroth-ai/sdk-node and place the downloaded file in ./models."],
        ].map(([title, body]) => <article key={title} className="border-t-2 border-accent pt-5"><h3 className="text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-black/65">{body}</p></article>)}
      </div>
    </section>
  </>;
}
