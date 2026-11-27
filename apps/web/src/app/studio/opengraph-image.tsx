import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, modelsScene, accents } from "@/og/scene";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Zeroth Model Studio for configuring local AI models";

export default function Image() {
  return new ImageResponse(
    <Frame
      eyebrow="Model Studio"
      title="Build your local model profile."
      body="Explore open GGUF weights, configure an assistant, and run it on your own device with Zeroth."
      blocks={modelsScene}
      accent={accents.models}
    />,
    size,
  );
}
