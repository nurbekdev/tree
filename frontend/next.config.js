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
  // Disable static generation for all pages (all pages are client-side)
  // This prevents timeout issues during build
  output: 'standalone',
  // Increase static generation timeout (default is 60s)
  // Set to 600s (10 minutes) to handle complex pages
  staticPageGenerationTimeout: 600, // 10 minutes
  // Optimize build
  experimental: {
    // Reduce build time
    optimizeCss: true,
  },
  // Skip static optimization for faster builds
  generateBuildId: async () => {
    return 'build-' + Date.now()
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

