import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Experimental features for better build handling
  experimental: {
    // Skip static generation for pages that fail during build
    fallbackNodePolyfills: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      }
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Handle build-time database connection issues
  env: {
    SKIP_BUILD_STATIC_GENERATION: 'true',
  },
};

export default nextConfig;
