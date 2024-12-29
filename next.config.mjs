import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './supabase-image-loader.js',
  },
};

if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}
export default nextConfig
