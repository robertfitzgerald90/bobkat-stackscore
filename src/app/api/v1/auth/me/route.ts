import { NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/api/helpers";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}
