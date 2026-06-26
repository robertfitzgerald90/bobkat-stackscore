import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { getTipPlan } from "@/lib/technology-improvement-plan";
import { TipWorkflow } from "@/components/technology-improvement-plan/tip-workflow";
import { buttonClassName } from "@/components/ui/button";

type PageProps = { params: Promise<{ id: string; tipId: string }> };

export default async function ImprovementPlanWizardPage({ params }: PageProps) {
  const { id, tipId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "client") redirect(`/clients/${id}`);

  const plan = await getTipPlan(id, tipId, session.user.role);
  if (!plan) notFound();

  return (
    <div className="space-y-4">
      <Link
        href={`/clients/${id}/improvement-plan`}
        className={buttonClassName({ variant: "ghost", size: "sm", className: "-ml-2" })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        All Improvement Plans
      </Link>
      <TipWorkflow
        clientId={id}
        tipId={tipId}
        initialPlan={plan}
        isAdmin={session.user.role === "admin"}
      />
    </div>
  );
}
