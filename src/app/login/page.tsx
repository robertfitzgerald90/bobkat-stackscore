import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { CornerBrackets } from "@/components/design-system/instrument/corner-brackets";
import { BRAND } from "@/lib/branding";
import { BOBKAT_IT_LOGO, bobkatLogoSrc } from "@/lib/branding/assets";
import { MARKETING_AUTH_CARD, MARKETING_AUTH_SHELL } from "@/lib/marketing/tokens";

/** SS-BRAND-004-R1 — Login emblem ~100px wide (desktop) / ~80px (mobile). */
const LOGIN_LOGO_WIDTH_DESKTOP = 100;
const LOGIN_LOGO_HEIGHT_DESKTOP = Math.round(
  LOGIN_LOGO_WIDTH_DESKTOP / BOBKAT_IT_LOGO.aspectRatio,
);

export default function LoginPage() {
  const year = new Date().getFullYear();

  return (
    <PublicPageShell variant="auth">
      <main className={`${MARKETING_AUTH_SHELL} brand-level-2 py-12 sm:py-16 md:py-24`}>
        <div className="flex w-full max-w-md flex-col items-center">
          <Link
            href="/"
            className="flex justify-center transition-opacity hover:opacity-90"
            aria-label={`${BRAND.companyName} home`}
          >
            {/* Login-only sizing — does not change shared BrandLogo placements */}
            <span className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18)_0%,transparent_68%)] p-2.5 sm:p-3.5">
              <Image
                src={bobkatLogoSrc()}
                alt={BOBKAT_IT_LOGO.alt}
                width={LOGIN_LOGO_WIDTH_DESKTOP}
                height={LOGIN_LOGO_HEIGHT_DESKTOP}
                className="h-auto w-20 object-contain sm:w-[100px]"
                priority
              />
            </span>
          </Link>

          <h1 className="mt-7 text-3xl font-semibold uppercase tracking-[0.08em] text-foreground sm:mt-8 sm:text-4xl">
            {BRAND.productName}
          </h1>
          <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            By {BRAND.companyName}
          </p>
          <p className="mt-5 max-w-sm text-center text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
            Secure access to assessments, reports, roadmap, and your technology intelligence
            workspace.
          </p>

          <CornerBrackets corners="two" className="mt-10 w-full sm:mt-12">
            <div className={`${MARKETING_AUTH_CARD} p-8 sm:p-10`}>
              <Suspense>
                <LoginForm />
              </Suspense>
            </div>
          </CornerBrackets>

          <footer className="mt-12 space-y-1 text-center text-xs leading-relaxed text-muted-foreground/75">
            <p>
              {BRAND.productName} · Powered by {BRAND.companyName}
            </p>
            <p>© {year}</p>
          </footer>
        </div>
      </main>
    </PublicPageShell>
  );
}
