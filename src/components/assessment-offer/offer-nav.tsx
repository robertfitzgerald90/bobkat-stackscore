import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { cn } from "@/lib/utils";

const navLinkClassName =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

export function OfferNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/assessment-offer" className="min-w-0 shrink transition-opacity hover:opacity-90">
          <BrandLogo size={32} showText className="gap-2" />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Bobkat IT services">
          <Link
            href="/services"
            className={cn(navLinkClassName, "rounded-md px-3 py-1.5 hover:bg-muted/60")}
          >
            Services
          </Link>
          <Link
            href={SERVICES_CTA_DESTINATIONS.purchaseAssessment.href}
            className={cn(
              navLinkClassName,
              "rounded-md bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/15 hover:text-primary",
            )}
          >
            Assessment
          </Link>
        </nav>

        <TechnologySnapshotLink
          label={SERVICES_CTA_DESTINATIONS.snapshot.label}
          className="h-9 shrink-0 px-3 text-xs sm:px-4 sm:text-sm"
          placement="offer_nav"
        />
      </div>
    </header>
  );
}
