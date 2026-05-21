import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/workspace',
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
