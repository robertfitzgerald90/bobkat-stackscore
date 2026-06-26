import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error("[auth] session lookup failed in dashboard layout:", error);
    redirect("/login");
  }

  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    role: session.user.role,
  };

  return (
    <>
      <DashboardShell user={user}>{children}</DashboardShell>
      <Toaster />
    </>
  );
}
