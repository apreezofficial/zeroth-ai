import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, randomCluster, accents } from "@/og/scene";
import { docs, bySlug } from "@/lib/docs";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Zeroth documentation page";

export function generateStaticParams() {
  return docs.map((d) => ({ slug: d.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = bySlug(slug);
  return new ImageResponse(
    (
      <Frame
        eyebrow={`Docs · ${d?.group ?? "Zeroth"}`}
        title={d?.title ?? "Documentation"}
        body={d?.description ?? "Zeroth documentation"}
        blocks={randomCluster(slug)}
        accent={accents.docs}
      />
    ),
    size,
  );
}
