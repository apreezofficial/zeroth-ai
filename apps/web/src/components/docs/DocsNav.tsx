"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { docs, groups, search } from "@/lib/docs";

/** Sidebar / drawer navigation with search across all docs pages. */
export function DocsNav({ onNavigate, large = false }: { onNavigate?: () => void; large?: boolean }) {
  const path = usePathname();
  const [q, setQ] = useState("");
  const results = search(q);
  const row = `block border-l-2 pl-4 ${large ? "py-3 text-[16px]" : "py-1.5 text-[14.5px]"}`;

  return (
    <nav aria-label="Documentation">
      <div className="relative mb-6">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the docs…"
          aria-label="Search the docs"
          className="w-full border border-black bg-white px-3.5 py-3 text-[15px] outline-none placeholder:text-black/40 focus:border-accent focus:shadow-[0_0_0_3px_rgba(123,97,255,0.25)]"
        />
      </div>

      {q.trim() ? (
        results.length ? (
          <ul className="space-y-1">
            {results.map((d) => (
              <li key={d.slug}>
                <Link href={`/docs/${d.slug}`} onClick={onNavigate} className="block border border-black/10 p-3.5 hover:border-accent">
                  <div className="text-[15px] font-semibold">{d.title}</div>
                  <div className="mt-0.5 text-[13px] leading-snug text-black/60">{d.description}</div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-black/55">No pages match “{q}”.</p>
        )
      ) : (
        groups.map((g) => (
          <div key={g} className="mb-7">
            <div className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-black/45">{g.toUpperCase()}</div>
            <ul className="border-l border-black/15">
              {docs.filter((d) => d.group === g).map((d) => {
                const active = path === `/docs/${d.slug}`;
                return (
                  <li key={d.slug}>
                    <Link
                      href={`/docs/${d.slug}`}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`${row} -ml-px ${active ? "border-accent font-semibold text-accent" : "border-transparent text-black/70 hover:text-black"}`}
                    >
                      {d.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </nav>
  );
}
