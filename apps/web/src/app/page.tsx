import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pillars } from "@/components/Pillars";
import { Testimonial, Download } from "@/components/Closing";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Pillars />
      <Testimonial />
      <Download />
    </>
  );
}
