import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import {
  clientSurfaceCardClass,
  type ClientVisualVariant,
} from "@/lib/client-ui/tokens";
import { cn } from "@/lib/utils";

type ClientSurfaceCardProps = {
  children: ReactNode;
  variant?: ClientVisualVariant;
  className?: string;
};

/**
 * Customer surface card with optional industrial corner treatment (SS-UX-003).
 * Reserve `industrial` for major panels — not every nested card.
 */
export function ClientSurfaceCard({
  children,
  variant = "default",
  className,
}: ClientSurfaceCardProps) {
  return <Card className={cn(clientSurfaceCardClass(variant), className)}>{children}</Card>;
}
