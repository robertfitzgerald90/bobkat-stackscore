import type { CustomerProjectDetailDto } from "@/lib/customer-portal/projects-dto";

/** Describe recorded work only; never infer owners, blockers, or customer obligations. */
export function getProjectNextStep(detail: CustomerProjectDetailDto) {
  if (detail.status === "completed")
    return {
      title: "Project complete",
      description: "Review the completed work and published updates.",
      href: detail.completionReportHref ?? "#project-delivery",
      label: detail.completionReportHref
        ? "View completion report"
        : "Review delivery",
      urgent: false,
    };
  if (detail.status === "cancelled")
    return {
      title: "Project cancelled",
      description: "This project is no longer in active delivery.",
      href: detail.listHref,
      label: "View other projects",
      urgent: false,
    };
  const overdue = detail.milestones.find(
    (item) => item.isOverdue && !item.isComplete,
  );
  if (overdue)
    return {
      title: overdue.title,
      description: `Milestone overdue${overdue.targetDateLabel ? ` · Target ${overdue.targetDateLabel}` : ""}. Review the delivery plan.`,
      href: "#project-delivery",
      label: "Review milestone",
      urgent: true,
    };
  const task = detail.taskGroups.inProgress[0] ?? detail.taskGroups.upNext[0];
  if (task)
    return {
      title: task.title,
      description: `${task.status === "in_progress" ? "Currently in progress" : "Next queued task"}${task.dueDateLabel ? ` · Due ${task.dueDateLabel}` : " · Due date not set"}`,
      href: "#project-delivery",
      label: "View delivery",
      urgent: false,
    };
  if (detail.nextMilestone)
    return {
      title: detail.nextMilestone.title,
      description: detail.nextMilestone.targetDateLabel
        ? `Next milestone · Target ${detail.nextMilestone.targetDateLabel}`
        : "Next milestone · Target date not set",
      href: "#project-delivery",
      label: "View milestone",
      urgent: false,
    };
  return {
    title:
      detail.tasksTotal > 0 && detail.tasksCompleted === detail.tasksTotal
        ? "Delivery checklist complete"
        : "Delivery plan to be confirmed",
    description:
      detail.tasksTotal > 0 && detail.tasksCompleted === detail.tasksTotal
        ? "All recorded tasks are complete. Project status is updated separately after review."
        : "Tasks and milestones will appear here once the delivery plan is recorded.",
    href: "#project-delivery",
    label: "View delivery",
    urgent: false,
  };
}
