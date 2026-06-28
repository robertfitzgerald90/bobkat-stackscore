import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/clients/${id}/technology-profile`);
}
