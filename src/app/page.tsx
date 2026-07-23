import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { StackScoreGatewayHome } from "@/components/public/stackscore-gateway-home";
import { getDefaultLandingPath } from "@/lib/navigation/default-landing";

export const metadata: Metadata = {
  title: "StackScore | Technology Planning Platform",
  description:
    "StackScore is the assessment, planning, and client portal platform used by Bobkat IT.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect(getDefaultLandingPath(session.user.role));
  }

  return <StackScoreGatewayHome />;
}
