import Link from "next/link";
import { Blocks, wall } from "./Blocks";
import { Button, Logo, Reveal } from "./ui";

export function Testimonial() {
  return (
    <section className="mx-auto max-w-[1000px] px-6 py-32 text-center">
      <Reveal>
        <p className="text-[clamp(26px,3.6vw,40px)] font-semibold leading-[1.2] tracking-[-0.03em]">
          “At DRER, getting prompts and instructions to work offline was a hassle until Zeroth
          came in. Chat and actions now run on-device, with nothing sent to a server.”
        </p>
        <div className="mt-10 font-semibold">Head of Engineering</div>
        <div className="text-black/55">Aura OS</div>
      </Reveal>
    </section>
  );
}

export function Download() {
  return (
    <section id="start" className="relative overflow-hidden bg-accent text-white">
      <Blocks className="absolute -right-10 bottom-0 hidden w-[260px] md:block" size={40} blocks={wall(4, 4, "indigo")} />
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-8 px-6 py-24 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.04em]">
            Add offline AI to your
            <br />
            app in five minutes.
          </h2>
          <p className="mt-5 text-white/85">Free for indie apps · One SDK for every platform</p>
        </div>
        <div className="relative flex flex-col gap-3 md:mr-64">
          <code className="bg-black px-5 py-4 font-mono text-[15px]">$ npm i @zeroth-ai/sdk</code>
          <Button light href="/docs">Read the docs</Button>
        </div>
      </div>
    </section>
  );
}

const cols = [
  ["Product", [["Overview", "/product"], ["Models", "/models"], ["Integrate", "/integrate"], ["Docs", "/docs"]]],
  ["Company", [["About", "/about"], ["Customers", "/customers"], ["Contact", "/contact"]]],
] as const;

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-20 md:grid-cols-[1.4fr_repeat(2,1fr)]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-[240px] text-[15px] text-white/60">
            Intelligence with zero cloud. Built to run where you are.
          </p>
        </div>
        {cols.map(([h, ls]) => (
          <div key={h}>
            <h4 className="mb-5 text-sm font-semibold text-white/50">{h}</h4>
            <ul className="space-y-3 text-[15px]">
              {ls.map(([l, href]) => (
                <li key={l}>
                  <Link href={href} className="hover:text-accent">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/15 px-6 py-6 text-center text-sm text-white/50">
        Zeroth © 2026. All rights reserved.
      </div>
    </footer>
  );
}
