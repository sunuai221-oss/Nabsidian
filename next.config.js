/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
  },
  // Next.js 16+ turbopack config is top-level (not under `experimental`)
  // This also silences the "workspace root inferred" warning when you have
  // multiple lockfiles in parent directories.
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig
