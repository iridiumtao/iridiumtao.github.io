/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  reactStrictMode: true,
  output: isDev ? undefined : 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;