import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";
import { real } from "@/lib/utils";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const base = (real(settings?.canonical_url) ?? getSiteUrl()).replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The dashboard and the sign-in page have no business in search results.
      disallow: ["/admin", "/admin/", "/login"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
