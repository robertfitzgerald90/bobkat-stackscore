import { redirect } from "next/navigation";
import { CommunicationsSubnav } from "@/components/communications/communications-subnav";
import { auth } from "@/lib/auth";
import {
  assertCommunicationsAccessRole,
  assertCommunicationsAdminRole,
} from "@/lib/communications/auth";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function CommunicationsLayout({ children }: LayoutProps) {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  const isAdmin = assertCommunicationsAdminRole(session.user.role);

  return (
    <div className="space-y-6">
      <CommunicationsSubnav isAdmin={isAdmin} />
      {children}
    </div>
  );
}
