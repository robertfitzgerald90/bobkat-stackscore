import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, unauthorized } from "@/lib/api/helpers";
import { universalSearch } from "@/lib/command-center/search/universal-search";
import type { UserRole } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const limit = Math.min(Number(searchParams.get("limit") ?? 8), 20);

  if (query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  let userClientId: string | null = null;
  if (user.role === "client") {
    const clientUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { clientId: true },
    });
    userClientId = clientUser?.clientId ?? null;
  }

  const results = await universalSearch({
    query,
    role: user.role as UserRole,
    userClientId,
    limit,
  });

  return NextResponse.json({ results });
}
