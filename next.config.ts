import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Explicitly set the Turbopack root so Next.js
  // doesn't incorrectly infer the workspace root
  // from another lockfile outside this project.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;