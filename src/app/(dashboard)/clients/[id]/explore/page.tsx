import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPageShell,
} from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clientRecommendationsPath,
  customerOverviewPath,
} from "@/lib/clients/paths";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { prisma } from "@/lib/db";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";

type PageProps = { params: Promise<{ id: string }> };

/**
 * SS-UX-002 — Explore foundation.
 * Placeholder for the eight technology maturity pillars (drilldowns land in a later ticket).
 */
export default async function ClientExplorePage({ params }: PageProps) {
  const { id: clientId } = await params;
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
          <Card className={CLIENT_SURFACE_CARD}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Compass className="h-4 w-4 text-primary" />
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
                {TECHNOLOGY_PILLARS.map((pillar) => (
                  <li
                    key={pillar.code}
                    className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm"
                  >
                    <p className="font-medium">{pillar.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{pillar.businessQuestion}</p>
                  </li>
                ))}
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
