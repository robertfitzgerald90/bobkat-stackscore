import { redirect } from "next/navigation";
import { StackScoreGatewayHome } from "@/components/public/stackscore-gateway-home";
import { buildSocialPageMetadata } from "@/lib/branding/social-og";
import { auth } from "@/lib/auth";
import { getDefaultLandingPath } from "@/lib/navigation/default-landing";

export const metadata = buildSocialPageMetadata({
  title: "StackScore | Technology Intelligence for Business",
  description:
    "Understand your technology environment, identify risks, and prioritize improvements with StackScore.",
  path: "/",
  image: "stackscoreDemo",
});

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect(getDefaultLandingPath(session.user.role));
  }

  return <StackScoreGatewayHome />;
}
