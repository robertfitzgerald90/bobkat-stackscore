import { redirect } from "next/navigation";
import { DEMO_OPPORTUNITIES } from "@/lib/public-demo/fixtures";
import { PUBLIC_DEMO_OPPORTUNITIES_PATH } from "@/lib/public-demo/routes";

type OpportunityPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return DEMO_OPPORTUNITIES.map((row) => ({ id: row.id }));
}

/**
 * SS-WEB-003-R1 — Deep links expand the shared opportunities list row.
 */
export default async function PublicDemoOpportunityRedirectPage({
  params,
}: OpportunityPageProps) {
  const { id } = await params;
  redirect(`${PUBLIC_DEMO_OPPORTUNITIES_PATH}?selected=${encodeURIComponent(id)}`);
}
