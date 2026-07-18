import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/auth.config";
import { resolveLegacyDomainRedirect } from "@/lib/url/legacy-domain-redirect";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const legacyRedirect = resolveLegacyDomainRedirect(request);
  if (legacyRedirect) {
    return NextResponse.redirect(legacyRedirect, 308);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
