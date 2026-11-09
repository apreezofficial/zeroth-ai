import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, modelsScene, accents } from "@/og/scene";

export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <Frame
        eyebrow="Models"
        title="Open-weight models, on device."
        body="Small 2026 models from 1.2B to 3B, quantised to 4-bit and checked against their published hashes."
        blocks={modelsScene}
        accent={accents.models}
      />
    ),
    size,
  );
}
