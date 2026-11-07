"use client";
import { useEffect, useMemo, useState } from "react";
import { docsNav } from "@/lib/content";

export function DocsSidebar() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState("introduction");

  useEffect(() => {
    const ids = docsNav.flatMap((g) => g.items.map((i) => i[1]));
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const groups = useMemo(
    () =>
      docsNav
        .map((g) => ({ ...g, items: g.items.filter((i) => i[0].toLowerCase().includes(q.trim().toLowerCase())) }))
        .filter((g) => g.items.length),
    [q],
  );

  return (
    <nav aria-label="Documentation">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search docs…"
        aria-label="Search docs"
        className="mb-6 w-full border border-black bg-white px-3.5 py-2.5 text-[14px] outline-none placeholder:text-black/40 focus:border-accent"
      />
      {groups.length === 0 && <p className="text-[14px] text-black/55">No matches.</p>}
      {groups.map((g) => (
        <div key={g.group} className="mb-7">
          <div className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-black/45">{g.group.toUpperCase()}</div>
          <ul className="border-l border-black/15">
            {g.items.map(([t, id]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`-ml-px block border-l-2 py-1.5 pl-4 text-[14.5px] ${active === id ? "border-accent font-semibold text-accent" : "border-transparent text-black/70 hover:text-black"}`}
                >
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
