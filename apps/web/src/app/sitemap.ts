import type { MetadataRoute } from "next";
import { docs } from "@/lib/docs";
import { features } from "@/lib/content";

const base = "https://zeroth.apcodesphere.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/about", "/docs", "/integrate", "/models", "/product", "/studio", "/stats"];
  const docPages = docs.map((doc) => `/docs/${doc.slug}`);
  const featurePages = features.map((feature) => `/product/${feature.slug}`);
  return [...staticPages, ...docPages, ...featurePages].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path.startsWith("/docs") ? "monthly" : "weekly",
    priority: path === "" ? 1 : path === "/docs" || path === "/models" || path === "/studio" ? 0.9 : 0.7,
  }));
}
