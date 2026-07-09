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
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isPublic =
        pathname.startsWith("/login") ||
        pathname.startsWith("/activate-account") ||
        pathname.startsWith("/technology-snapshot") ||
        pathname.startsWith("/assessment-offer") ||
        pathname.startsWith("/purchase/success") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/v1/health") ||
        pathname.startsWith("/api/v1/public/technology-snapshot") ||
        pathname.startsWith("/api/v1/public/activate-account");

      if (pathname === "/login" && isLoggedIn) {
        if (auth.user?.role === "client") {
          return Response.redirect(new URL("/assessment/start", request.nextUrl));
        }
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      if (isPublic) return true;
      if (!isLoggedIn) return false;

      if (auth.user?.role === "client") {
        const clientMatch = pathname.match(/^\/clients\/([^/]+)/);
        if (clientMatch && clientMatch[1] !== "new") {
          const section = resolveActiveWorkspaceSection(pathname);
          if (!isClientVisibleWorkspaceSection(section)) {
            return Response.redirect(
              new URL(clientTechnologyProfilePath(clientMatch[1]), request.nextUrl),
            );
          }
        }
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
