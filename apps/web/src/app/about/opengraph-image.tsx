import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, aboutScene, accents } from "@/og/scene";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "About Zeroth: private AI by default";

export default function Image() {
  return new ImageResponse(
    (
      <Frame
        eyebrow="About"
        title="Private AI, by default."
        body="We build the runtime that lets apps run AI on the device, so prompts and user data never reach a server."
        blocks={aboutScene}
        accent={accents.about}
      />
    ),
    size,
  );
}
