// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add this to allow getUserMedia on your live domain
  async headers() {
    return [
      {
        // apply to all routes in your app
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            // only allow camera from your own origin
            value: 'camera=(self)',
          },
        ],
      },
    ]
  },
}

export default nextConfig
