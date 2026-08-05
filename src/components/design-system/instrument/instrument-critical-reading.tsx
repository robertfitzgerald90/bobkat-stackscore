import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * A single critical "reading" card — used on the Phase 2 preview page to
 * demonstrate ember-toned four-corner brackets. The bracket color, not the
 * card body, carries the severity signal.
 */
export function InstrumentCriticalReading() {
  return (
    <Card className="max-w-full border-destructive/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="instrument-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Backup &amp; Recovery
          </CardTitle>
          <Badge variant="destructive" className="text-[10px]">
            Critical
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="instrument-mono text-4xl font-semibold text-destructive">52</p>
        <p className="text-sm text-muted-foreground">
          No immutable backup copy confirmed. Restore has not been tested in the last 90 days.
        </p>
      </CardContent>
    </Card>
  );
}
