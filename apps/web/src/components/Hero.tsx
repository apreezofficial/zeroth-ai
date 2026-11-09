import Link from "next/link";
import type { Block } from "./Blocks";
import { ScrollBlocks } from "./ScrollBlocks";
import { Button } from "./ui";
import { CopyCommand } from "./CopyCommand";

type C = Block["c"];
const b = (i: number, j: number, k: number, c: C): Block => ({ i, j, k, c });

// organic blue / teal / indigo cluster (left)
const cluster: Block[] = [
  b(0, 0, 0, "indigo"), b(1, 0, 0, "indigo"), b(2, 0, 0, "indigo"),
  b(0, 1, 0, "indigo"), b(1, 1, 0, "indigo"), b(2, 1, 0, "blue"), b(1, 2, 0, "indigo"),
  b(0, 0, 1, "blue"), b(1, 0, 1, "blue"), b(0, 1, 1, "blue"), b(1, 1, 1, "indigo"),
  b(2, 1, 1, "teal"), b(1, 2, 1, "teal"),
  b(0, 0, 2, "teal"), b(1, 1, 2, "blue"), b(1, 2, 2, "blue"), b(0, 1, 2, "blue"),
  b(1, 1, 3, "teal"), b(0, 0, 3, "blue"),
];

// purple wall (right): 4 wide along j, 6 tall, with a few loose cubes on top
const wallBlocks: Block[] = [
  ...Array.from({ length: 4 * 6 }, (_, n) => b(0, n % 4, Math.floor(n / 4), "purple" as C)),
  b(0, 0, 6, "purple"), b(0, 1, 6, "purple"), b(0, 0, 7, "ghost"),
];

export function Hero() {
  return (
    <section className="relative mx-auto max-w-[1300px] px-5 pb-20 pt-10 text-center md:pb-32 md:pt-20">
      {/* desktop: art flanks the headline */}
      <div className="absolute left-0 top-36 hidden w-[230px] lg:block">
        <ScrollBlocks className="w-full" size={34} blocks={cluster} />
      </div>
      <div className="absolute right-0 top-28 hidden w-[200px] lg:block">
        <ScrollBlocks className="w-full" size={30} blocks={wallBlocks} />
      </div>

      <h1 className="relative mx-auto max-w-[780px] text-[clamp(46px,8vw,92px)] font-bold leading-[0.98] tracking-[-0.045em]">
        Unlimited AI.
        <br />
        Zero internet.
      </h1>

      {/* mobile: art sits between headline and copy, side by side */}
      <div className="mt-10 flex items-end justify-center gap-6 lg:hidden">
        <ScrollBlocks className="w-[44%] max-w-[190px]" size={26} blocks={cluster} />
        <ScrollBlocks className="w-[34%] max-w-[150px]" size={24} blocks={wallBlocks} />
      </div>

      <p className="relative mx-auto mt-8 max-w-[620px] text-[18px] leading-[1.5] md:mt-10 md:text-[20px]">
        Embed a full AI model directly inside any app. It runs 100% on the user’s device through
        one simple SDK. No servers, no API keys, no data leaving the phone.
      </p>
      <div className="relative mt-8 flex justify-center md:mt-10">
        <CopyCommand command="npm i @zeroth-ai/sdk-node" />
      </div>
      <div className="relative mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center md:mt-8">
        <Button href="/docs" className="sm:min-w-[210px]">Read the docs</Button>
        <Link href="/product" className="inline-flex items-center justify-center px-5 py-4 text-[15px] font-semibold underline-offset-4 hover:underline">
          See how it works →
        </Link>
      </div>
      <p className="relative mt-6 text-sm text-black/50">iOS · Android · Web · Desktop — works with no connection</p>
    </section>
  );
}
