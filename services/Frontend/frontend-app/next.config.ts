import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  eslint: {
    // Durante el build, ignorar errores de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Durante el build, ignorar errores de TypeScript para hacer el build más permisivo
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
