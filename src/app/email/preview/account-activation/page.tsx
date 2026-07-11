import { redirect } from "next/navigation";

export default function LegacyEmailPreviewRedirectPage() {
  redirect("/admin/communications/templates/EMAIL-001");
}
