/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVE THIS LINE if you're on Vercel:
  // output: 'standalone',

  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
