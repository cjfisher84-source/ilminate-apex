/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Ilminate APEX',
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },
}

module.exports = nextConfig

