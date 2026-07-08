import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AssessmentPurchaseButton } from "@/components/purchase/assessment-purchase-button";

export function OfferNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/assessment-offer" className="min-w-0 shrink transition-opacity hover:opacity-90">
          <BrandLogo size={32} showText className="gap-2" />
        </Link>
        <AssessmentPurchaseButton
          label="Start My Assessment"
          className="h-9 shrink-0 px-4 text-sm shadow-sm"
        />
      </div>
    </header>
  );
}
