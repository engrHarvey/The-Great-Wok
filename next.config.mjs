/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "storage.googleapis.com",
    ],
  },
  reactStrictMode: true,
  swcMinify: true,};

export default nextConfig;
