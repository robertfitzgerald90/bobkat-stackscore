import { OfferReveal } from "./offer-reveal";

type OfferSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function OfferSectionHeader({
  eyebrow,
  title,
  description,
  className,
}: OfferSectionHeaderProps) {
  return (
    <OfferReveal className={className ?? "mb-10 text-center md:mb-14"}>
      <p className="text-sm font-medium uppercase tracking-wider text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">{title}</h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </OfferReveal>
  );
}
