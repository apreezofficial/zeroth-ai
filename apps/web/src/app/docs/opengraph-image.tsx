import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, docsHomeScene, accents } from "@/og/scene";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Zeroth documentation";

export default function Image() {
  return new ImageResponse(
    (
      <Frame
        eyebrow="Documentation"
        title="Build with Zeroth."
        body="Load a model, stream replies, get JSON, call tools. Guides, CLI and every error code."
        blocks={docsHomeScene}
        accent={accents.docs}
      />
    ),
    size,
  );
}
