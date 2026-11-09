import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, embedScene, adaptScene, shipScene, accents } from "@/og/scene";
import { features } from "@/lib/content";

export const size = OG_SIZE;
export const contentType = "image/png";

const scenes = { embed: embedScene, adapt: adaptScene, ship: shipScene } as const;

export function generateStaticParams() {
  return features.map((f) => ({ slug: f.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = features.find((x) => x.slug === slug) ?? features[0];
  const key = f.slug as keyof typeof scenes;
  return new ImageResponse(
    (
      <Frame
        eyebrow={f.tag}
        title={f.title}
        body={f.lead}
        blocks={scenes[key]}
        accent={accents[key]}
      />
    ),
    size,
  );
}
