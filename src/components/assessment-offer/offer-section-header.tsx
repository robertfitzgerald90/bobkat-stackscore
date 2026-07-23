import {
  MARKETING_EYEBROW,
  MARKETING_SECTION_DESCRIPTION,
  MARKETING_SECTION_TITLE,
} from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";
import { OfferReveal } from "./offer-reveal";

type OfferSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  align?: "center" | "left";
};

export function OfferSectionHeader({
  eyebrow,
  title,
  description,
  className,
  align = "center",
}: OfferSectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <OfferReveal className={cn(isCenter ? "mb-12 text-center md:mb-16" : "mb-10 md:mb-12", className)}>
      <p className={MARKETING_EYEBROW}>{eyebrow}</p>
      <h2 className={cn(MARKETING_SECTION_TITLE, !isCenter && "mx-0 max-w-none text-left")}>
        {title}
      </h2>
      {description ? (
        <p className={cn(MARKETING_SECTION_DESCRIPTION, !isCenter && "mx-0 max-w-3xl text-left")}>
          {description}
        </p>
      ) : null}
    </OfferReveal>
  );
}
