import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClientSectionHeader } from "@/components/client-ui";
import { CLIENT_EQUAL_CARD_GRID, CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import type { CustomerRoadmapNextAction } from "@/lib/customer-portal/roadmap-dto";
import { cn } from "@/lib/utils";

type RoadmapNextActionsProps = {
  actions: CustomerRoadmapNextAction[];
};

export function RoadmapNextActions({ actions }: RoadmapNextActionsProps) {
  if (actions.length === 0) return null;

  return (
    <section className="space-y-4" aria-labelledby="roadmap-next-actions-heading">
      <ClientSectionHeader
        eyebrow="Next actions"
        title="Recommended next steps"
        description="Contextual actions using existing portal routes and booking links — no new workflows."
      />
      <h2 id="roadmap-next-actions-heading" className="sr-only">
        Next actions
      </h2>
      <ul className={cn(CLIENT_EQUAL_CARD_GRID, "sm:grid-cols-2 xl:grid-cols-2")}>
        {actions.map((action) => (
          <li key={action.id} className="h-full">
            <Link
              href={action.href}
              {...(action.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={cn(
                CLIENT_SURFACE_CARD,
                "flex h-full flex-col justify-between gap-3 rounded-sm border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
              )}
            >
              <div>
                <p className="font-medium text-foreground">{action.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
              </div>
              <span className="inline-flex items-center text-xs font-medium text-primary">
                Continue
                <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
