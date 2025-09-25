/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export", // generates static HTML
  images: {
    unoptimized: true, // required for static export
  },
  basePath: isProd ? "/civease" : "", // repo name
};


