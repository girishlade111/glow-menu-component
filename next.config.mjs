/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // static export -> deployable to Cloudflare Pages / GitHub Pages
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig