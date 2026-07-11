export const PROSPECT_STATUS_LABELS: Record<string, string> = {
  new: "New",
  invited: "Invited",
  opened: "Opened",
  clicked: "Clicked",
  assessment_started: "Assessment Started",
  assessment_completed: "Assessment Completed",
  converted: "Converted",
  archived: "Archived",
};

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  ready: "Ready",
  sending: "Sending",
  completed: "Completed",
  archived: "Archived",
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  quick_invite: "Quick Invite",
  csv_import: "CSV Import",
  campaign: "Campaign",
  referral: "Referral",
  networking: "Networking",
  website: "Website",
  manual: "Manual",
  other: "Other",
};

export const CAMPAIGN_EVENT_LABELS: Record<string, string> = {
  campaign_created: "Campaign Created",
  recipient_added: "Recipient Added",
  invitation_sent: "Invitation Sent",
  invitation_opened: "Invitation Opened",
  invitation_clicked: "Invitation Clicked",
  assessment_started: "Assessment Started",
  assessment_completed: "Assessment Completed",
  campaign_finished: "Campaign Finished",
};
