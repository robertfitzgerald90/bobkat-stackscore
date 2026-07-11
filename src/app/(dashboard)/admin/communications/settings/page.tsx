import { redirect } from "next/navigation";
import { BrandSettingsView } from "@/components/communications/brand-settings-view";
import { auth } from "@/lib/auth";
import {
  assertCommunicationsAccessRole,
  assertCommunicationsAdminRole,
} from "@/lib/communications/auth";
import { getCommunicationBrandSettings } from "@/lib/communications/brand-settings";

export default async function CommunicationsSettingsPage() {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }
  if (!assertCommunicationsAdminRole(session.user.role)) {
    redirect("/admin/communications");
  }

  const initialBrand = await getCommunicationBrandSettings();
  return <BrandSettingsView initialBrand={initialBrand} />;
}
