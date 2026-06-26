import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";
import { TechnologyProfileDetailView } from "@/components/technology-profile/technology-profile-detail";
import { buttonClassName } from "@/components/ui/button";

type PageProps = { params: Promise<{ id: string }> };

export default async function TechnologyProfilePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const detail = await getTechnologyProfileDetail(id, session.user.role);
  if (!detail) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/clients/${id}`}
            className={buttonClassName({ variant: "ghost", size: "sm", className: "mb-2 -ml-2" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Client
          </Link>
          <h2 className="page-title">Technology Profile</h2>
          <p className="page-description">{detail.client.companyName}</p>
        </div>
        {session.user.role !== "client" ? (
          <Link
            href={`/clients/${id}/improvement-plan`}
            className={buttonClassName({ variant: "default", size: "sm" })}
          >
            Start Improvement Plan
          </Link>
        ) : null}
      </div>

      <TechnologyProfileDetailView detail={detail} />
    </div>
  );
}
