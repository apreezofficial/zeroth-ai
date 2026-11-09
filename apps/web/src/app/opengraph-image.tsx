import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, pipeScene, accents } from "@/og/scene";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Zeroth, unlimited AI with zero internet";

export default function Image() {
  return new ImageResponse(
    (
      <Frame
        eyebrow="Offline AI SDK"
        title="Unlimited AI. Zero internet."
        body="Run open-weight models on the device. No servers, no API keys, no data leaving the phone."
        blocks={pipeScene}
        accent={accents.home}
        artWidth={560}
        artHeight={460}
      />
    ),
    size,
  );
}
