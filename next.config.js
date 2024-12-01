/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental : {
    instrumentationHook: true
  }
}

module.exports = nextConfig
