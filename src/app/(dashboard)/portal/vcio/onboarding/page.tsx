import { redirect } from "next/navigation";
import { getSessionUserWithClient } from "@/lib/api/access";

export default async function PortalVcioOnboardingRedirectPage() {
  const user = await getSessionUserWithClient();
  if (!user) redirect("/login");
  if (!user.clientId) redirect("/dashboard");
  redirect(`/clients/${user.clientId}/vcio/onboarding`);
}
