import { presentRecommendationDescription } from "@/lib/customer-portal/recommendation-content";

const SECTION_HEADINGS = [
  { key: "finding", title: "Finding" },
  { key: "recommendedAction", title: "Recommended action" },
  { key: "expectedOutcome", title: "Expected outcome" },
  { key: "implementationConsiderations", title: "Implementation considerations" },
] as const;

function SectionBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="space-y-1.5">
      <h4 className="text-xs font-semibold uppercase tracking-wide">
        <span className="text-primary">{title}</span>
      </h4>
      <p className="whitespace-pre-line break-words text-sm leading-relaxed text-foreground">
        {body}
      </p>
    </section>
  );
}

/**
 * Renders stored recommendation description. Structured labels become sections.
 * Legacy text stays as paragraphs. Does not rewrite or invent copy.
 */
export function InitiativeRecommendationContent({
  description,
}: {
  description: string;
}) {
  const presented = presentRecommendationDescription(description);

  if (presented.sections.hasStructuredSections) {
    const { sections } = presented;
    return (
      <div className="mt-4 space-y-4">
        {sections.leadingText ? (
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-foreground">
            {sections.leadingText}
          </p>
        ) : null}
        {SECTION_HEADINGS.map((section) => {
          const body = sections[section.key];
          if (!body) return null;
          return <SectionBlock key={section.key} title={section.title} body={body} />;
        })}
      </div>
    );
  }

  if (presented.paragraphs.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      {presented.paragraphs.map((paragraph, index) => (
        <p
          key={`${index}-${paragraph.slice(0, 24)}`}
          className="whitespace-pre-line break-words text-sm leading-relaxed text-foreground"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function InitiativeBusinessBenefit({ text }: { text: string }) {
  const benefit = text.trim();
  if (!benefit) return null;

  return (
    <aside className="mt-4 border border-primary/25 bg-primary/5 px-3 py-3 sm:px-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide">
        <span className="text-primary">Business benefit</span>
      </h4>
      <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-foreground">
        {benefit}
      </p>
    </aside>
  );
}
