import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /manager/promos was split into Subscription (plan + fiscal type) and
      // Rewards (rate + ticket types). Rewards is the closer match for old
      // bookmarks since most managers landed there for the rate, not the plan.
      { source: "/manager/promos", destination: "/manager/rewards", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      // Mock photography (legacy mock-data fallbacks).
      { protocol: "https", hostname: "images.unsplash.com" },
      // Google Places photo CDN — Places API returns photoUri pointing here.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "lh4.googleusercontent.com" },
      { protocol: "https", hostname: "lh5.googleusercontent.com" },
      { protocol: "https", hostname: "lh6.googleusercontent.com" },
      // Firecrawl-extracted website images can come from anywhere — accept
      // any HTTPS host. Tighten later if you want strict provenance.
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
