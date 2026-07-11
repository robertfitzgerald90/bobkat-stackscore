import { notFound, redirect } from "next/navigation";
import { CommunicationDetailView } from "@/components/communications/communication-detail-view";
import { auth } from "@/lib/auth";
import {
  assertCommunicationsAccessRole,
  assertCommunicationsAdminRole,
} from "@/lib/communications/auth";
import { getCommunicationMessageDetail } from "@/lib/communications/tracking/history-query";

type PageProps = {
  params: Promise<{ messageId: string }>;
};

export default async function CommunicationDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  const { messageId } = await params;
  const message = await getCommunicationMessageDetail(messageId);
  if (!message) notFound();

  const showProviderMetadata = assertCommunicationsAdminRole(session.user.role);

  return (
    <CommunicationDetailView
      showProviderMetadata={showProviderMetadata}
      message={{
        id: message.id,
        subject: message.subject,
        previewText: message.previewText,
        recipientEmail: message.recipientEmail,
        recipientName: message.recipientName,
        templateKey: message.templateKey,
        templateName: message.templateName,
        templateVersion: message.templateVersion,
        statusLabel: message.statusLabel,
        status: message.status,
        isTest: message.isTest,
        sentAt: message.sentAt?.toISOString() ?? null,
        deliveredAt: message.deliveredAt?.toISOString() ?? null,
        firstOpenedAt: message.firstOpenedAt?.toISOString() ?? null,
        lastOpenedAt: message.lastOpenedAt?.toISOString() ?? null,
        openCount: message.openCount,
        firstClickedAt: message.firstClickedAt?.toISOString() ?? null,
        lastClickedAt: message.lastClickedAt?.toISOString() ?? null,
        clickCount: message.clickCount,
        failureReason: message.failureReason,
        providerMessageId: message.providerMessageId,
        client: message.client,
        user: message.user,
        createdBy: message.createdBy,
        assessment: message.assessment,
        project: message.project,
        events: message.events,
        clickedLinks: message.clickedLinks,
        metadataJson: message.metadataJson,
      }}
    />
  );
}
