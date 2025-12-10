/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Netlify deployment with serverless functions
  output: undefined, // Remove static export to allow API routes
  trailingSlash: true,
  
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Turbopack configuration
  turbopack: {
    // Enable or disable Turbopack features here
  },
  
  // Image optimization
  images: {
    // Configure remote patterns for Next.js Image component
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sweet-cheesecake-1b4117.netlify.app',
      },
      {
        protocol: 'https',
        hostname: '*.netlify.app',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_SITE_URL: process.env.URL || 'http://localhost:3000',
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Server components external packages
  serverExternalPackages: ['@supabase/supabase-js'],
};

module.exports = nextConfig;
