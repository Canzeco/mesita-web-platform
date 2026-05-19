import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /manager/promos was split into Membership (plan + fiscal type + ticket
      // types) and Rewards (per-tier rates). Rewards is the closer match for
      // old bookmarks since most managers landed there for the rate, not the
      // plan.
      { source: "/manager/promos", destination: "/manager/rewards", permanent: true },
      // /manager/subscription renamed to /manager/membership to align with the
      // Verified Partner framing (managers join a network, not subscribe to a
      // SaaS). Permanent because the rename is final.
      { source: "/manager/subscription", destination: "/manager/membership", permanent: true },
      // /manager/console renamed to /manager/home — Home reads more like an
      // owner's daily landing pad than a SaaS "console".
      { source: "/manager/console", destination: "/manager/home", permanent: true },
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
