import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { clientWorkspaceContactsPath } from "@/lib/clients/paths";

type PageProps = { params: Promise<{ id: string }> };

/** Legacy route — redirects to the Contacts workspace section. */
export default async function BusinessProfilePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  redirect(clientWorkspaceContactsPath(id));
}
