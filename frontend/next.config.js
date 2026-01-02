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
  // Set to 300s (5 minutes) to handle complex pages
  // Note: All pages use 'use client', so they're automatically dynamic
  staticPageGenerationTimeout: 300, // 5 minutes
  // Disable source maps for faster builds
  productionBrowserSourceMaps: false,
  // Optimize build - disable unnecessary checks during build
  typescript: {
    // Skip type checking during build (faster, but less safe)
    // Type checking should be done in CI/CD separately
    ignoreBuildErrors: true, // Skip type checking for faster builds
  },
  eslint: {
    // Skip ESLint during build (faster)
    // Linting should be done in CI/CD separately
    ignoreDuringBuilds: true,
  },
  // Optimize build
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['react-icons', 'date-fns', 'recharts'],
    // Enable webpack build worker for parallel builds (faster)
    webpackBuildWorker: true,
  },
  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Optimize for production builds
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        // Disable source maps for faster builds
        minimize: true,
        // Reduce chunk size
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunks
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunks
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      }
      
      // Disable source maps for faster builds
      config.devtool = false
    }
    return config
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
  // Generate unique build ID
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig

