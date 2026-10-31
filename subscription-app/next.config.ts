import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    root: path.join(__dirname),
  },
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;