import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomerProjectDetail } from "@/components/customer-portal/projects/customer-project-detail";
import { PUBLIC_DEMO_COMPANY_NAME } from "@/lib/public-demo/constants";
import { DEMO_PROJECTS } from "@/lib/public-demo/fixtures";
import { getPublicDemoProjectDetail } from "@/lib/public-demo/provider";

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
};

export function generateStaticParams() {
  return DEMO_PROJECTS.map((project) => ({ projectId: project.id }));
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const detail = getPublicDemoProjectDetail(projectId);
  return {
    title: detail
      ? `${detail.title} | ${PUBLIC_DEMO_COMPANY_NAME} Demo`
      : `Project | ${PUBLIC_DEMO_COMPANY_NAME} Demo`,
    robots: { index: false, follow: true },
  };
}

export default async function PublicDemoProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const detail = getPublicDemoProjectDetail(projectId);
  if (!detail) notFound();
  return <CustomerProjectDetail detail={detail} />;
}
