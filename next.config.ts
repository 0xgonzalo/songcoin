import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'cdn.neynar.com',
      'pbs.twimg.com',
      'storage.googleapis.com',
      'res.cloudinary.com',
    ],
  },
};

export default nextConfig;
