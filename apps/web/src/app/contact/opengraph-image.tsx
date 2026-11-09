import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, contactScene, accents } from "@/og/scene";

export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <Frame
        eyebrow="Contact"
        title="Talk to the team."
        body="Questions about the SDK, the models or shipping on-device AI? Message the team."
        blocks={contactScene}
        accent={accents.contact}
      />
    ),
    size,
  );
}
