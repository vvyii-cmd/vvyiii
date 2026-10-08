import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `next build` writes plain HTML/CSS/JS to `out/`,
  // which the Cloudflare Worker serves as static assets.
  output: "export",
  images: {
    unoptimized: true,
  },
  turbopack: {
    // The app also builds inside the company user-content monorepo, which has
    // its own lockfiles — pin the workspace root to this directory.
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
