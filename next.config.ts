import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/product-overview",
        destination: "/demo",
        permanent: true,
      },
      {
        source: "/product-overview/:path*",
        destination: "/demo",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
