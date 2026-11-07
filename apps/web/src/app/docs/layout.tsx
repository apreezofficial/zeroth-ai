import type { ReactNode } from "react";
import { DocsNav } from "@/components/docs/DocsNav";
import { MobileBar } from "@/components/docs/MobileBar";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <MobileBar />
      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h,76px)+24px)] max-h-[calc(100vh-var(--header-h,76px)-48px)] overflow-y-auto py-10 pr-2">
            <DocsNav />
          </div>
        </aside>
        <div className="min-w-0 py-8 lg:py-12">{children}</div>
      </div>
    </div>
  );
}
