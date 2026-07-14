import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { prisma } from "@/lib/db";
import { requireVcioFeatureWriteAccess } from "@/lib/vcio/feature-unlocks";

type RouteProps = {
  params: Promise<{ id: string }>;
};

function normalizeActionItems(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

export async function GET(_request: NextRequest, { params }: RouteProps) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId } = await params;
  const notes = await prisma.note.findMany({
    where: {
      clientId,
      noteType: { in: ["executive", "strategy_session"] },
    },
    orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      noteType: true,
      title: true,
      content: true,
      scheduledAt: true,
      completedAt: true,
      actionItemsJson: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  return NextResponse.json({
    notes: notes.map((note) => ({
      ...note,
      scheduledAt: note.scheduledAt?.toISOString() ?? null,
      completedAt: note.completedAt?.toISOString() ?? null,
      createdAt: note.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId } = await params;
  const body = (await request.json().catch(() => null)) as {
    noteType?: "executive" | "strategy_session";
    title?: string;
    content?: string;
    scheduledAt?: string | null;
    completedAt?: string | null;
    actionItems?: string[];
  } | null;

  if (!body?.noteType || !["executive", "strategy_session"].includes(body.noteType)) {
    return badRequest("noteType must be executive or strategy_session");
  }
  if (!body.content?.trim()) return badRequest("content is required");

  const feature = body.noteType === "executive" ? "executive_notes" : "strategy_sessions";
  const vcioDenied = await requireVcioFeatureWriteAccess(clientId, feature);
  if (vcioDenied) return vcioDenied;

  const note = await prisma.note.create({
    data: {
      clientId,
      userId: user.id,
      noteType: body.noteType,
      visibility: "internal",
      title: body.title?.trim() || null,
      content: body.content.trim(),
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      completedAt: body.completedAt ? new Date(body.completedAt) : null,
      actionItemsJson: normalizeActionItems(body.actionItems),
    },
    select: {
      id: true,
      noteType: true,
      title: true,
      content: true,
      scheduledAt: true,
      completedAt: true,
      actionItemsJson: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  return NextResponse.json(
    {
      note: {
        ...note,
        scheduledAt: note.scheduledAt?.toISOString() ?? null,
        completedAt: note.completedAt?.toISOString() ?? null,
        createdAt: note.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
