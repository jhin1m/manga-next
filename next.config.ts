import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

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
    // ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // External packages for server components
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
};

export default nextConfig;
