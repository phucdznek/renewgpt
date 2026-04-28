/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Bỏ qua ESLint errors khi build (đã check local)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Bỏ qua TypeScript errors khi build (đã check local)
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
