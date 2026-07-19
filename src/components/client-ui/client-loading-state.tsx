import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { cn } from "@/lib/utils";

type ClientLoadingStateProps = {
  label?: string;
  className?: string;
};

/** Polished loading placeholder for client-facing sections. */
export function ClientLoadingState({
  label = "Loading your technology workspace…",
  className,
}: ClientLoadingStateProps) {
  return (
    <Card className={cn(CLIENT_SURFACE_CARD, className)} role="status" aria-live="polite">
      <CardContent className="flex items-center gap-3 p-6">
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
