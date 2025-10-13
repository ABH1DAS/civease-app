/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  instrumentationHook: true,
  images: {
    unoptimized: true, // required for static export
  },
};

export default nextConfig;
