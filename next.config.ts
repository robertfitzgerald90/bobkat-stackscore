import type { NextConfig } from "next";
import { BOBKAT_IT_URLS } from "./src/lib/marketing/bobkat-website";

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
      {
        source: "/services",
        destination: BOBKAT_IT_URLS.services,
        permanent: true,
      },
      {
        source: "/solutions",
        destination: BOBKAT_IT_URLS.solutions,
        permanent: true,
      },
      {
        source: "/solutions/:path*",
        destination: `${BOBKAT_IT_URLS.solutions}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
