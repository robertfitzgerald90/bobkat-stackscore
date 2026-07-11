import { redirect } from "next/navigation";
import { VariablesLibraryView } from "@/components/communications/variables-library-view";
import { auth } from "@/lib/auth";
import { assertCommunicationsAccessRole } from "@/lib/communications/auth";
import { listCommunicationVariables } from "@/lib/communications/variables-library";

export default async function VariablesLibraryPage() {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  const variables = listCommunicationVariables();
  return <VariablesLibraryView variables={variables} />;
}
