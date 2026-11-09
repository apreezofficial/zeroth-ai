import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, productScene, accents } from "@/og/scene";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Zeroth product: embed, adapt and ship offline AI";

export default function Image() {
  return new ImageResponse(
    (
      <Frame
        eyebrow="Product"
        title="Embed. Adapt. Ship."
        body="One SDK that runs a full model on the device, sizes it to the hardware, and works the same on every platform."
        blocks={productScene}
        accent={accents.product}
      />
    ),
    size,
  );
}
