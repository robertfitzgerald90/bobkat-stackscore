import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDefaultLandingPath } from "@/lib/navigation/default-landing";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  redirect(getDefaultLandingPath(session.user.role));
}
