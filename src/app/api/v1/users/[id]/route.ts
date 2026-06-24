import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { validateDeactivateAdmin, validateUserMutation } from "@/lib/users/guards";
import { hashPassword } from "@/lib/users/password";
import { updateUserSchema } from "@/lib/users/schemas";
import { serializeUser } from "@/lib/users/serialize";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid user data");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return notFound("User not found");

  const selfError = await validateUserMutation(id, user.id, parsed.data);
  if (selfError) return badRequest(selfError);

  const adminError = await validateDeactivateAdmin(id, parsed.data);
  if (adminError) return badRequest(adminError);

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.role !== undefined ? { role: parsed.data.role } : {}),
      ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
      ...(parsed.data.password
        ? { passwordHash: await hashPassword(parsed.data.password) }
        : {}),
    },
  });

  return NextResponse.json(serializeUser(updated));
}
