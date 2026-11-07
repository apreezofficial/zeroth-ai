import Link from "next/link";
import type { ReactNode } from "react";
import { neighbours } from "@/lib/docs";

const offset = "scroll-mt-[calc(var(--header-h,68px)+72px)] lg:scroll-mt-[calc(var(--header-h,76px)+24px)]";

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className={`group ${offset} mt-14 text-[clamp(24px,3vw,30px)] font-bold leading-tight tracking-[-0.03em] first:mt-0`}>
      <a href={`#${id}`} className="plain no-underline">
        {children}
        <span aria-hidden className="ml-2 text-black/25 opacity-0 transition-opacity group-hover:opacity-100">#</span>
      </a>
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 text-[19px] font-bold tracking-tight">{children}</h3>;
}

const tones = {
  note: { bar: "bg-accent", bg: "bg-[#f7f5ff]", label: "Note" },
  warn: { bar: "bg-amber-500", bg: "bg-amber-50", label: "Heads up" },
  tip: { bar: "bg-teal-500", bg: "bg-teal-50", label: "Tip" },
} as const;

export function Callout({ type = "note", title, children }: { type?: keyof typeof tones; title?: string; children: ReactNode }) {
  const t = tones[type];
  return (
    <aside className={`doc-callout mt-6 flex overflow-hidden border border-black/15 ${t.bg}`}>
      <div className={`w-1.5 shrink-0 ${t.bar}`} />
      <div className="min-w-0 px-4 py-3.5 text-[15px] leading-[1.6] sm:px-5">
        <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-black/55">{title ?? t.label}</div>
        <div className="mt-1 [&>p]:mt-2 [&>p:first-child]:mt-0">{children}</div>
      </div>
    </aside>
  );
}

/** A responsive reference table: a real table on wide screens, stacked cards on phones. */
export function Fields({ rows, cols = ["Name", "Description"] }: { rows: string[][]; cols?: string[] }) {
  const typed = cols[1]?.toLowerCase() === "type";
  return (
    <>
      <div className="mt-6 hidden overflow-hidden border border-black/15 md:block">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-gray text-[11.5px] tracking-[0.08em] text-black/55">
            <tr>{cols.map((c) => <th key={c} className="px-4 py-3 font-semibold">{c.toUpperCase()}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-t border-black/10 align-top">
                {r.map((cell, i) => (
                  <td key={i} className={`px-4 py-3 ${i === 0 ? `break-words font-mono text-[13px] font-semibold ${typed ? "whitespace-nowrap" : ""}` : i === 1 && typed ? "font-mono text-[12.5px] text-black/70" : "text-black/75"}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="plain-list mt-6 space-y-3 md:hidden">
        {rows.map((r) => (
          <li key={r[0]} className="border border-black/15 p-4">
            <div className="break-words font-mono text-[13.5px] font-bold">{r[0]}</div>
            {r.slice(1).map((cell, i) => (
              <div key={i} className={`mt-1.5 text-[14px] leading-[1.55] ${i === 0 && typed ? "font-mono text-[12.5px] text-black/60" : "text-black/75"}`}>{cell}</div>
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}

export function PrevNext({ slug }: { slug: string }) {
  const { prev, next } = neighbours(slug);
  const card = "group flex min-h-20 flex-col justify-center border border-black/15 p-4 transition-colors hover:border-accent";
  return (
    <nav aria-label="Previous and next" className="mt-16 grid gap-3 border-t border-black/10 pt-8 sm:grid-cols-2">
      {prev ? (
        <Link href={`/docs/${prev.slug}`} className={card}>
          <span className="text-[12px] text-black/50">← Previous</span>
          <span className="mt-1 text-[16px] font-semibold group-hover:text-accent">{prev.title}</span>
        </Link>
      ) : <span />}
      {next && (
        <Link href={`/docs/${next.slug}`} className={`${card} sm:items-end sm:text-right`}>
          <span className="text-[12px] text-black/50">Next →</span>
          <span className="mt-1 text-[16px] font-semibold group-hover:text-accent">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
