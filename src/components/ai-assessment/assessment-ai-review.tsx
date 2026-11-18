"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { ReviewSource } from "./review-source";
import { Button } from "@/components/ui/button";
import type {
  AiReviewDraft,
  AssessmentAiSnapshot,
} from "@/lib/ai-assessment/schema";

type Review = {
  id: string;
  status: string;
  revision: number;
  model: string;
  promptVersion: string;
  createdAt: string;
  approvedAt: string | null;
  stale: boolean;
  errorCode: string | null;
  snapshot: AssessmentAiSnapshot;
  draft: AiReviewDraft | null;
};
type ReviewData = {
  enabled: boolean;
  inputHash: string | null;
  snapshot: AssessmentAiSnapshot | null;
  review: Review | null;
  history: Array<{ id: string; status: string; createdAt: string }>;
};
const active = (status?: string) =>
  status === "queued" || status === "generating";
const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm disabled:opacity-70";

/** Internal draft editor. Customer access is deliberately not exposed by this component or its API. */
export function AssessmentAiReview({ assessmentId }: { assessmentId: string }) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [draft, setDraft] = useState<AiReviewDraft | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const review = data?.review;
  const dirty = JSON.stringify(draft) !== JSON.stringify(review?.draft ?? null);
  const editing = review?.status === "draft" && !busy;

  const load = useCallback(
    async (reviewId?: string) => {
      try {
        const response = await fetch(
          `/api/v1/assessments/${assessmentId}/ai-review${reviewId ? `?reviewId=${encodeURIComponent(reviewId)}` : ""}`,
          { cache: "no-store" },
        );
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error || "Unable to load AI reviews.");
        setConsent(false);
        setData(body);
        setDraft(body.review?.draft ?? null);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load AI reviews.");
      } finally {
        setLoading(false);
      }
    },
    [assessmentId],
  );
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!active(review?.status)) return;
    const timer = setInterval(() => void load(review?.id), 4000);
    return () => clearInterval(timer);
  }, [review?.id, review?.status, load]);

  async function generate() {
    if (
      dirty &&
      !window.confirm(
        "Generate a new review and discard unsaved edits? Saved versions are retained.",
      )
    )
      return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        `/api/v1/assessments/${assessmentId}/ai-review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consent, inputHash: data?.inputHash }),
        },
      );
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error || "Generation could not be started.");
      await load(body.reviewId);
      setMessage(
        "Generation started. You can return to this assessment to review the result.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Generation could not be started.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function save(action: "save" | "approve") {
    if (!review || !draft) return;
    if (
      action === "approve" &&
      !window.confirm(
        "Approve this reviewed analysis and roadmap draft? This does not publish it or change the active roadmap.",
      )
    )
      return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        `/api/v1/assessments/${assessmentId}/ai-review`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            reviewId: review.id,
            revision: review.revision,
            ...(action === "save" ? { draft } : {}),
          }),
        },
      );
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error || "Review could not be saved.");
      await load(review.id);
      setMessage(
        action === "approve"
          ? "Review approved and retained internally. No customer publication or roadmap changes were made."
          : "Draft changes saved.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  const snapshot = review?.snapshot ?? data?.snapshot;
  const question = (id: string) =>
    snapshot?.responses.find((q) => q.questionId === id);
  const evidence = (ids: string[]) => (
    <div className="mt-3 flex flex-wrap gap-2">
      {ids.map((id) => (
        <a
          key={id}
          href={`#ai-evidence-${id}`}
          className="rounded border border-primary/25 bg-primary/5 px-2 py-1 text-xs text-primary hover:underline"
        >
          Evidence: {question(id)?.code ?? id}
        </a>
      ))}
    </div>
  );
  function updateInitiative(
    index: number,
    changes: Partial<AiReviewDraft["initiatives"][number]>,
  ) {
    setDraft((value) =>
      value
        ? {
            ...value,
            initiatives: value.initiatives.map((item, i) =>
              i === index ? { ...item, ...changes } : item,
            ),
          }
        : value,
    );
  }

  return (
    <section
      className="min-w-0 space-y-5 rounded-xl border border-primary/25 bg-card p-5 sm:p-6"
      aria-labelledby="ai-review-heading"
    >
      <header>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <Sparkles className="h-4 w-4" aria-hidden />
          Admin assessment review
        </p>
        <h2 id="ai-review-heading" className="mt-2 text-xl font-semibold">
          AI analysis &amp; roadmap draft
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Explore evidence-backed findings and suggested next steps. Review all
          claims before approval. Official scores and the active customer
          roadmap stay unchanged.
        </p>
      </header>
      {loading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading AI review…
        </p>
      ) : null}
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 p-3 text-sm"
        >
          {error}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="ml-3"
            disabled={busy}
            onClick={() => {
              if (!dirty || window.confirm("Reload and discard unsaved edits?"))
                void load(review?.id);
            }}
          >
            Reload review
          </Button>
        </div>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-primary">
          {message}
        </p>
      ) : null}
      {data && !data.enabled ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          AI review is disabled. Configure the server-side provider key and
          enable assessment reviews before generating drafts.
        </p>
      ) : null}
      {data?.enabled ? (
        <>
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex min-w-0 flex-1 items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={consent}
                disabled={busy}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              <span>
                I have reviewed the current source preview below and authorize
                sending these assessment answers, evidence, business context and
                eligible recommendations to the configured AI provider.
              </span>
            </label>
            <Button
              type="button"
              disabled={
                busy ||
                !consent ||
                data.history.some((item) => active(item.status))
              }
              onClick={() => void generate()}
            >
              <Sparkles className="mr-2 h-4 w-4" aria-hidden />
              {busy ? "Working…" : "Generate new draft"}
            </Button>
          </div>
          {data.history.length > 0 ? (
            <label className="block max-w-lg text-sm">
              Review history
              <select
                className={fieldClass}
                disabled={busy}
                value={review?.id ?? ""}
                onChange={(e) => {
                  if (
                    !dirty ||
                    window.confirm("Switch versions and discard unsaved edits?")
                  )
                    void load(e.target.value);
                }}
              >
                {data.history.map((item) => (
                  <option key={item.id} value={item.id}>
                    {new Date(item.createdAt).toLocaleString()} · {item.status}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {active(review?.status) ? (
            <p
              role="status"
              className="flex items-center gap-2 rounded-lg bg-primary/5 p-4 text-sm"
            >
              <Loader2
                className="h-4 w-4 animate-spin motion-reduce:animate-none"
                aria-hidden
              />
              Generating your review. Saved drafts and approved work will be
              preserved.
            </p>
          ) : null}
          {review?.status === "failed" ? (
            <p
              role="alert"
              className="rounded-lg border border-warning/30 p-4 text-sm"
            >
              Generation did not complete or failed validation. No plan was
              changed. Check provider availability and configuration, then
              generate another draft. Reference: {review.errorCode}
            </p>
          ) : null}
          {review?.stale ? (
            <p
              role="alert"
              className="rounded-lg border border-warning/30 p-4 text-sm"
            >
              The assessment or delivery context has changed since this version.
              Generate a fresh review before approval.
            </p>
          ) : null}
          {draft && review ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded border px-2 py-1 font-semibold uppercase">
                  {review.status}
                </span>
                <span>
                  {review.model} · {review.promptVersion}
                </span>
                {dirty ? (
                  <span className="text-warning">Unsaved changes</span>
                ) : null}
              </div>
              <label className="block text-sm font-semibold">
                Executive summary
                <textarea
                  className={fieldClass}
                  disabled={!editing}
                  rows={4}
                  maxLength={2400}
                  value={draft.executiveSummary}
                  onChange={(e) =>
                    setDraft({ ...draft, executiveSummary: e.target.value })
                  }
                />
              </label>
              <section className="space-y-3" aria-label="Assessment findings">
                <h3 className="text-base font-semibold">
                  Findings and supporting evidence
                </h3>
                {draft.findings.map((finding, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border p-4"
                  >
                    <label className="block text-xs text-muted-foreground">
                      Finding {index + 1}
                      <input
                        className={fieldClass}
                        disabled={!editing}
                        maxLength={180}
                        value={finding.title}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            findings: draft.findings.map((f, i) =>
                              i === index ? { ...f, title: e.target.value } : f,
                            ),
                          })
                        }
                      />
                    </label>
                    <label className="mt-2 block text-xs text-muted-foreground">
                      Analysis
                      <textarea
                        className={fieldClass}
                        disabled={!editing}
                        rows={3}
                        maxLength={2400}
                        value={finding.analysis}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            findings: draft.findings.map((f, i) =>
                              i === index
                                ? { ...f, analysis: e.target.value }
                                : f,
                            ),
                          })
                        }
                      />
                    </label>
                    {evidence(finding.questionIds)}
                  </div>
                ))}
              </section>
              <section className="space-y-3" aria-label="Proposed roadmap">
                <h3 className="text-base font-semibold">Suggested roadmap</h3>
                <p className="text-sm text-muted-foreground">
                  Sequencing is a proposal. It does not create projects, set
                  budgets or activate a customer roadmap.
                </p>
                {draft.initiatives.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No additional eligible initiatives were proposed. Existing
                    work and open questions remain available below.
                  </p>
                ) : null}
                {draft.initiatives.map((initiative, index) => (
                  <article
                    key={initiative.recommendationId}
                    className="space-y-3 rounded-lg border border-primary/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold">
                        {String(index + 1).padStart(2, "0")} ·{" "}
                        {
                          snapshot?.recommendations.find(
                            (r) => r.id === initiative.recommendationId,
                          )?.title
                        }
                      </h4>
                      <LinkRecommendation id={initiative.recommendationId} />
                    </div>
                    <label className="block text-xs text-muted-foreground">
                      Initiative title
                      <input
                        className={fieldClass}
                        disabled={!editing}
                        maxLength={180}
                        value={initiative.title}
                        onChange={(e) =>
                          updateInitiative(index, { title: e.target.value })
                        }
                      />
                    </label>
                    <label className="block max-w-xs text-xs text-muted-foreground">
                      Suggested phase
                      <select
                        className={fieldClass}
                        disabled={!editing}
                        value={initiative.horizon}
                        onChange={(e) =>
                          updateInitiative(index, {
                            horizon: e.target.value as "now" | "next" | "later",
                          })
                        }
                      >
                        <option value="now">Now</option>
                        <option value="next">Next</option>
                        <option value="later">Later</option>
                      </select>
                    </label>
                    <label className="block text-xs text-muted-foreground">
                      Why this comes next
                      <textarea
                        className={fieldClass}
                        disabled={!editing}
                        rows={3}
                        maxLength={2400}
                        value={initiative.rationale}
                        onChange={(e) =>
                          updateInitiative(index, { rationale: e.target.value })
                        }
                      />
                    </label>
                    <EditableList
                      title="Proposed steps"
                      items={initiative.steps}
                      editing={editing}
                      limit={8}
                      minimum={1}
                      onChange={(steps) => updateInitiative(index, { steps })}
                    />
                    <EditableList
                      title="Completion evidence"
                      items={initiative.completionEvidence}
                      editing={editing}
                      limit={6}
                      minimum={1}
                      onChange={(completionEvidence) =>
                        updateInitiative(index, { completionEvidence })
                      }
                    />
                    {editing ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            initiatives: draft.initiatives
                              .filter((_, i) => i !== index)
                              .map((item) => ({
                                ...item,
                                dependsOnRecommendationIds:
                                  item.dependsOnRecommendationIds.filter(
                                    (id) => id !== initiative.recommendationId,
                                  ),
                              })),
                          })
                        }
                      >
                        Remove initiative
                      </Button>
                    ) : null}
                    {initiative.dependsOnRecommendationIds.length ? (
                      <p className="text-xs text-muted-foreground">
                        Depends on:{" "}
                        {initiative.dependsOnRecommendationIds
                          .map(
                            (id) =>
                              draft.initiatives.find(
                                (item) => item.recommendationId === id,
                              )?.title,
                          )
                          .join(", ")}
                      </p>
                    ) : null}
                    {evidence(initiative.questionIds)}
                  </article>
                ))}
              </section>
              <div className="grid gap-4 md:grid-cols-2">
                <EditableList
                  title="Assumptions to verify"
                  items={draft.assumptions}
                  editing={editing}
                  limit={12}
                  minimum={0}
                  onChange={(assumptions) =>
                    setDraft({ ...draft, assumptions })
                  }
                />
                <EditableList
                  title="Questions for the business"
                  items={draft.openQuestions}
                  editing={editing}
                  limit={12}
                  minimum={0}
                  onChange={(openQuestions) =>
                    setDraft({ ...draft, openQuestions })
                  }
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!editing || !dirty}
                  onClick={() => void save("save")}
                >
                  Save draft
                </Button>
                <Button
                  type="button"
                  disabled={!editing || dirty || review.stale}
                  onClick={() => void save("approve")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />
                  Approve internal review
                </Button>
                <p className="text-xs text-muted-foreground">
                  Approval retains this version internally. Customer publication
                  is a separate step.
                </p>
              </div>
            </div>
          ) : null}
          {data.snapshot ? (
            <details
              id="ai-generation-source"
              className="space-y-3 rounded-lg border border-border p-4"
            >
              <summary className="cursor-pointer text-sm font-semibold">
                Preview current data for a new generation
              </summary>
              <div className="mt-4">
                <ReviewSource snapshot={data.snapshot} prefix="ai-current" />
              </div>
            </details>
          ) : null}
          {review?.snapshot ? (
            <section
              className="space-y-3 border-t border-border pt-4"
              aria-label="AI source evidence"
            >
              <h3 className="text-base font-semibold">
                Evidence captured for this review version
              </h3>
              <ReviewSource snapshot={review.snapshot} prefix="ai-evidence" />
            </section>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
function LinkRecommendation({ id }: { id: string }) {
  return (
    <a
      href={`/recommendations/${id}`}
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
    >
      View recommendation
      <ArrowRight className="h-3 w-3" aria-hidden />
    </a>
  );
}
function EditableList({
  title,
  items,
  editing,
  limit,
  minimum,
  onChange,
}: {
  title: string;
  items: string[];
  editing: boolean;
  limit: number;
  minimum: number;
  onChange: (items: string[]) => void;
}) {
  return (
    <section className="space-y-2 rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length ? (
        <ol className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              {editing ? (
                <>
                  <label className="min-w-0 flex-1 text-xs text-muted-foreground">
                    {title} {i + 1}
                    <textarea
                      rows={2}
                      maxLength={
                        title === "Assumptions to verify" ||
                        title === "Questions for the business"
                          ? 600
                          : 500
                      }
                      value={item}
                      className={fieldClass}
                      onChange={(e) =>
                        onChange(
                          items.map((value, index) =>
                            index === i ? e.target.value : value,
                          ),
                        )
                      }
                    />
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove ${title} ${i + 1}`}
                    disabled={items.length <= minimum}
                    onClick={() =>
                      onChange(items.filter((_, index) => index !== i))
                    }
                  >
                    Remove
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {i + 1}. {item}
                </p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">
          None recorded in this draft.
        </p>
      )}
      {editing ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={items.length >= limit}
          onClick={() => onChange([...items, ""])}
        >
          Add {title.toLowerCase()}
        </Button>
      ) : null}
    </section>
  );
}
