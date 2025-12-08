import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  distDir: '.next',
  // Remove output: 'export' to enable client-side routing
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: undefined,
  basePath: '',
};

export default nextConfig;
