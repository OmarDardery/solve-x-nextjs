import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker production builds
  output: "standalone",
  
  // Mark Prisma as external to prevent Turbopack bundling issues
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  
  // Disable image optimization if not using Vercel (optional, configure as needed)
  // images: {
  //   unoptimized: true,
  // },
};

export default nextConfig;
