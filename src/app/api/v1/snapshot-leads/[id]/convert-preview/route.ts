import { NextResponse } from "next/server";
import {
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  getTechnologySnapshotLeadById,
  previewSnapshotLeadConversion,
} from "@/lib/technology-snapshot/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await context.params;
  const existing = await getTechnologySnapshotLeadById(id);
  if (!existing) return notFound("Snapshot lead not found");

  const preview = await previewSnapshotLeadConversion(id);
  return NextResponse.json(preview);
}
