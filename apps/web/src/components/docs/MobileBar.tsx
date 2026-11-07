"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { bySlug } from "@/lib/docs";
import { DocsNav } from "./DocsNav";

/** Phone/tablet: a slim sticky bar that opens a full-screen section menu. */
export function MobileBar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(path);
  if (lastPath !== path) {
    setLastPath(path);
    setOpen(false);
  }

  const slug = path.split("/")[2];
  const current = slug ? bySlug(slug) : undefined;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="sticky top-[var(--header-h,68px)] z-40 -mx-4 border-b border-black/10 bg-white/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="flex min-h-12 w-full items-center justify-between gap-3 text-left"
        >
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold tracking-[0.12em] text-black/45">{current ? current.group.toUpperCase() : "DOCS"}</span>
            <span className="block truncate text-[15px] font-semibold">{current ? current.title : "Documentation"}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2 border border-black px-3 py-2 text-[13px] font-semibold">
            Menu
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden><path d="M0 1h14M0 5h14M0 9h14" stroke="currentColor" strokeWidth="1.6" /></svg>
          </span>
        </button>
      </div>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Documentation menu" className="fixed inset-0 z-[80] flex flex-col bg-white lg:hidden">
          <div className="flex min-h-16 items-center justify-between border-b border-black/10 px-4">
            <span className="text-[17px] font-bold">Docs</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center text-2xl leading-none">×</button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <DocsNav large onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
