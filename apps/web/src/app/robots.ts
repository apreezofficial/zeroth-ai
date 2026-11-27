import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://zeroth.apcodesphere.xyz/sitemap.xml",
    host: "https://zeroth.apcodesphere.xyz",
  };
}
