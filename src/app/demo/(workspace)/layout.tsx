import type { ReactNode } from "react";
import { PublicDemoShell } from "@/components/public-demo/public-demo-shell";

export default function PublicDemoWorkspaceLayout({ children }: { children: ReactNode }) {
  return <PublicDemoShell>{children}</PublicDemoShell>;
}
