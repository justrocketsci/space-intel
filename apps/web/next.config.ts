import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@space-intel/api",
    "@space-intel/db",
    "@space-intel/ai",
    "@space-intel/ingestion",
  ],
};

export default nextConfig;
