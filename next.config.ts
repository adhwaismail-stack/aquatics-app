import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'aquatics-app.vercel.app',
          },
        ],
        destination: 'https://aquaref.co/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;