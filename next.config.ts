import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker production builds
  output: "standalone",
  
  // Disable image optimization if not using Vercel (optional, configure as needed)
  // images: {
  //   unoptimized: true,
  // },
};

export default nextConfig;
