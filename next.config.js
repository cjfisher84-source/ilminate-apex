/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Ilminate APEX',
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },
  async rewrites() {
    return [
      {
        source: '/api/harborsim/:path*',
        destination: 'https://g2gjxp3gbg.execute-api.us-east-1.amazonaws.com/api/harborsim/:path*',
      },
    ]
  },
}

module.exports = nextConfig

