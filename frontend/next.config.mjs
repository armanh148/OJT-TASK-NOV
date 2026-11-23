/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // If BACKEND_URL is explicitly configured, route /api calls to that backend
    if (process.env.BACKEND_URL) {
      const backendUrl = process.env.BACKEND_URL.replace(/\/$/, '');
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    }
    // On Vercel multi-service, vercel.json handles /api at the edge
    if (process.env.VERCEL) {
      return [];
    }
    const backendUrl = 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
