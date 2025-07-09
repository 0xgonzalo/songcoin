import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.neynar.com',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net', // Neynar profile images
      },
      {
        protocol: 'https',
        hostname: 'avatars.slack-edge.com', // Slack avatars (if any)
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'turquoise-effective-hyena-697.mypinata.cloud',
      },
      {
        protocol: 'https',
        hostname: '*.mypinata.cloud',
        pathname: '/**',
      },
    ],
  },
  // Configure external packages for server components
  serverExternalPackages: [],
};

export default nextConfig;
