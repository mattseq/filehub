import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  allowedDevOrigins: [process.env.NEXT_PUBLIC_URL!]
};

export default nextConfig;
