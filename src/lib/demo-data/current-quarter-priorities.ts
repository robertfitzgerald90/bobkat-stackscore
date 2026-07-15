import type { PriorityItem } from "@/components/priorities/current-quarter-priorities";

/** Static demo data for public marketing previews — never loaded from the database. */
export const currentQuarterPrioritiesDemoData: PriorityItem[] = [
  {
    id: "demo-priority-1",
    title: "Standardize patch-management policies",
    severity: "critical",
  },
  {
    id: "demo-priority-2",
    title: "Formalize administrative account controls",
    severity: "critical",
  },
  {
    id: "demo-priority-3",
    title: "Formalize vendor lifecycle documentation",
    severity: "critical",
  },
  {
    id: "demo-priority-4",
    title: "Standardize Microsoft 365 security baseline",
    severity: "critical",
  },
  {
    id: "demo-priority-5",
    title: "Establish immutable backup strategy",
    severity: "critical",
  },
  {
    id: "demo-priority-6",
    title: "Deploy infrastructure availability monitoring",
    severity: "critical",
  },
  {
    id: "demo-priority-7",
    title: "Implement centralized endpoint management",
    severity: "critical",
  },
];
