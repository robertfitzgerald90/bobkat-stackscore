export type {
  ClientWorkspaceKpis,
  ClientWorkspaceSnapshot,
  ImmediateFocusItem,
  ImmediateFocusItemKind,
} from "@/lib/client-workspace/immediate-focus";

export { buildClientWorkspaceSnapshot } from "@/lib/client-workspace/immediate-focus";
export { conciseFocusTitle, formatFocusMetadataLine } from "@/lib/client-workspace/display";

export type {
  ClientWorkspaceGroup,
  ClientWorkspaceGroupChild,
  ClientWorkspaceGroupId,
  ClientWorkspaceNavItem,
  ClientWorkspaceSection,
} from "@/lib/client-workspace/nav";

export {
  CLIENT_WORKSPACE_GROUP_IDS,
  CLIENT_WORKSPACE_GROUPS,
  CLIENT_WORKSPACE_NAV,
  CLIENT_WORKSPACE_SECTIONS,
  CLIENT_VISIBLE_WORKSPACE_SECTIONS,
  getStaffWorkspaceGroups,
  getVisibleWorkspaceNav,
  getWorkspaceGroupById,
  isClientVisibleWorkspaceSection,
  isClientWorkspaceGroupId,
  isClientWorkspaceSection,
  isWorkspaceNavChildActive,
  resolveActiveWorkspaceGroup,
  resolveActiveWorkspaceSection,
  resolveClientWorkspaceGroupHref,
  resolveClientWorkspaceNavHref,
} from "@/lib/client-workspace/nav";
