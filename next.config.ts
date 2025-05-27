import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/**',
      },
     
      {
        protocol: 'https',
        hostname: 'Kino-Fullstack-jp*.vercel.app', 
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;