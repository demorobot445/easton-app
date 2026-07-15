import type { NextConfig } from "next";

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
};

export default nextConfig;
