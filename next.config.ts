import type { NextConfig } from "next";
import path from "node:path";

const githubPages = process.env.GITHUB_PAGES === "true";
const basePath = githubPages ? "/personal-site" : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
