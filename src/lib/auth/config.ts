import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authConfig } from "./auth.config";
import {
  clearLoginEmailFailures,
  enforceLoginRateLimits,
} from "@/lib/auth/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Surfaced to the client as CredentialsSignin with code=rate_limited (no account hints). */
export class RateLimitedSignin extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        try {
          const normalized = {
            email:
              typeof credentials?.email === "string"
                ? credentials.email.trim().toLowerCase()
                : "",
            password:
              typeof credentials?.password === "string" ? credentials.password : "",
          };

          const parsed = credentialsSchema.safeParse(normalized);
          if (!parsed.success) return null;

          const rate = await enforceLoginRateLimits({
            request,
            email: parsed.data.email,
          });
          if (!rate.allowed) {
            console.warn("[auth] login rate limited", {
              backendError: Boolean(rate.backendError),
            });
            throw new RateLimitedSignin();
          }

          const user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
          });

          // Email admission already consumed in enforceLoginRateLimits.
          // Failures keep the slot; success clears so mistypes do not lock out.
          if (!user || !user.isActive) {
            return null;
          }

          const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!valid) {
            return null;
          }

          await clearLoginEmailFailures(parsed.data.email);

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          if (error instanceof RateLimitedSignin) throw error;
          console.error("[auth] authorize failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      return !!user;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: String(token.email).toLowerCase() },
          select: { id: true, role: true, isActive: true },
        });
        if (dbUser?.isActive) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        } else {
          token.invalid = true;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.invalid || !token.id) {
        return { ...session, user: undefined };
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
      }
      return session;
    },
  },
});
