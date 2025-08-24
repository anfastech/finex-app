import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Suppress React DevTools warning
  devIndicators: {
    buildActivity: false,
  },
  images: {
    // Disable image optimization warnings
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Suppress specific warnings
  // logging: {
  //   level: "error", // Only show errors, not warnings
  // },
};

export default nextConfig;
