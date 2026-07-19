import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CLIENT_NEXT_ACTION_SURFACE } from "@/lib/client-ui/tokens";
import { cn } from "@/lib/utils";

type ClientNextActionCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  meta?: string;
  actions?: ReactNode;
  className?: string;
  showIcon?: boolean;
};

export function ClientNextActionCard({
  eyebrow = "Next Recommended Action",
  title,
  description,
  meta,
  actions,
  className,
  showIcon = true,
}: ClientNextActionCardProps) {
  return (
    <Card className={cn(CLIENT_NEXT_ACTION_SURFACE, className)}>
      <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {showIcon ? (
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          ) : null}
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">{eyebrow}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
            {meta ? <p className="mt-2 text-xs text-muted-foreground">{meta}</p> : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap">{actions}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
