import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CommunicationHistoryView } from "@/components/communications/communication-history-view";
import { auth } from "@/lib/auth";
import { assertCommunicationsAccessRole } from "@/lib/communications/auth";
import { queryCommunicationHistory } from "@/lib/communications/tracking/history-query";
import type { CommunicationMessageStatus } from "@/generated/prisma/client";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function CommunicationHistoryPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const filters = {
    query: readParam(params.query),
    status: (readParam(params.status) ?? "all") as CommunicationMessageStatus | "all",
    templateKey: readParam(params.templateKey) ?? "all",
    clientId: readParam(params.clientId) ?? "all",
    isTest: (readParam(params.isTest) ?? "production") as "all" | "production" | "test",
    opened: (readParam(params.opened) ?? "all") as "all" | "yes" | "no",
    clicked: (readParam(params.clicked) ?? "all") as "all" | "yes" | "no",
    dateFrom: readParam(params.dateFrom),
    dateTo: readParam(params.dateTo),
    page: Number(readParam(params.page) ?? "1"),
    limit: 25,
  };

  const result = await queryCommunicationHistory(filters);

  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading history...</div>}>
      <CommunicationHistoryView
        initialRows={result.rows}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        filters={{
          query: filters.query,
          status: filters.status,
          templateKey: filters.templateKey,
          isTest: filters.isTest,
        }}
      />
    </Suspense>
  );
}
