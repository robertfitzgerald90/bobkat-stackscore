import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ServicesCtaLink } from "@/components/services/services-cta-link";

export function ProductOverviewHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo size={32} variant="stacked" className="shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">StackScore Product Overview</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Interactive client experience preview
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Public Demo
          </Badge>
          <ServicesCtaLink
            cta="purchaseAssessment"
            label="Get Your StackScore"
            variant="outline"
            placement="product_overview_header"
            className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
          />
        </div>
      </div>
    </header>
  );
}
