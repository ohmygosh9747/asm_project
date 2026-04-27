import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
<<<<<<< HEAD
=======
  async rewrites() {
    return [
      {
        source: "/upload/:path*",
        destination: "/api/file/:path*",
      },
    ];
  },
>>>>>>> f04e20575b112f284b1efdeb812b6cc0d0fbd454
};

export default nextConfig;
