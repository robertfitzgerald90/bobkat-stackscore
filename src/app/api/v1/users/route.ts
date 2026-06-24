import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  badRequest,
  conflict,
  getSessionUser,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { hashPassword } from "@/lib/users/password";
import { createUserSchema } from "@/lib/users/schemas";
import { serializeUser } from "@/lib/users/serialize";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const denied = requireAdmin(user);
  if (denied) return denied;

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    data: users.map(serializeUser),
  });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const denied = requireAdmin(user);
  if (denied) return denied;

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid user data");
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return conflict("A user with this email already exists");
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const created = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: parsed.data.role,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json(serializeUser(created), { status: 201 });
}
