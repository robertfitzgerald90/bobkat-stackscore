import type { UserRole } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email || !session.user.role) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email,
    role: session.user.role as UserRole,
  };
}

export function unauthorized() {
  return NextResponse.json(
    { error: "Authentication required", code: "UNAUTHORIZED" },
    { status: 401 },
  );
}

export function forbidden() {
  return NextResponse.json(
    { error: "Insufficient permissions", code: "FORBIDDEN" },
    { status: 403 },
  );
}

export function badRequest(message: string, code = "BAD_REQUEST") {
  return NextResponse.json({ error: message, code }, { status: 400 });
}

export function notFound(message = "Resource not found") {
  return NextResponse.json({ error: message, code: "NOT_FOUND" }, { status: 404 });
}

export function conflict(message: string) {
  return NextResponse.json({ error: message, code: "CONFLICT" }, { status: 409 });
}

export function requireRole(user: SessionUser, roles: UserRole[]) {
  if (!roles.includes(user.role)) {
    return forbidden();
  }
  return null;
}

export function requireAdmin(user: SessionUser) {
  return requireRole(user, ["admin"]);
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
