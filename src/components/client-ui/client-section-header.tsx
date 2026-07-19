import type { ReactNode } from "react";
import { CLIENT_SECTION_EYEBROW } from "@/lib/client-ui/tokens";
import { cn } from "@/lib/utils";

type ClientSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function ClientSectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: ClientSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? <p className={CLIENT_SECTION_EYEBROW}>{eyebrow}</p> : null}
        <h2
          className={cn(
            "text-lg font-semibold tracking-tight text-foreground sm:text-xl",
            eyebrow && "mt-1",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
