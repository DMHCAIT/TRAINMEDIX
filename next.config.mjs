/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Prevent static generation of API routes during build
  typescript: {
    // Allow build to succeed even with type errors in unreachable code
    tsconfigPath: './tsconfig.json',
  },
};

export default nextConfig;
