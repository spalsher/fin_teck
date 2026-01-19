/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@iteck/shared'],
  output: 'standalone',
};

module.exports = nextConfig;
