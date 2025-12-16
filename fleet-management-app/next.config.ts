import type { NextConfig } from "next";

// Performance optimization: Image optimization configuration
const nextConfig: NextConfig = {
  images: {
    // Enable image optimization
    formats: ['image/webp', 'image/avif'],
    // Add domains for external images if needed
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Performance optimization: Configure image sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Performance optimization: Enable lazy loading by default
    minimumCacheTTL: 60,
  },
  // Performance optimization: Enable React compiler optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Enable standalone output for Docker
  output: 'standalone',
};

export default nextConfig;
