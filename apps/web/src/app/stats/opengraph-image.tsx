import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, statsScene, accents } from "@/og/scene";

export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <Frame
        eyebrow="Stats"
        title="Downloads, straight from npm."
        body="Last day, week and month for every Zeroth package, plus a 30-day chart."
        blocks={statsScene}
        accent={accents.stats}
      />
    ),
    size,
  );
}
