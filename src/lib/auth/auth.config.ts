import type { NextAuthConfig } from "next-auth";

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
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/v1/health");

      if (pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      if (isPublic) return true;
      return isLoggedIn;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
