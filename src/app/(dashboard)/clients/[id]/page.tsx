import { redirect } from "next/navigation";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  redirect(clientTechnologyProfilePath(id));
}
