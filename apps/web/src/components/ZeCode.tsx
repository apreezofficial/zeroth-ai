import Link from "next/link";
import { card } from "./styles";

/** Home-page note for ze-code, our in-development code model. */
export function ZeCode() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <div className={`${card} flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between`}>
        <div>
          <span className="rounded-full border border-black/20 px-2.5 py-0.5 text-xs font-semibold text-black/60">In development</span>
          <h2 className="mt-4 font-mono text-[28px] font-bold tracking-[-0.02em]">ze-code</h2>
          <p className="mt-3 max-w-[560px] text-[15px] leading-[1.6] text-black/70">
            Our own small model for code completion and explanation, trained by Zeroth on top of an open-weight base. It is not
            released yet. No download, speed or memory figures are published until it is tested.
          </p>
        </div>
        <Link href="/models" className="shrink-0 rounded-full bg-black px-6 py-3 text-[15px] font-semibold text-white hover:bg-accent">
          See all models
        </Link>
      </div>
    </section>
  );
}
