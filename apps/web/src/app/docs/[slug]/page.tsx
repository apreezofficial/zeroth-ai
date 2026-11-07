import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrevNext } from "@/components/docs/ui";
import { TocInline, TocRail } from "@/components/docs/Toc";
import { bodies } from "@/lib/docs-content";
import { bySlug, docs } from "@/lib/docs";

export function generateStaticParams() {
  return docs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(props: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const d = bySlug(slug);
  return d ? { title: `${d.title} — Zeroth docs`, description: d.description } : {};
}

export default async function DocPage(props: PageProps<"/docs/[slug]">) {
  const { slug } = await props.params;
  const meta = bySlug(slug);
  const Body = bodies[slug];
  if (!meta || !Body) notFound();

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-12">
      <article className="min-w-0 max-w-[740px]">
        <div className="text-[11px] font-semibold tracking-[0.12em] text-accent">{meta.group.toUpperCase()}</div>
        <h1 className="mt-3 text-[clamp(34px,5vw,52px)] font-bold leading-[1.02] tracking-[-0.045em]">{meta.title}</h1>
        <p className="mt-4 text-[17px] leading-[1.55] text-black/65">{meta.description}</p>
        <TocInline headings={meta.headings} />
        <div className="doc mt-10">
          <Body />
        </div>
        <PrevNext slug={slug} />
      </article>
      <aside className="hidden xl:block">
        <div className="sticky top-[calc(var(--header-h,76px)+24px)] py-1">
          <TocRail headings={meta.headings} />
        </div>
      </aside>
    </div>
  );
}
