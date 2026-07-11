import Link from "next/link";
import { ArrowRight, Layers, Library, Package } from "lucide-react";
import {
  TechnologyLifecycleBadge,
  TechnologyStandardBadge,
} from "@/components/technology-catalog/technology-catalog-badges";
import type { CatalogTechnologySummary } from "@/lib/technology-catalog/types";
import { cn } from "@/lib/utils";

export function TechnologyFeatureCard({
  technology,
  className,
}: {
  technology: CatalogTechnologySummary;
  className?: string;
}) {
  return (
    <Link
      href={`/technology-catalog/${technology.slug}`}
      className={cn(
        "group stat-card flex h-full flex-col rounded-xl bg-card p-5 transition-colors hover:bg-surface-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{technology.name}</h3>
          <TechnologyStandardBadge status={technology.standardStatus} />
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent-blue" />
      </div>

      <p className="mt-3 text-sm font-medium text-secondary-token">{technology.categoryName}</p>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{technology.summary}</p>

      <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        {technology.topCapabilities.slice(0, 3).map((capability) => (
          <li key={capability} className="flex gap-2">
            <span className="text-accent-blue" aria-hidden>
              •
            </span>
            <span>{capability}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border/70 pt-4 text-center text-xs">
        <div>
          <p className="font-semibold text-foreground">{technology.mappedPillarCount}</p>
          <p className="text-muted-foreground">Pillars</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">{technology.playbookCount}</p>
          <p className="text-muted-foreground">Playbooks</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">{technology.productCount}</p>
          <p className="text-muted-foreground">Products</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {technology.stackLayer ? (
          <span className="inline-flex items-center gap-1">
            <Layers className="size-3.5" aria-hidden />
            {technology.stackLayer}
          </span>
        ) : null}
        <TechnologyLifecycleBadge status={technology.lifecycleStatus} />
      </div>
    </Link>
  );
}

export function TechnologyCatalogMetrics({
  preferredCount,
  productCount,
  pillarMappings,
  playbookCount,
}: {
  preferredCount: number;
  productCount: number;
  pillarMappings: number;
  playbookCount: number;
}) {
  const metrics = [
    { label: "Preferred Technologies", value: preferredCount, icon: Package },
    { label: "Approved Products", value: productCount, icon: Library },
    { label: "Mapped StackScore Pillars", value: pillarMappings, icon: Layers },
    { label: "Available Playbooks", value: playbookCount, icon: Library },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="stat-card rounded-xl bg-card p-4">
            <div className="flex items-center gap-2 text-accent-blue">
              <Icon className="size-4" aria-hidden />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {metric.label}
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{metric.value}</p>
          </div>
        );
      })}
    </div>
  );
}
