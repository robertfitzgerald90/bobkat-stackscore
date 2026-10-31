import { Suspense } from "react";
import type { Metadata } from "next";
import { CustomerProjectsExperience } from "@/components/customer-portal/projects/customer-projects-experience";
import { ClientLoadingState, ClientPageShell } from "@/components/client-ui";
import type { CustomerProjectViewFilter } from "@/lib/customer-portal/projects-dto";
import { PUBLIC_DEMO_COMPANY_NAME } from "@/lib/public-demo/constants";
import { getPublicDemoProjects } from "@/lib/public-demo/provider";

export const metadata: Metadata = {
  title: `Projects | ${PUBLIC_DEMO_COMPANY_NAME} Demo`,
  description:
    "Sample StackScore projects with task-based progress for Northstar Manufacturing.",
  alternates: { canonical: "/demo/projects" },
  robots: { index: true, follow: true },
};

type ProjectsPageProps = {
  searchParams: Promise<{ view?: string }>;
};

function resolveView(value: string | undefined): CustomerProjectViewFilter {
  if (value === "planned" || value === "active" || value === "completed") return value;
  return "all";
}

export default async function PublicDemoProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const experience = getPublicDemoProjects(resolveView(params.view));
  return (
    <Suspense
      fallback={
        <ClientPageShell>
          <ClientLoadingState label="Loading Projects…" />
        </ClientPageShell>
      }
    >
      <CustomerProjectsExperience experience={experience} />
    </Suspense>
  );
}
