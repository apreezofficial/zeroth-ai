import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, aboutScene, accents } from "@/og/scene";

export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <Frame
        eyebrow="About"
        title="Private AI, by default."
        body="We build the runtime that lets apps think on the device, so user data never has to leave it."
        blocks={aboutScene}
        accent={accents.about}
      />
    ),
    size,
  );
}
