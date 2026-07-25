import { redirect } from "next/navigation";
import { SUBSCRIPTION_ACTIVATED_PATH } from "@/lib/marketing/stackscore-routes";

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

/** Legacy Stripe success URL — permanently redirects to /subscription-activated. */
export default async function VcioCheckoutSuccessRedirectPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;
  const target = sessionId
    ? `${SUBSCRIPTION_ACTIVATED_PATH}?session_id=${encodeURIComponent(sessionId)}`
    : SUBSCRIPTION_ACTIVATED_PATH;
  redirect(target);
}
