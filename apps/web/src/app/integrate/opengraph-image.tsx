import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, integrateScene, accents } from "@/og/scene";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Integrate Zeroth: npm i @zeroth-ai/sdk-node, load a model, stream a reply";

export default function Image() {
  return new ImageResponse(
    (
      <Frame
        eyebrow="Integrate"
        title="Plug in one SDK."
        body="npm i @zeroth-ai/sdk-node, call zeroth.load(), stream your first on-device reply."
        blocks={integrateScene}
        accent={accents.integrate}
      />
    ),
    size,
  );
}
