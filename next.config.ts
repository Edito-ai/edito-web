import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve images directly from src without Next.js optimization pipeline.
    // This bypasses the private-IP restriction for our local R2 proxy on localhost:5000.
    unoptimized: true,
  },
};

export default nextConfig;
