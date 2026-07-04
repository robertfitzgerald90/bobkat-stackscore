export type {
  ClientWorkspaceKpis,
  ClientWorkspaceSnapshot,
  ImmediateFocusItem,
  ImmediateFocusItemKind,
} from "@/lib/client-workspace/immediate-focus";

export { buildClientWorkspaceSnapshot } from "@/lib/client-workspace/immediate-focus";
export { conciseFocusTitle, formatFocusMetadataLine } from "@/lib/client-workspace/display";

export type {
  ClientWorkspaceNavItem,
  ClientWorkspaceSection,
} from "@/lib/client-workspace/nav";

export {
  CLIENT_WORKSPACE_NAV,
  CLIENT_WORKSPACE_SECTIONS,
  CLIENT_VISIBLE_WORKSPACE_SECTIONS,
  getVisibleWorkspaceNav,
  isClientVisibleWorkspaceSection,
  isClientWorkspaceSection,
  resolveActiveWorkspaceSection,
  resolveClientWorkspaceNavHref,
} from "@/lib/client-workspace/nav";
