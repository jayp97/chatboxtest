import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * Configures the Next.js application with Mastra integration support
 */
const nextConfig: NextConfig = {
  // External packages that should not be bundled in server builds
  serverExternalPackages: ["@mastra/*"],
  
  // Experimental features configuration
  experimental: {
    serverActions: {
      // Increased body size limit for handling larger AI responses
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
