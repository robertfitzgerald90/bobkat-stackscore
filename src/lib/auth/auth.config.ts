import type { NextAuthConfig } from "next-auth";
import {
  isClientVisibleWorkspaceSection,
  resolveActiveWorkspaceSection,
} from "@/lib/client-workspace/nav";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
  },
  providers: [],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user?.id || auth?.user?.email);
      const userRole = auth?.user?.role;
      const { pathname } = request.nextUrl;
      const isPublic =
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/activate-account") ||
        pathname.startsWith("/technology-snapshot") ||
        pathname.startsWith("/assessment-offer") ||
        pathname.startsWith("/assessment-invitation") ||
        pathname.startsWith("/demo") ||
        pathname.startsWith("/product-overview") ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/vcio-offer") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/api/cron/communications") ||
        pathname.startsWith("/api/checkout") ||
        pathname.startsWith("/api/v1/public/password-reset") ||
        pathname.startsWith("/purchase/success") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/v1/health") ||
        pathname.startsWith("/api/v1/public/technology-snapshot") ||
        pathname.startsWith("/api/v1/public/activate-account") ||
        pathname.startsWith("/api/product-overview");

      if (pathname === "/login" && isLoggedIn) {
        if (userRole === "client") {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      if (isPublic) return true;
      if (!isLoggedIn) return false;

      if (userRole === "client") {
        const customerAllowedExact = new Set([
          "/dashboard",
          "/account",
          "/support",
          "/assessment/start",
          "/onboarding",
        ]);

        if (customerAllowedExact.has(pathname)) {
          return true;
        }

        if (
          pathname === "/clients" ||
          pathname === "/clients/new" ||
          pathname === "/projects" ||
          pathname === "/portfolio" ||
          pathname === "/assessments" ||
          pathname.startsWith("/admin/") ||
          pathname.startsWith("/technology-catalog") ||
          pathname.startsWith("/playbooks") ||
          pathname.startsWith("/settings") ||
          pathname.startsWith("/snapshot-leads")
        ) {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }

        if (/^\/assessments\/[^/]+(\/report)?$/.test(pathname)) {
          return true;
        }

        const clientMatch = pathname.match(/^\/clients\/([^/]+)/);
        if (clientMatch && clientMatch[1] !== "new") {
          const section = resolveActiveWorkspaceSection(pathname);
          if (!isClientVisibleWorkspaceSection(section)) {
            return Response.redirect(
              new URL(clientTechnologyProfilePath(clientMatch[1]), request.nextUrl),
            );
          }
          return true;
        }

        if (pathname.startsWith("/clients")) {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
