import type { AssessmentAiSnapshot } from "@/lib/ai-assessment/schema";

export function ReviewSource({
  snapshot,
  prefix,
}: {
  snapshot: AssessmentAiSnapshot;
  prefix: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Official StackScore: {snapshot.officialScore}/100 · Scoring engine{" "}
        {snapshot.scoringEngineVersion}. Contact details, billing records,
        attachments and assessment internal notes are excluded. Free-text
        responses and evidence still require your review.
      </p>
      <details>
        <summary className="cursor-pointer text-sm font-medium">
          Business context, scores, recommendations and existing work
        </summary>
        <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
          {Object.entries(snapshot.businessContext).map(([key, value]) => (
            <div key={key}>
              <dt className="font-medium">{key.replace(/([A-Z])/g, " $1")}</dt>
              <dd>{value ?? "Not recorded"}</dd>
            </div>
          ))}
        </dl>
        <ul className="my-3 space-y-1 text-sm text-muted-foreground">
          {snapshot.categoryScores.map((score) => (
            <li key={score.code}>
              {score.name}: {score.score}/100
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Critical exposure flag: {snapshot.hasCriticalExposure ? "Yes" : "No"}
        </p>
        <div className="my-3 space-y-3 text-sm">
          {snapshot.recommendations.map((r) => (
            <div key={r.id}>
              <p className="font-medium">
                {r.title} · {r.priority}
              </p>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {r.description}
              </p>
              <p className="text-muted-foreground">
                Business impact: {r.businessImpact}
              </p>
            </div>
          ))}
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {snapshot.existingWork.map((work, i) => (
            <li key={i}>
              {work.kind}: {work.title} · {work.status}
            </li>
          ))}
        </ul>
      </details>
      {snapshot.responses.map((answer) => (
        <details
          key={answer.questionId}
          id={`${prefix}-${answer.questionId}`}
          className="scroll-mt-24 rounded-lg border border-border p-3"
        >
          <summary className="cursor-pointer text-sm">
            {answer.code} · {answer.question}
          </summary>
          <div className="mt-3 space-y-2 whitespace-pre-wrap text-sm text-muted-foreground">
            <p>Recorded answer: {answer.answer}</p>
            <p>
              Recorded points: {answer.scoreEarned} · Critical exposure:{" "}
              {answer.criticalExposure ? "Yes" : "No"}
            </p>
            <p>Evidence: {answer.evidence || "Not recorded"}</p>
            <p>Response notes: {answer.notes || "Not recorded"}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
