// next.config.js
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: "custom",
    loaderFile: "./supabase-image-loader.js",
  },
  webpack: (config) => {
    // Extend the default aliases to include "@"
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.join(__dirname, "src"),
    };
    return config;
  },
};

// If you only need `setupDevPlatform()` for local Cloudflare dev,
// remove or comment it out for Vercel. 
// Or wrap it in a condition that Vercel won't trigger.
// Example:
if (process.env.NODE_ENV === "development" && process.env.USE_CLOUDFLARE) {
  import('@cloudflare/next-on-pages/next-dev').then(({ setupDevPlatform }) => {
    setupDevPlatform();
  });
}

export default nextConfig;