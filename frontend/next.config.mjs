/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // On Vercel, multi-service rewrites in vercel.json handle /api/(.*) directly at edge
    if (process.env.VERCEL) {
      return [];
    }
    const backendUrl = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
