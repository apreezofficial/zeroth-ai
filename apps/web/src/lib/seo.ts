import type { Metadata } from "next";

const SITE_URL = "https://zeroth.apcodesphere.xyz";

export function pageMetadata({
  title,
  description,
  path,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  const canonical = new URL(path, SITE_URL).toString();
  const image = `${path === "/" ? "" : path}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical },
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: "Zeroth",
      locale: "en_US",
      url: canonical,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
