import type { ReactNode } from "react";
import {
  CLIENT_SECTION_DESCRIPTION,
  CLIENT_SECTION_EYEBROW,
  CLIENT_SECTION_TITLE,
} from "@/lib/client-ui/tokens";
import { cn } from "@/lib/utils";

type ClientPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function ClientPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: ClientPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? <p className={CLIENT_SECTION_EYEBROW}>{eyebrow}</p> : null}
        <h1 className={cn(CLIENT_SECTION_TITLE, !eyebrow && "mt-0")}>{title}</h1>
        {description ? <p className={CLIENT_SECTION_DESCRIPTION}>{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
