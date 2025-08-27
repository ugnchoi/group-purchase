import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Disable any i18n features
  },
  // Force disable i18n
  i18n: undefined,
};

export default nextConfig;
