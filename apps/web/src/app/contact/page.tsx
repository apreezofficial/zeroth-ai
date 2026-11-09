import type { Metadata } from "next";
import { ContactForm } from "@/components/Forms";

export const metadata: Metadata = { title: "Contact — Zeroth", description: "Questions about the SDK, the models or shipping on-device AI? Message the Zeroth team." };

export default function ContactPage() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[600px] px-6 py-20 text-center md:py-28">
        <h1 className="text-[clamp(38px,6vw,56px)] font-bold tracking-[-0.045em]">Get in touch</h1>
        <p className="mb-10 mt-4 text-[16px] text-black/70">Tell us how we can help and we’ll get in touch shortly.</p>
        <ContactForm />
      </div>
    </section>
  );
}
