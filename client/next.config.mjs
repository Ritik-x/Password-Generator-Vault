/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://password-generator-vault.on.render.com/:path*",
      },
    ];
  },
};

export default nextConfig;
