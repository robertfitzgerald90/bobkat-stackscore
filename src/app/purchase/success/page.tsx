import { redirect } from "next/navigation";
import { ASSESSMENT_PURCHASED_PATH } from "@/lib/marketing/stackscore-routes";

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

/** Legacy Stripe success URL — permanently redirects to /assessment-purchased. */
export default async function PurchaseSuccessRedirectPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;
  const target = sessionId
    ? `${ASSESSMENT_PURCHASED_PATH}?session_id=${encodeURIComponent(sessionId)}`
    : ASSESSMENT_PURCHASED_PATH;
  redirect(target);
}
