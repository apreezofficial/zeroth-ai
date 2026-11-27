import { ContactForm } from "@/components/Forms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Contact", description: "Contact the Zeroth team with questions about the SDK, local language models, or building on-device AI.", path: "/contact", index: false });

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
