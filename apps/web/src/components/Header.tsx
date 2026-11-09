"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Blocks, type Block } from "./Blocks";
import { Button, Logo } from "./ui";

const b = (i: number, j: number, k: number, c: Block["c"]): Block => ({ i, j, k, c });

const features: { title: string; body: string; icon: Block[]; href: string }[] = [
  {
    title: "Embed",
    href: "/product/embed",
    body: "Three lines to load a model and stream tokens on-device. No server, no API key.",
    icon: [b(0, 0, 0, "white"), b(1, 0, 0, "white"), b(0, 1, 0, "white"), b(0, 0, 1, "white"), b(1, 0, 1, "blue"), b(0, 0, 2, "blue")],
  },
  {
    title: "Adapt",
    href: "/product/adapt",
    body: "Picks the largest 1B to 3B model that fits each device’s hardware and caches it locally.",
    icon: [b(0, 0, 0, "white"), b(1, 0, 0, "white"), b(0, 0, 1, "white"), b(1, 0, 1, "purple"), b(0, 0, 2, "purple"), b(1, 0, 2, "white")],
  },
  {
    title: "Ship",
    href: "/product/ship",
    body: "One API across iOS, Android, Web and Desktop. Zero backend to run.",
    icon: [b(0, 0, 0, "teal"), b(1, 0, 0, "white"), b(0, 1, 0, "white"), b(0, 0, 1, "teal"), b(1, 0, 1, "white"), b(0, 0, 2, "white")],
  },
];

const links = [
  ["Models", "/models"],
  ["Integrate", "/integrate"],
] as const;

export function Header() {
  const [banner, setBanner] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const path = usePathname();
  const on = (h: string) => path === h || path.startsWith(h + "/");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  // Close menus when the route changes (adjusting state during render, per React docs).
  const [lastPath, setLastPath] = useState(path);
  if (lastPath !== path) {
    setLastPath(path);
    setMenu(false);
    setMobile(false);
  }

  const dark = menu;
  return (
    <>
      {banner && (
        <div className="relative z-40 bg-accent px-10 py-3 text-center text-[14px] font-medium text-white">
          ⚡ Zeroth SDK 0.1 — Node and Desktop on npm today. Web, iOS and Android are in preview. ⚡
          <button
            onClick={() => setBanner(false)}
            aria-label="Dismiss"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-lg leading-none opacity-80 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}
      <header
        ref={ref}
        className={`sticky top-0 z-50 transition-colors duration-200 ${
          dark ? "bg-[#0d0d10] text-white" : "bg-white text-black"
        } ${scrolled && !dark ? "shadow-[0_1px_0_rgba(0,0,0,0.1)]" : ""}`}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5 md:py-6">
          <Logo light={dark} />
          <nav className="hidden items-center gap-9 text-[15px] font-medium md:flex">
            <button
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              className={`flex items-center gap-1.5 hover:text-accent ${on("/product") && !dark ? "text-accent" : ""}`}
            >
              Product
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                className={`transition-transform ${menu ? "rotate-180" : ""}`}
              >
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
            {links.map(([l, h]) => (
              <Link key={l} href={h} className={`hover:text-accent ${on(h) ? "text-accent" : ""}`}>{l}</Link>
            ))}
            <Button href="/docs" light={dark} className="!py-3.5">Read the docs</Button>
          </nav>
          <button className="md:hidden" aria-label="Menu" onClick={() => setMobile((o) => !o)}>
            <div className={`mb-1.5 h-0.5 w-6 ${dark ? "bg-white" : "bg-black"}`} />
            <div className={`h-0.5 w-6 ${dark ? "bg-white" : "bg-black"}`} />
          </button>
        </div>

        {/* Product mega-menu */}
        <div
          className={`absolute inset-x-0 top-full hidden overflow-hidden bg-[#0d0d10] text-white transition-[clip-path,opacity] duration-300 md:block ${
            menu ? "pointer-events-auto opacity-100 [clip-path:inset(0)]" : "pointer-events-none opacity-0 [clip-path:inset(0_0_100%_0)]"
          }`}
        >
          <div className="border-t border-white/10">
            <div className="mx-auto grid max-w-[1200px] grid-cols-[1.1fr_3fr] gap-10 px-6 pb-14">
              <div>
                <div className="border-b border-white/10 py-4 text-[11px] font-semibold tracking-[0.12em] text-white/50">OVERVIEW</div>
                <MenuItem
                  href="/product"
                  onClick={() => setMenu(false)}
                  title="Overview"
                  body="An offline AI SDK that puts a full model inside your app: private, instant and free of per-token cost."
                  icon={[b(0, 0, 0, "teal"), b(1, 0, 0, "purple"), b(0, 1, 0, "teal"), b(0, 0, 1, "teal"), b(1, 0, 1, "indigo"), b(0, 0, 2, "purple")]}
                />
              </div>
              <div>
                <div className="border-b border-white/10 py-4 text-[11px] font-semibold tracking-[0.12em] text-white/50">FEATURES</div>
                <div className="grid grid-cols-3 gap-8">
                  {features.map((f) => (
                    <MenuItem key={f.title} onClick={() => setMenu(false)} {...f} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {mobile && (
          <div className="absolute inset-x-0 top-full flex flex-col gap-5 border-t bg-white px-6 py-6 text-lg font-medium text-black shadow-lg md:hidden">
            <Link href="/product" onClick={() => setMobile(false)}>Product</Link>
            {features.map((f) => (
              <Link key={f.title} href={f.href} onClick={() => setMobile(false)} className="pl-4 text-[16px] text-black/70">{f.title}</Link>
            ))}
            {links.map(([l, h]) => (
              <Link key={l} href={h} onClick={() => setMobile(false)}>{l}</Link>
            ))}
            <Button href="/docs" className="self-stretch">Read the docs</Button>
          </div>
        )}
      </header>
    </>
  );
}

function MenuItem({
  title,
  body,
  icon,
  href,
  onClick,
}: {
  title: string;
  body: string;
  icon: Block[];
  href: string;
  onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className="group block pt-8">
      <Blocks className="h-14 w-14 transition-transform duration-300 group-hover:-translate-y-1" size={13} stagger={0} blocks={icon} />
      <div className="mt-8 text-[17px] font-semibold">{title}</div>
      <p className="mt-3 max-w-[260px] text-[13.5px] leading-[1.55] text-white/70">{body}</p>
    </Link>
  );
}
