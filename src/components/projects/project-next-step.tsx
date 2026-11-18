import Link from "next/link";
import { ArrowRight, Flag, MessageSquare, TriangleAlert } from "lucide-react";
import type { CustomerProjectDetailDto } from "@/lib/customer-portal/projects-dto";
import { getProjectNextStep } from "@/lib/projects/workspace-next-step";
import { cn } from "@/lib/utils";

export function ProjectNextStep({
  detail,
}: {
  detail: CustomerProjectDetailDto;
}) {
  const step = getProjectNextStep(detail);
  const latest = detail.publishedUpdates[0];
  const Icon = step.urgent ? TriangleAlert : Flag;
  return (
    <section
      aria-label="Project next step and latest update"
      className="grid gap-4 md:grid-cols-2"
    >
      <div
        className={cn(
          "min-w-0 rounded-xl border p-5",
          step.urgent
            ? "border-warning/40 bg-warning/5"
            : "border-primary/30 bg-primary/5",
        )}
      >
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <Icon className="h-4 w-4" aria-hidden />
          Next step
        </p>
        <h2 className="mt-3 break-words text-base font-semibold">
          {step.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {step.description}
        </p>
        <Link
          href={step.href}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          {step.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <div className="min-w-0 rounded-xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <MessageSquare className="h-4 w-4 text-primary" aria-hidden />
          Latest published update
        </p>
        <h2 className="mt-3 break-words text-base font-semibold">
          {latest?.subject ||
            (latest ? "Project update" : "No published updates yet")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {latest
            ? `Published ${latest.publishedAtLabel}. Read what is complete, what is underway, and what comes next.`
            : "Published updates from Bobkat IT will appear here. Current delivery progress is available below."}
        </p>
        {latest ? (
          <Link
            href="#project-updates"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Read update
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
