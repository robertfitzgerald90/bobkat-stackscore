import { redirect } from "next/navigation";
import { CsvImportView } from "@/components/communications/csv-import-view";
import { auth } from "@/lib/auth";
import { assertCommunicationsAccessRole } from "@/lib/communications/auth";

export default async function ProspectImportPage() {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  return <CsvImportView />;
}
