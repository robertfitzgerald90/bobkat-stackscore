import { getSessionUser, requireAdmin, unauthorized } from "@/lib/api/helpers";
import { listTechnologySnapshotLeads } from "@/lib/technology-snapshot/service";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const leads = await listTechnologySnapshotLeads();

  return Response.json({ data: leads });
}
