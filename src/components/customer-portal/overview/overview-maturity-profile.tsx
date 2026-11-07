"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CustomerOverviewPillar } from "@/lib/customer-portal/overview-dto";
import { summarizePlanner, type PlannerTaskView } from "@/lib/planner/model";

const axisLabels = [
  "Identity",
  "Endpoints",
  "Network",
  "Recovery",
  "Collaboration",
  "Security",
  "Knowledge",
  "Strategy",
];
export function OverviewMaturityProfile({
  pillars,
  tasks,
  clientId,
  assessedAtLabel,
}: {
  pillars: CustomerOverviewPillar[];
  tasks: PlannerTaskView[];
  clientId: string;
  assessedAtLabel: string | null;
}) {
  const [selected, setSelected] = useState(pillars[0]?.code);
  const [showActions, setShowActions] = useState(true);
  const summary = summarizePlanner(tasks);
  const active = pillars.find((p) => p.code === selected) ?? pillars[0];
  const activeProgress = summary.pillars.find((p) => p.code === active?.code);
  const point = (i: number, percent: number, radius = 104) => {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / pillars.length;
    return [
      180 + (Math.cos(angle) * radius * percent) / 100,
      150 + (Math.sin(angle) * radius * percent) / 100,
    ];
  };
  const polygon = (percent: number) =>
    pillars.map((_, i) => point(i, percent).join(",")).join(" ");
  const hasFullAssessment =
    pillars.length > 0 && pillars.every((p) => p.score !== null);
  if (!pillars.length) return null;
  return (
    <section
      aria-labelledby="maturity-profile-heading"
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="maturity-profile-heading" className="text-lg font-semibold">
          Your maturity profile
        </h2>
        <span className="text-xs text-muted-foreground">
          {assessedAtLabel
            ? `Assessment: ${assessedAtLabel}`
            : "Assessment pending"}
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">
            Connected. Measured. Understood.
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Your assessment baseline and recorded improvement activity.
          </p>
          <svg
            viewBox="0 0 360 305"
            className="mx-auto w-full max-w-md"
            role="img"
            aria-label="Technology maturity radar. Solid purple shows assessment scores. Blue dots show action completion percentages, not maturity scores. Exact values are listed below."
          >
            {[25, 50, 75, 100].map((n) => (
              <polygon
                key={n}
                points={polygon(n)}
                fill="none"
                stroke="currentColor"
                className="text-border"
                strokeDasharray={n === 100 ? undefined : "3 4"}
              />
            ))}
            {pillars.map((p, i) => {
              const end = point(i, 100);
              const label = point(i, 100, 137);
              return (
                <g key={p.code}>
                  <line
                    x1="180"
                    y1="150"
                    x2={end[0]}
                    y2={end[1]}
                    stroke="currentColor"
                    className="text-border"
                  />
                  <text
                    x={label[0]}
                    y={label[1]}
                    fontSize="9"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="currentColor"
                    className="text-muted-foreground"
                  >
                    {axisLabels[i] ?? p.name}
                  </text>
                </g>
              );
            })}
            {[25, 50, 75, 100].map((n) => (
              <text
                key={n}
                x="185"
                y={150 - (104 * n) / 100}
                fontSize="8"
                fill="currentColor"
                className="text-muted-foreground"
              >
                {n}
              </text>
            ))}
            {hasFullAssessment && (
              <polygon
                points={pillars
                  .map((p, i) => point(i, p.score!).join(","))
                  .join(" ")}
                fill="currentColor"
                fillOpacity="0.12"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary"
              />
            )}
            {pillars.map((p, i) => {
              const assessment = point(i, p.score ?? 0);
              const progress = summary.pillars.find(
                (s) => s.code === p.code,
              )?.progress;
              const action = point(i, progress ?? 0);
              return (
                <g key={p.code}>
                  {p.score !== null && (
                    <circle
                      cx={assessment[0]}
                      cy={assessment[1]}
                      r={selected === p.code ? 6 : 4}
                      fill="currentColor"
                      className="text-primary"
                      stroke="var(--background)"
                      strokeWidth="2"
                    />
                  )}
                  {showActions &&
                    progress !== null &&
                    progress !== undefined && (
                      <circle
                        cx={action[0]}
                        cy={action[1]}
                        r="4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-sky-600"
                      >
                        <title>
                          {`${p.name}: ${progress}% of planner actions complete`}
                        </title>
                      </circle>
                    )}
                </g>
              );
            })}
          </svg>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <span>
              <span className="mr-1 inline-block h-0.5 w-5 bg-primary align-middle" />
              Assessment score
            </span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showActions}
                onChange={(e) => setShowActions(e.target.checked)}
              />
              <span className="text-sky-600">○</span>Action completion (%)
            </label>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {pillars.map((p) => (
              <button
                key={p.code}
                aria-pressed={selected === p.code}
                onClick={() => setSelected(p.code)}
                className={`flex min-w-0 items-center justify-between gap-2 rounded-lg border p-3 text-left text-xs ${selected === p.code ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <span>{p.name}</span>
                <strong className="text-base tabular-nums text-primary">
                  {p.score ?? "—"}
                </strong>
              </button>
            ))}
          </div>
        </div>
        {active && (
          <div className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Selected pillar
            </p>
            <h3 className="mt-3 text-xl font-semibold">{active.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {active.businessQuestion}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-primary/5 p-4">
                <p className="text-xs text-muted-foreground">
                  Assessment baseline
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {active.score ?? "—"}
                  <span className="text-sm text-muted-foreground"> / 100</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {active.maturityLabel ?? "Not yet assessed"}
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">
                  Recorded action progress
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {activeProgress?.progress !== null &&
                  activeProgress?.progress !== undefined
                    ? `${activeProgress.progress}%`
                    : "—"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {activeProgress?.complete ?? 0} of{" "}
                  {activeProgress?.total ?? 0} actions complete
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Action completion updates as work is recorded in your planner. It
              shows implementation activity, not verified maturity. Reassessment
              confirms changes to your official scores.
            </p>
            <div className="mt-6 space-y-2">
              {tasks
                .filter((t) => t.pillarCode === active.code)
                .slice(0, 4)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start justify-between gap-3 border-t border-border py-3 text-xs"
                  >
                    <span className="min-w-0 break-words">{t.title}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {t.status === "complete"
                        ? "Complete"
                        : t.status === "in_progress"
                          ? "In progress"
                          : t.status === "blocked"
                            ? "Blocked"
                            : "Planned"}
                    </span>
                  </div>
                ))}
            </div>
            <div className="mt-auto flex flex-wrap gap-4 pt-6">
              <Link
                href={active.href}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                Explore pillar
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/clients/${clientId}/roadmap`}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                Open planner
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
