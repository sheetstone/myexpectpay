import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    webpackMemoryOptimizations: true,
  },
  // Allow the Firebase Auth popup to communicate back to our window.
  // Without this, signInWithPopup silently fails on some COOP-restricted environments.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ]
  },
  // Silence the "webpack config but no turbopack config" error in Next.js 16.
  // The webpack function below only applies to the --webpack dev server.
  turbopack: {},
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
