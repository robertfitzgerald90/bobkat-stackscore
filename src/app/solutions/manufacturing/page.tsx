import { permanentRedirect } from "next/navigation";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";

export default function ManufacturingRedirectPage() {
  permanentRedirect(BOBKAT_IT_URLS.solutionsManufacturing);
}
