import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pillars } from "@/components/Pillars";
import { Testimonial, Download } from "@/components/Closing";
import { ZeCode } from "@/components/ZeCode";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "On-Device AI SDK for Private Apps",
  description: "Build private AI features with Zeroth, an on-device AI SDK for Node, Electron, web and mobile. Run open-weight models locally with no inference server or per-token bill.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Pillars />
      <ZeCode />
      <Testimonial />
      <Download />
    </>
  );
}
