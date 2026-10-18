import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Next dev validates the incoming Host header. Allow ngrok to reach the
  // development server without changing the browser-facing origin.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io"],
  turbopack: {
    rules: {
      "*.css": {
        // `as: "*.css"` treats a file as a global stylesheet. Without this
        // condition, that also matched `*.module.css` and disabled CSS
        // Modules for the whole app. Scope the Tailwind loader to global CSS.
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    const backend = (
      process.env.FASTAPI_INTERNAL_URL ?? "http://127.0.0.1:8000"
    ).replace(/\/+$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
