import { redirect } from "next/navigation";
import { CommunicationsSubnav } from "@/components/communications/communications-subnav";
import { auth } from "@/lib/auth";
import { assertCommunicationsAdminRole } from "@/lib/communications/auth";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function CommunicationsLayout({ children }: LayoutProps) {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAdminRole(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <CommunicationsSubnav />
      {children}
    </div>
  );
}
