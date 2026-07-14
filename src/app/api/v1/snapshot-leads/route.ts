import {
  getSessionUser,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  getTechnologySnapshotLeadSummaryStats,
  listTechnologySnapshotLeadsForAdmin,
} from "@/lib/technology-snapshot/service";
import type { TechnologySnapshotLeadStatus } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? undefined;
  const status = url.searchParams.get("status") as TechnologySnapshotLeadStatus | null;
  const classification = url.searchParams.get("classification") ?? undefined;
  const contacted = url.searchParams.get("contacted") as "yes" | "no" | null;
  const submittedFrom = url.searchParams.get("submittedFrom");
  const submittedTo = url.searchParams.get("submittedTo");
  const includeStats = url.searchParams.get("includeStats") === "1";

  const leads = await listTechnologySnapshotLeadsForAdmin({
    search,
    status: status ?? undefined,
    classification,
    contacted: contacted ?? undefined,
    submittedFrom: submittedFrom ? new Date(submittedFrom) : undefined,
    submittedTo: submittedTo ? new Date(submittedTo) : undefined,
  });

  if (includeStats) {
    const stats = await getTechnologySnapshotLeadSummaryStats();
    return Response.json({ data: leads, stats });
  }

  return Response.json({ data: leads });
}
