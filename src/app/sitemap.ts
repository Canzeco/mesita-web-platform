import type { MetadataRoute } from "next";

// Static sitemap for the landing surface. Venue detail pages aren't included
// yet — they live behind a dynamic [id] and aren't intended for public SEO
// crawling at v0 (they'll be added once we publish the public city catalog).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://mesita.ai";
  const now = new Date();
  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/guest/sign-in`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/guest/sign-up`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/manager/sign-up`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
