import { redirect } from "next/navigation";
import { SharedComponentsManagerView } from "@/components/communications/shared-components-manager-view";
import { auth } from "@/lib/auth";
import {
  assertCommunicationsAccessRole,
  assertCommunicationsAdminRole,
} from "@/lib/communications/auth";
import { getCommunicationBrandSettings } from "@/lib/communications/brand-settings";

export default async function SharedComponentsPage() {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }
  if (!assertCommunicationsAdminRole(session.user.role)) {
    redirect("/admin/communications");
  }

  const brand = await getCommunicationBrandSettings();
  return <SharedComponentsManagerView brand={brand} />;
}
