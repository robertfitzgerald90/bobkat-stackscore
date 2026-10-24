import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { OfferSectionHeader } from "@/components/assessment-offer/offer-section-header";
import { MARKETING_SECTION, MARKETING_SECTION_ALT } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";

type LearnSectionShellProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  alt?: boolean;
  className?: string;
};

export function LearnSectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  alt = false,
  className,
}: LearnSectionShellProps) {
  return (
    <section id={id} className={cn(alt ? MARKETING_SECTION_ALT : MARKETING_SECTION, "scroll-mt-20", className)}>
      <div className="mx-auto max-w-6xl">
        <OfferSectionHeader eyebrow={eyebrow} title={title} description={description} />
        <OfferReveal>
          <div className="-mt-4 sm:-mt-6">{children}</div>
        </OfferReveal>
      </div>
    </section>
  );
}
