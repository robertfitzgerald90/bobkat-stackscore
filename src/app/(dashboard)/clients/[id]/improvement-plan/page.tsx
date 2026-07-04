import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { clientWorkspaceSectionPath } from "@/lib/clients/paths";

type PageProps = { params: Promise<{ id: string }> };

/** Legacy route — redirects to the Roadmap workspace section. */
export default async function ImprovementPlanListPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  redirect(clientWorkspaceSectionPath(id, "roadmap"));
}
