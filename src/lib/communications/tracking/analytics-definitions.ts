export const ANALYTICS_DEFINITIONS = {
  deliveryRate: "Unique delivered production messages ÷ production messages sent",
  openRate: "Unique production messages with at least one open ÷ delivered production messages",
  clickRate: "Unique production messages with at least one click ÷ delivered production messages",
  bounceRate: "Production messages marked bounced ÷ production messages sent",
  failureRate: "Production messages marked failed ÷ production messages sent",
} as const;
