import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";
import { real } from "@/lib/utils";

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", weight: ["400", "500"] });

/**
 * Metadata is read from the database, so you change your SEO title and
 * description from /admin/settings — not from this file.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const base = real(settings?.canonical_url) ?? getSiteUrl();
  const title = settings?.site_title || "Portfolio";
  const description = settings?.site_description || "";

  return {
    metadataBase: new URL(base),
    title: { default: title, template: `%s | ${title.split("|")[0]?.trim() || title}` },
    description,
    alternates: { canonical: "/" },
    icons: settings?.favicon_url ? { icon: settings.favicon_url } : undefined,
    openGraph: {
      title,
      description,
      url: "/",
      siteName: title,
      type: "website",
      images: settings?.og_image_url ? [{ url: settings.og_image_url, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: settings?.og_image_url ? "summary_large_image" : "summary",
      title,
      description,
      images: settings?.og_image_url ? [settings.og_image_url] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
