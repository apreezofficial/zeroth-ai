"use client";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { Blocks } from "./Blocks";

export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden>
      <path d="M2 2l6 6-6 6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function Button({
  children,
  href = "/docs",
  light = false,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-between gap-12 px-5 py-4 text-[15px] font-semibold transition-colors ${
        light ? "bg-white text-black hover:bg-accent hover:text-white" : "bg-black text-white hover:bg-accent"
      } ${className}`}
    >
      {children}
      <Chevron className="transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Zeroth home">
      <Blocks
        className="h-7 w-7"
        size={9}
        stagger={0}
        blocks={[
          { i: 0, j: 0, k: 0, c: "indigo" },
          { i: 1, j: 0, k: 0, c: "purple" },
          { i: 0, j: 0, k: 1, c: "blue" },
          { i: 0, j: 0, k: 2, c: "purple" },
        ]}
      />
      <span className={`text-[22px] font-bold tracking-tight ${light ? "text-white" : "text-black"}`}>
        Zeroth
      </span>
    </Link>
  );
}
