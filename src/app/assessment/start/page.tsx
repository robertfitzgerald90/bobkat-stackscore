import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLatestDraftAssessmentForClientUser } from "@/lib/auth/client-access";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";

export default async function AssessmentStartPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/assessment/start");

  if (session.user.role !== "client") {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompletedAt: true, clientId: true },
  });

  if (!user?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  const assessment = await getLatestDraftAssessmentForClientUser(session.user.id);
  if (!assessment) {
    if (user.clientId) {
      redirect(clientTechnologyProfilePath(user.clientId));
    }
    redirect("/onboarding");
  }

  redirect(`/assessments/${assessment.id}`);
}
