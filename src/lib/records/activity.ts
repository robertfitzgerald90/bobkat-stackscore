import { prisma } from "@/lib/db";

export async function logSystemNote(params: {
  clientId: string;
  userId: string;
  content: string;
  assessmentId?: string;
  projectId?: string;
}) {
  await prisma.note.create({
    data: {
      clientId: params.clientId,
      userId: params.userId,
      assessmentId: params.assessmentId,
      projectId: params.projectId,
      noteType: "system",
      visibility: "internal",
      content: params.content,
    },
  });
}
