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
      // Legacy assessment invitation path variants (emails / external bookmarks)
      {
        source: "/assessment/invitation",
        destination: "/assessment-invitation",
        permanent: true,
      },
      {
        source: "/assessment/invitation/:path*",
        destination: "/assessment-invitation",
        permanent: true,
      },
      {
        source: "/assessment/invite",
        destination: "/assessment-invitation",
        permanent: true,
      },
      {
        source: "/assessment/invite/:path*",
        destination: "/assessment-invitation",
        permanent: true,
      },
      // Legacy activation path
      {
        source: "/activate",
        destination: "/activate-account",
        permanent: true,
      },
      // Common mistaken auth entry points
      {
        source: "/register",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/signup",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/sign-up",
        destination: "/login",
        permanent: false,
      },
      // Legacy Stripe confirmation bookmarks (app pages also redirect; keep config-level too)
      {
        source: "/purchase/success",
        destination: "/assessment-purchased",
        permanent: true,
      },
      {
        source: "/vcio-offer/success",
        destination: "/subscription-activated",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
