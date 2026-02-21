/** @type {import('next').NextConfig} */
const apiTarget = process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@iteck/shared'],
  output: 'standalone',
  // Proxy /api to backend so browser uses same origin (avoids CORS / network errors)
  async rewrites() {
    const base = apiTarget.replace(/\/api\/?$/, '');
    return [{ source: '/api/:path*', destination: `${base}/api/:path*` }];
  },
};

module.exports = nextConfig;
