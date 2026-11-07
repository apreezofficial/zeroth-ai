"use client";
import { useEffect, useState } from "react";

type Heading = { id: string; title: string };

/** Desktop "On this page" rail that highlights the section being read. */
export function TocRail({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-100px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;
  return (
    <nav aria-label="On this page" className="text-[13.5px]">
      <div className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-black/45">ON THIS PAGE</div>
      <ul className="space-y-0.5 border-l border-black/15">
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} className={`-ml-px block border-l-2 py-1.5 pl-3.5 leading-snug ${active === h.id ? "border-accent font-semibold text-accent" : "border-transparent text-black/60 hover:text-black"}`}>
              {h.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Phone/tablet version: a collapsible list at the top of the page. */
export function TocInline({ headings }: { headings: Heading[] }) {
  if (headings.length < 2) return null;
  return (
    <details className="group mt-6 border border-black/15 xl:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-[14px] font-semibold">
        On this page
        <span className="text-lg leading-none transition-transform group-open:rotate-45" aria-hidden>+</span>
      </summary>
      <ul className="border-t border-black/10 px-4 py-2">
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} className="block py-2.5 text-[15px] text-black/75">{h.title}</a>
          </li>
        ))}
      </ul>
    </details>
  );
}
