"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  TechnologyLifecycleBadge,
  TechnologyMetaGrid,
  TechnologyStandardBadge,
} from "@/components/technology-catalog/technology-catalog-badges";
import type { CatalogTechnologyDetail } from "@/lib/technology-catalog/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "capabilities", label: "Capabilities" },
  { id: "products", label: "Products" },
  { id: "deployment", label: "Deployment Standard" },
  { id: "business", label: "Business Value" },
  { id: "pillars", label: "StackScore Mapping" },
  { id: "governance", label: "Governance" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TextSection({ title, content }: { title: string; content: string | null | undefined }) {
  if (!content) return null;
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-foreground">
        {content.split("\n").map((line) => (
          <p key={line}>{line.startsWith("- ") ? line.slice(2) : line}</p>
        ))}
      </div>
    </div>
  );
}

function BulletList({ items }: { items: Array<{ id: string; name: string; description?: string | null }> }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5 text-sm text-foreground"
        >
          <p className="font-medium">{item.name}</p>
          {item.description ? (
            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function TechnologyDetailView({ technology }: { technology: CatalogTechnologyDetail }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const lastReviewed = technology.lastReviewedAt
    ? new Date(technology.lastReviewedAt).toLocaleDateString()
    : "Not recorded";

  return (
    <div className="page-shell space-y-6">
      <div>
        <Link
          href="/technology-catalog"
          className="mb-4 inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-4" />
          Technology Catalog
        </Link>
      </div>

      <Card className="stat-card overflow-hidden">
        <CardHeader className="border-b border-border/70 bg-surface-elevated/40">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-3">
              <CardTitle className="text-2xl font-semibold tracking-tight">{technology.name}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <TechnologyStandardBadge status={technology.standardStatus} />
                <TechnologyLifecycleBadge status={technology.lifecycleStatus} />
              </div>
              <CardDescription className="text-base text-secondary-token">
                {technology.vendor} · {technology.categoryName}
              </CardDescription>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{technology.summary}</p>
            </div>
          </div>
        </CardHeader>

        <div className="border-b border-border/70 px-6">
          <nav className="-mb-px flex gap-1 overflow-x-auto py-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-accent-blue/15 text-accent-blue"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <CardContent className="space-y-6 pt-6">
          {activeTab === "overview" ? (
            <>
              <TechnologyMetaGrid
                vendor={technology.vendor}
                category={technology.categoryName}
                lifecycle={technology.lifecycleStatus}
                standard={technology.standardStatus}
              />
              <TextSection title="Primary Purpose" content={technology.purpose} />
              <TextSection title="Why Bobkat IT Selected It" content={technology.whySelected} />
              {technology.stackLayer ? (
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Stack Layer</p>
                  <p className="mt-1 text-sm font-medium">{technology.stackLayer}</p>
                </div>
              ) : null}
              {technology.businessOutcomes.length > 0 ? (
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Key Business Outcomes
                  </h2>
                  <BulletList items={technology.businessOutcomes} />
                </div>
              ) : null}
            </>
          ) : null}

          {activeTab === "capabilities" ? (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Capabilities
              </h2>
              {technology.capabilities.length > 0 ? (
                <BulletList items={technology.capabilities} />
              ) : (
                <p className="text-sm text-muted-foreground">No capabilities documented yet.</p>
              )}
            </div>
          ) : null}

          {activeTab === "products" ? (
            <div className="space-y-3">
              {technology.products.length > 0 ? (
                technology.products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-lg border border-border/70 bg-muted/20 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{product.name}</p>
                      {product.isPreferred ? (
                        <Badge variant="outline" className="border-accent-blue/40 text-accent-blue">
                          Preferred
                        </Badge>
                      ) : null}
                    </div>
                    {product.modelNumber ? (
                      <p className="mt-1 text-xs text-muted-foreground">Model: {product.modelNumber}</p>
                    ) : null}
                    {product.recommendedUseCase ? (
                      <p className="mt-2 text-sm text-secondary-token">{product.recommendedUseCase}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Platform-level record — no separate product editions in Phase 1.
                </p>
              )}
            </div>
          ) : null}

          {activeTab === "deployment" ? (
            <TextSection title="Standard Deployment" content={technology.standardDeployment} />
          ) : null}

          {activeTab === "business" ? (
            <>
              <TextSection title="Business Value" content={technology.businessValue} />
              <TextSection title="Technical Overview" content={technology.technicalOverview} />
            </>
          ) : null}

          {activeTab === "pillars" ? (
            <div className="space-y-3">
              {technology.pillarMappings.map((mapping) => (
                <div
                  key={mapping.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{mapping.pillarName}</p>
                    {mapping.explanation ? (
                      <p className="text-xs text-muted-foreground">{mapping.explanation}</p>
                    ) : null}
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {mapping.relationshipType}
                  </Badge>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "governance" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Last Reviewed</p>
                  <p className="mt-1 text-sm font-medium">{lastReviewed}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Related Playbooks</p>
                  <p className="mt-1 text-sm font-medium">{technology.playbookCount}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Mapped Pillars</p>
                  <p className="mt-1 text-sm font-medium">{technology.mappedPillarCount}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Products</p>
                  <p className="mt-1 text-sm font-medium">{technology.productCount}</p>
                </div>
              </div>
              <TextSection title="Operational Notes" content={technology.operationalNotes} />
              <TextSection title="Security Notes" content={technology.securityNotes} />
              <TextSection title="Licensing Notes" content={technology.licensingNotes} />
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
