import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, modelsScene, accents } from "@/og/scene";

export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <Frame
        eyebrow="Models"
        title="Open models, on device."
        body="Four 2026 models, 0.7 to 3.4 GB, 4-bit and SHA-256 verified. Sizes, memory and reported speeds."
        blocks={modelsScene}
        accent={accents.models}
      />
    ),
    size,
  );
}
