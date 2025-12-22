/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable standalone output for Docker
  env: {
    // Note: In production, API calls use relative URLs (window.location.origin)
    // Nginx proxies /api/* to backend, so NEXT_PUBLIC_API_URL is not needed
    // Only set if you need a different API domain
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://nextree.app',
  },
  // Optimize build performance
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Increase static generation timeout (default is 60s)
  // Set to 600s (10 minutes) to handle complex pages
  // Note: All pages use 'use client', so they're automatically dynamic
  staticPageGenerationTimeout: 600, // 10 minutes
  // Optimize build
  experimental: {
    // Reduce build time
    optimizeCss: true,
  },
  // Ensure proper routing
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig

