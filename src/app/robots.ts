import type { MetadataRoute } from "next";

// Allow indexing of the landing page; everything behind auth is gated by
// middleware anyway, so we don't need to exclude it explicitly. We still
// list /manager + /validator + /admin under disallow because those redirect
// to sign-in and have no useful content for crawlers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/manager", "/manager/", "/validator", "/admin", "/auth/"],
      },
    ],
    sitemap: "https://mesita.ai/sitemap.xml",
  };
}
