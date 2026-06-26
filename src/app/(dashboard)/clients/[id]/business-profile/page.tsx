import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { getBusinessProfile } from "@/lib/business-profile";
import { BusinessProfileForm } from "@/components/business-profile/business-profile-form";
import { buttonClassName } from "@/components/ui/button";

type PageProps = { params: Promise<{ id: string }> };

export default async function BusinessProfilePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await getBusinessProfile(id, session.user.role);
  if (!profile) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Link
          href={`/clients/${id}`}
          className={buttonClassName({ variant: "ghost", size: "sm", className: "mb-2 -ml-2" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Client
        </Link>
        <h2 className="page-title">Business Profile</h2>
        <p className="page-description">
          {profile.companyName} · Lightweight business context for consulting decisions
        </p>
      </div>

      <BusinessProfileForm clientId={id} initialProfile={profile} />
    </div>
  );
}
