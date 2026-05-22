import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/pelispace',
  // Necessário para Vercel CLI 54+ com Next.js 16 + Turbopack:
  // sem esse campo, modifyConfig do Vercel recebe path=undefined e o build quebra.
  turbopack: {
    root: '.',
  },
};

export default nextConfig;
