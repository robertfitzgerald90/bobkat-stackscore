import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeUser } from "@/lib/users/serialize";
import { UsersManagement } from "@/components/admin/users-management";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Users</h2>
        <p className="text-muted-foreground">Manage Bobkat StackScore accounts</p>
      </div>
      <UsersManagement
        initialUsers={users.map(serializeUser)}
        currentUserId={session.user.id}
      />
    </div>
  );
}
