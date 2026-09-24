import type { MetadataRoute } from "next";
import { getSiteSettings, getWriting } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";
import { real } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, writing] = await Promise.all([getSiteSettings(), getWriting()]);
  const base = (real(settings?.canonical_url) ?? getSiteUrl()).replace(/\/+$/, "");

  const staticRoutes = ["", "/about", "/experience", "/finance", "/analytics", "/projects", "/writing", "/achievements", "/contact"];

  const pages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  // Only writing pieces that actually have their own page.
  for (const piece of writing) {
    if (!real(piece.slug) || !real(piece.body)) continue;
    pages.push({
      url: `${base}/writing/${piece.slug}`,
      lastModified: new Date(piece.updated_at),
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  return pages;
}
