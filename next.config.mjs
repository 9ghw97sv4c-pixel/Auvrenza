/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Product photos are admin-supplied URLs (Supabase Storage, Cloudinary, a CDN, etc.)
    // so we allow any https host rather than an allowlist. Tighten this to specific
    // hostnames if you want stricter control once you know where images will live.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};
export default nextConfig;
