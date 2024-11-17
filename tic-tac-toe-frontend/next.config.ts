import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    SERVER_URL: process.env.SERVER_URL,
    SERVER_PORT: process.env.SERVER_PORT,
  },
};

export default nextConfig;
