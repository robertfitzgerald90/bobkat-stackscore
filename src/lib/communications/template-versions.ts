import type { CommunicationTemplateVersionStatus, Prisma } from "@/generated/prisma/client";
import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import { getEmailTemplate } from "@/lib/communications/registry";
import {
  getDefaultSharedComponents,
  getDefaultTemplateContent,
  mergeTemplateContent,
  type TemplateContentBlock,
  type TemplateVersionContent,
} from "@/lib/communications/template-content";
import type { TemplateVersionSummary, TemplateVersionView } from "@/lib/communications/types";
import { prisma } from "@/lib/db";

function mapVersion(record: {
  id: string;
  templateKey: string;
  versionNumber: number;
  status: CommunicationTemplateVersionStatus;
  subject: string;
  previewText: string;
  contentJson: unknown;
  sharedComponents: unknown;
  changeNotes: string | null;
  publishedAt: Date | null;
  publishedByUserId: string | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedBy?: { name: string } | null;
  createdBy?: { name: string };
}): TemplateVersionView {
  return {
    id: record.id,
    templateKey: record.templateKey,
    versionNumber: record.versionNumber,
    status: record.status,
    subject: record.subject,
    previewText: record.previewText,
    content: (record.contentJson as TemplateContentBlock) ?? {},
    sharedComponents: (record.sharedComponents as string[]) ?? [],
    changeNotes: record.changeNotes,
    publishedAt: record.publishedAt?.toISOString() ?? null,
    publishedByName: record.publishedBy?.name ?? null,
    createdByName: record.createdBy?.name ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function buildInitialVersion(templateKey: string) {
  const template = getEmailTemplate(templateKey);
  if (!template) throw new Error(`Unknown template: ${templateKey}`);

  return {
    templateKey,
    subject: template.subject,
    previewText: template.previewText,
    contentJson: getDefaultTemplateContent(templateKey),
    sharedComponents: getDefaultSharedComponents(templateKey),
  };
}

export async function ensureTemplateVersionsSeeded(userId: string): Promise<void> {
  await withCommunicationDbFallback(async () => {
    const activeTemplates = ["EMAIL-001", "EMAIL-010"];
    for (const templateKey of activeTemplates) {
      const existing = await prisma.communicationTemplateVersion.findFirst({
        where: { templateKey, status: "published" },
      });
      if (existing) continue;

      const initial = buildInitialVersion(templateKey);
      await prisma.communicationTemplateVersion.create({
        data: {
          templateKey,
          versionNumber: 1,
          status: "published",
          subject: initial.subject,
          previewText: initial.previewText,
          contentJson: initial.contentJson as Prisma.InputJsonValue,
          sharedComponents: initial.sharedComponents as Prisma.InputJsonValue,
          changeNotes: "Initial published version",
          publishedAt: new Date(),
          publishedByUserId: userId,
          createdByUserId: userId,
        },
      });
    }
  }, undefined);
}

export async function getTemplateVersionSummary(): Promise<TemplateVersionSummary> {
  return withCommunicationDbFallback(async () => {
    const [publishedCount, draftCount, draftsByTemplate] = await Promise.all([
      prisma.communicationTemplateVersion.count({ where: { status: "published" } }),
      prisma.communicationTemplateVersion.count({ where: { status: "draft" } }),
      prisma.communicationTemplateVersion.findMany({
        where: { status: "draft" },
        select: { templateKey: true },
        distinct: ["templateKey"],
      }),
    ]);

    return {
      publishedCount,
      draftCount,
      templatesNeedingReview: draftsByTemplate.length,
    };
  }, { publishedCount: 0, draftCount: 0, templatesNeedingReview: 0 });
}

export async function getPublishedTemplateVersion(
  templateKey: string,
): Promise<TemplateVersionView | null> {
  return withCommunicationDbFallback(async () => {
    const record = await prisma.communicationTemplateVersion.findFirst({
      where: { templateKey, status: "published" },
      orderBy: { versionNumber: "desc" },
      include: {
        publishedBy: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });
    return record ? mapVersion(record) : null;
  }, null);
}

export async function getDraftTemplateVersion(
  templateKey: string,
): Promise<TemplateVersionView | null> {
  return withCommunicationDbFallback(async () => {
    const record = await prisma.communicationTemplateVersion.findFirst({
      where: { templateKey, status: "draft" },
      orderBy: { versionNumber: "desc" },
      include: {
        publishedBy: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });
    return record ? mapVersion(record) : null;
  }, null);
}

export async function getTemplateVersionHistory(
  templateKey: string,
  limit = 10,
): Promise<TemplateVersionView[]> {
  return withCommunicationDbFallback(async () => {
    const records = await prisma.communicationTemplateVersion.findMany({
      where: { templateKey },
      orderBy: { versionNumber: "desc" },
      take: limit,
      include: {
        publishedBy: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });
    return records.map(mapVersion);
  }, []);
}

export async function getEffectiveTemplateContent(
  templateKey: string,
  mode: "published" | "draft" = "published",
): Promise<TemplateVersionContent | null> {
  const template = getEmailTemplate(templateKey);
  if (!template) return null;

  const version =
    mode === "draft"
      ? (await getDraftTemplateVersion(templateKey)) ??
        (await getPublishedTemplateVersion(templateKey))
      : await getPublishedTemplateVersion(templateKey);

  const defaults = getDefaultTemplateContent(templateKey);
  const content = mergeTemplateContent(defaults, version?.content ?? null);

  return {
    subject: version?.subject ?? template.subject,
    previewText: version?.previewText ?? template.previewText,
    ...content,
  };
}

type SaveDraftInput = {
  templateKey: string;
  subject: string;
  previewText: string;
  content: TemplateContentBlock;
  changeNotes?: string;
  userId: string;
};

export async function saveTemplateDraft(input: SaveDraftInput): Promise<TemplateVersionView> {
  const published = await getPublishedTemplateVersion(input.templateKey);
  const existingDraft = await getDraftTemplateVersion(input.templateKey);

  if (existingDraft) {
    const updated = await prisma.communicationTemplateVersion.update({
      where: { id: existingDraft.id },
      data: {
        subject: input.subject,
        previewText: input.previewText,
        contentJson: input.content as Prisma.InputJsonValue,
        sharedComponents: getDefaultSharedComponents(input.templateKey) as Prisma.InputJsonValue,
        changeNotes: input.changeNotes ?? existingDraft.changeNotes,
      },
      include: {
        publishedBy: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });
    return mapVersion(updated);
  }

  const nextVersion = published ? published.versionNumber + 1 : 1;
  const created = await prisma.communicationTemplateVersion.create({
    data: {
      templateKey: input.templateKey,
      versionNumber: nextVersion,
      status: "draft",
      subject: input.subject,
      previewText: input.previewText,
      contentJson: input.content,
      sharedComponents: getDefaultSharedComponents(input.templateKey),
      changeNotes: input.changeNotes ?? "Draft saved",
      createdByUserId: input.userId,
    },
    include: {
      publishedBy: { select: { name: true } },
      createdBy: { select: { name: true } },
    },
  });
  return mapVersion(created);
}

export async function publishTemplateDraft(
  templateKey: string,
  userId: string,
): Promise<TemplateVersionView> {
  const draft = await getDraftTemplateVersion(templateKey);
  if (!draft) {
    throw new Error("No draft version exists for this template.");
  }

  await prisma.communicationTemplateVersion.updateMany({
    where: { templateKey, status: "published" },
    data: { status: "archived" },
  });

  const published = await prisma.communicationTemplateVersion.update({
    where: { id: draft.id },
    data: {
      status: "published",
      publishedAt: new Date(),
      publishedByUserId: userId,
    },
    include: {
      publishedBy: { select: { name: true } },
      createdBy: { select: { name: true } },
    },
  });

  return mapVersion(published);
}

export async function discardTemplateDraft(templateKey: string): Promise<void> {
  const draft = await getDraftTemplateVersion(templateKey);
  if (!draft) return;
  await prisma.communicationTemplateVersion.delete({ where: { id: draft.id } });
}

export async function getTemplateVersionState(templateKey: string) {
  const [published, draft, history] = await Promise.all([
    getPublishedTemplateVersion(templateKey),
    getDraftTemplateVersion(templateKey),
    getTemplateVersionHistory(templateKey, 5),
  ]);

  return {
    published,
    draft,
    currentVersion: draft?.versionNumber ?? published?.versionNumber ?? null,
    publishedVersion: published?.versionNumber ?? null,
    draftVersion: draft?.versionNumber ?? null,
    lastPublished: published?.publishedAt ?? null,
    publishedBy: published?.publishedByName ?? null,
    history,
  };
}
