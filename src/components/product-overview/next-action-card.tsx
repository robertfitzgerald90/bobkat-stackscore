"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DemoNextAction } from "@/lib/product-overview/types";

type NextActionCardProps = {
  nextAction: DemoNextAction;
  onReview?: (anchor: HTMLElement) => void;
};

export function NextActionCard({ nextAction, onReview }: NextActionCardProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          <CardTitle className="text-base">Next Recommended Action</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-foreground">{nextAction.body}</p>
        <div className="rounded-lg border border-border/60 bg-background/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{nextAction.reason}</p>
        </div>
        <Button onClick={(event) => onReview?.(event.currentTarget)}>Review Priority</Button>
      </CardContent>
    </Card>
  );
}
