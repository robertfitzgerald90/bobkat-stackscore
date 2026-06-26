import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AssessmentLibraryManagement } from "@/components/admin/assessment-library-management";

export default async function AssessmentLibraryAdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Assessment Library</h2>
        <p className="text-muted-foreground">
          Manage categories, questions, and DOC-114 alignment for the assessment engine.
        </p>
      </div>
      <AssessmentLibraryManagement />
    </div>
  );
}
