import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, docsHomeScene, accents } from "@/og/scene";

export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <Frame
        eyebrow="Documentation"
        title="Build with Zeroth."
        body="Guides, API reference and the CLI for running models fully offline."
        blocks={docsHomeScene}
        accent={accents.docs}
      />
    ),
    size,
  );
}
