import { ClipboardList } from "lucide-react";
import { ScoreTrendChart } from "@/components/analytics/score-trend-chart";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import type { ScoreTrendPoint } from "@/lib/analytics/types";

type TpScoreHistoryProps = {
  clientId: string;
  scoreTrend: ScoreTrendPoint[];
  assessmentsCompleted: number;
};

export function TpScoreHistory({
  clientId,
  scoreTrend,
  assessmentsCompleted,
}: TpScoreHistoryProps) {
  return (
    <Card className="stat-card h-full">
      <CardHeader>
        <CardTitle>Score History</CardTitle>
        <CardDescription>Historical StackScore from completed assessments</CardDescription>
      </CardHeader>
      <CardContent>
        {scoreTrend.length === 0 ? (
          <TpEmptyState
            icon={ClipboardList}
            title="No score history yet"
            message="Complete an initial assessment to begin tracking StackScore over time."
            actionLabel={assessmentsCompleted === 0 ? "Start assessment" : undefined}
            actionHref={
              assessmentsCompleted === 0 ? clientTechnologyProfilePath(clientId) : undefined
            }
          />
        ) : (
          <div className="-mx-1 overflow-x-auto sm:mx-0">
            <ScoreTrendChart data={scoreTrend} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
