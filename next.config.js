/** @type {import('next').NextConfig} */

let basePath = "";
let assetPrefix = "";
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
  assetPrefix,
  images: {
    unoptimized: true,
  },
};

module.exports = {
  // React-PDF
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};