/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable caching to avoid build issues
  experimental: {
    webpackBuildWorker: false,
    parallelServerBuildTraces: false,
    parallelServerCompiles: false,
  },
  // Fix hydration issues
  reactStrictMode: false,
  swcMinify: false,
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Ignore warnings that can cause build failures
    config.ignoreWarnings = [
      { module: /node_modules\/next-themes/ },
      { module: /node_modules\/@supabase/ }
    ]
    
    // Fix for Supabase in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
}

export default nextConfig