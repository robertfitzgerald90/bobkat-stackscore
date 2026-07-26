import {
  getSessionUser,
  parsePagination,
  paginatedResponse,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  getWebsiteLeadSummaryStats,
  listWebsiteLeadsForAdmin,
} from "@/lib/website-leads";
import type { WebsiteLeadSource, WebsiteLeadStatus } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const url = new URL(request.url);
  const { page, limit, skip } = parsePagination(url.searchParams);
  const search = url.searchParams.get("search") ?? undefined;
  const status = url.searchParams.get("status") as WebsiteLeadStatus | null;
  const source = url.searchParams.get("source") as WebsiteLeadSource | null;
  const submittedFrom = url.searchParams.get("submittedFrom");
  const submittedTo = url.searchParams.get("submittedTo");
  const sort = url.searchParams.get("sort") === "oldest" ? "oldest" : "newest";
  const includeStats = url.searchParams.get("includeStats") === "1";

  const { items, total } = await listWebsiteLeadsForAdmin({
    search,
    status: status ?? undefined,
    source: source ?? undefined,
    submittedFrom: submittedFrom ? new Date(submittedFrom) : undefined,
    submittedTo: submittedTo ? new Date(submittedTo) : undefined,
    sort,
    skip,
    take: limit,
  });

  if (includeStats) {
    const stats = await getWebsiteLeadSummaryStats();
    return Response.json({
      data: items,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  return paginatedResponse(items, total, page, limit);
}
