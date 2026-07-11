import { NextRequest } from "next/server";
import {
  getSessionUser,
  paginatedResponse,
  parsePagination,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { listProspects } from "@/lib/communications/outreach/prospects";
import type { ProspectStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams);

  const result = await listProspects({
    page,
    limit,
    search: searchParams.get("search") ?? undefined,
    status: (searchParams.get("status") as ProspectStatus | null) ?? undefined,
    industry: searchParams.get("industry") ?? undefined,
    assessmentStarted: searchParams.get("assessmentStarted") === "true",
    assessmentCompleted: searchParams.get("assessmentCompleted") === "true",
    opened: searchParams.get("opened") === "true",
    clicked: searchParams.get("clicked") === "true",
  });

  return paginatedResponse(result.items, result.total, page, limit);
}
