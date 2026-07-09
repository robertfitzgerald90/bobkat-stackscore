import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getLatestDraftAssessmentForClientUser } from "@/lib/auth/client-access";
import { buttonClassName } from "@/components/ui/button";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

export async function SupportAssessmentHelp() {
  const session = await auth();
  if (!session?.user || !isCustomerMode(session.user.role)) {
    return (
      <Link href="/assessments" className={buttonClassName({ variant: "outline" })}>
        View Assessments
      </Link>
    );
  }

  const draft = await getLatestDraftAssessmentForClientUser(session.user.id);

  const clientUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { clientId: true },
  });

  const completedAssessment = clientUser?.clientId
    ? await prisma.assessment.findFirst({
        where: { clientId: clientUser.clientId, status: "completed" },
        orderBy: { completedAt: "desc" },
        select: { id: true },
      })
    : null;

  const reportHref = completedAssessment
    ? `/assessments/${completedAssessment.id}/report`
    : null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {draft ? (
        <Link href="/assessment/start" className={buttonClassName({ variant: "outline" })}>
          Continue Assessment
        </Link>
      ) : null}
      {reportHref ? (
        <Link href={reportHref} className={buttonClassName({ variant: "outline" })}>
          Review Assessment Report
        </Link>
      ) : null}
      {!draft && !reportHref ? (
        <Link href="/assessment/start" className={buttonClassName({ variant: "outline" })}>
          Start Assessment
        </Link>
      ) : null}
    </div>
  );
}
