import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
    largePageDataBytes: 500 * 1024 * 1024, // 500MB
  },
}

export default nextConfig;
