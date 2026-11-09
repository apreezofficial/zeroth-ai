import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, customersScene, accents } from "@/og/scene";

export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <Frame
        eyebrow="Customers"
        title="Apps that run offline."
        body="See what gets built with Zeroth, including DRER, a macOS assistant that runs fully on-device."
        blocks={customersScene}
        accent={accents.customers}
      />
    ),
    size,
  );
}
