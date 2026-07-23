import { permanentRedirect } from "next/navigation";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";

export default function EssentialsRedirectPage() {
  permanentRedirect(BOBKAT_IT_URLS.solutionsEssentials);
}
