import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    webpackMemoryOptimizations: true,
  },
  webpack(config, { dev }) {
    if (dev) {
      config.cache = {
        type: "filesystem",
        maxMemoryGenerations: 1,
      };
    }
    return config;
  },
};

export default nextConfig;
