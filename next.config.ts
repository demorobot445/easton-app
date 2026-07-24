import type { NextConfig } from "next";

const payloadApiUrl = process.env.NEXT_PUBLIC_PAYLOAD_API_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "admin.eastonschirra.com" },
    ],
  },
  async rewrites() {
    if (!payloadApiUrl) return [];

    return [
      {
        source: "/payload/api/:path*",
        destination: `${payloadApiUrl}/api/:path*`,
      },
      {
        source: "/payload/media/:path*",
        destination: `${payloadApiUrl}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
