import type { NextConfig } from "next";

const appStage = process.env.NEXT_PUBLIC_APP_STAGE?.trim() || "development";
const shouldAllowIndexing = appStage === "production";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  },
  ...(!shouldAllowIndexing
    ? [
        {
          key: "X-Robots-Tag",
          value: "noindex, nofollow"
        }
      ]
    : [])
];

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
