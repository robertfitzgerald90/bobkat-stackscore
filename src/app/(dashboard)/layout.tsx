import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    role: session.user.role,
  };

  return (
    <div className="flex h-screen min-h-screen overflow-hidden bg-background">
      <AppSidebar role={user.role} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AppHeader user={user} />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6 lg:p-8">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
