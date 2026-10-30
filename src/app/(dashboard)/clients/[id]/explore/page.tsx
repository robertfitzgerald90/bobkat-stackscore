import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPageShell,
  ClientStatusBadge,
} from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clientRecommendationsPath,
  customerOverviewPath,
} from "@/lib/clients/paths";
import { CLIENT_SURFACE_CARD, CLIENT_SURFACE_CARD_INDUSTRIAL } from "@/lib/client-ui/tokens";
import { prisma } from "@/lib/db";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import {
  TECHNOLOGY_PILLARS,
  type TechnologyPillarCode,
} from "@/lib/technology-maturity/pillars";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ pillar?: string }>;
};

const PILLAR_CODES = new Set(TECHNOLOGY_PILLARS.map((p) => p.code));

function resolveSelectedPillar(raw: string | undefined): TechnologyPillarCode | null {
  if (!raw) return null;
  return PILLAR_CODES.has(raw as TechnologyPillarCode) ? (raw as TechnologyPillarCode) : null;
}

/**
 * SS-UX-002 — Explore foundation.
 * SS-UX-004 — Supports `?pillar=` selection from Overview pillar tiles (drilldowns deferred).
 */
export default async function ClientExplorePage({ params, searchParams }: PageProps) {
  const { id: clientId } = await params;
  const query = searchParams ? await searchParams : {};
  const selectedPillar = resolveSelectedPillar(query.pillar);
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (isCustomerMode(session.user.role)) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId !== clientId) notFound();
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      companyName: true,
      technologyProfile: {
        select: {
          overallStackScore: true,
          lastAssessedAt: true,
          currentAssessmentId: true,
        },
      },
    },
  });
  if (!client) notFound();

  const hasCompletedAssessment = Boolean(
    client.technologyProfile?.lastAssessedAt || client.technologyProfile?.currentAssessmentId,
  );

  const selectedDefinition = selectedPillar
    ? TECHNOLOGY_PILLARS.find((p) => p.code === selectedPillar) ?? null
    : null;

  return (
    <ClientPageShell className="max-w-4xl">
      <ClientPageHeader
        eyebrow="Technology Maturity"
        title="Explore"
        description="Review technology maturity across eight pillars. Interactive drilldowns arrive in a follow-up release."
      />

      {!hasCompletedAssessment ? (
        <ClientEmptyState
          icon={Compass}
          title="Assessment required"
          description="Complete a technology maturity assessment to explore pillar-level insights for your organization."
          nextStep="Return to Overview to continue your assessment journey."
          action={
            <Link href={customerOverviewPath(clientId)} className={buttonClassName({})}>
              Go to Overview
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {selectedDefinition ? (
            <Card className={CLIENT_SURFACE_CARD_INDUSTRIAL} id={`pillar-${selectedDefinition.code}`}>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  <Compass className="h-4 w-4 text-primary" aria-hidden />
                  {selectedDefinition.name}
                  <ClientStatusBadge tone="success">Selected</ClientStatusBadge>
                </CardTitle>
                <CardDescription>{selectedDefinition.businessQuestion}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Full pillar drilldown — scores, evidence, and mapped opportunities — ships in a
                  follow-up release. Your Overview already shows the official pillar score for this
                  domain.
                </p>
              </CardContent>
            </Card>
          ) : null}

          <Card className={CLIENT_SURFACE_CARD}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Compass className="h-4 w-4 text-primary" aria-hidden />
                Eight technology pillars
              </CardTitle>
              <CardDescription>
                These pillars define how StackScore measures technology maturity. Detailed
                scores, strengths, and improvement opportunities for each pillar will appear
                here next.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {TECHNOLOGY_PILLARS.map((pillar) => {
                  const isSelected = selectedPillar === pillar.code;
                  return (
                    <li key={pillar.code} id={`pillar-${pillar.code}`}>
                      <Link
                        href={`/clients/${clientId}/explore?pillar=${encodeURIComponent(pillar.code)}`}
                        className={cn(
                          "block rounded-sm border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border/70 bg-muted/20 hover:border-primary/40",
                        )}
                        aria-current={isSelected ? "true" : undefined}
                      >
                        <p className="font-medium">{pillar.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {pillar.businessQuestion}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Link href={customerOverviewPath(clientId)} className={buttonClassName({ variant: "outline" })}>
              Back to Overview
            </Link>
            <Link
              href={clientRecommendationsPath(clientId)}
              className={buttonClassName({ variant: "outline" })}
            >
              View improvement opportunities
            </Link>
          </div>
        </div>
      )}
    </ClientPageShell>
  );
}
