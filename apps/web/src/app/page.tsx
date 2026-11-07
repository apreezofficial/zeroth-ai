import { Hero } from "@/components/Hero";
import { Trusted } from "@/components/Trusted";
import { Features } from "@/components/Features";
import { Pillars } from "@/components/Pillars";
import { Testimonial, Download } from "@/components/Closing";

export default function Home() {
  return (
    <>
      <Hero />
      <Trusted />
      <Features />
      <Pillars />
      <Testimonial />
      <Download />
    </>
  );
}
