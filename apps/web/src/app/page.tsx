import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pillars } from "@/components/Pillars";
import { Testimonial, Download } from "@/components/Closing";
import { ZeCode } from "@/components/ZeCode";

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
