import Link from "next/link";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { cn } from "@/lib/utils";

type PublicMarketingNavProps = {
  active: "solutions" | "services" | "assessment";
};

const navLinks = [
  { href: "/solutions", label: "Solutions", key: "solutions" },
  { href: "/services", label: "Services", key: "services" },
  { href: "/assessment-offer", label: "Assessment", key: "assessment" },
] as const;

const navLinkClassName =
  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground";

export function PublicMarketingNav({ active }: PublicMarketingNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/solutions" className="min-w-0 shrink transition-opacity hover:opacity-90">
          <BrandLogo size={32} showText className="gap-2" />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Bobkat IT public pages">
          {navLinks.map((link) => {
            const isActive = active === link.key;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  navLinkClassName,
                  isActive &&
                    "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <TechnologySnapshotLink
          label={SERVICES_CTA_DESTINATIONS.snapshot.label}
          className="h-9 shrink-0 px-3 text-xs sm:px-4 sm:text-sm"
          placement={`${active}_nav`}
        />
      </div>
    </header>
  );
}
