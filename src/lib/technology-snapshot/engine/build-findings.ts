import {
  SNAPSHOT_ANSWER_OPTIONS_V2,
  SNAPSHOT_CATEGORIES_V2,
  SNAPSHOT_CATALOG_VERSION_V2,
  SNAPSHOT_QUESTIONS_V2,
  SNAPSHOT_V2_MAX_SCORE,
  type SnapshotCategoryId,
  getSnapshotQuestionV2,
  questionsForCategory,
} from "../catalog-v2";
import type { SnapshotAnswerValue } from "../types";
import {
  classifyPosturePoints,
  getPostureLabel,
  getPostureSummary,
} from "./bands";
import { buildCriticalRisks } from "./critical-risks";
import type {
  SnapshotAnswersV2,
  SnapshotCategoryFinding,
  SnapshotFindingCitation,
  SnapshotFindingsV2,
  SnapshotOpportunity,
  SnapshotPostureBand,
} from "./types";

const ANSWER_POINTS = Object.fromEntries(
  SNAPSHOT_ANSWER_OPTIONS_V2.map((o) => [o.value, o.points]),
) as Record<SnapshotAnswerValue, number>;

const CATEGORY_BAND_SUMMARIES: Record<
  SnapshotCategoryId,
  Record<SnapshotPostureBand, string>
> = {
  security_access: {
    strong_foundation:
      "Access and security monitoring practices look comparatively solid based on your answers.",
    mixed_signals:
      "Some access or monitoring practices look stronger than others — inconsistency is often where risk hides.",
    notable_gaps:
      "Important gaps in how people sign in or how security issues are watched stand out.",
    urgent_attention:
      "Foundational access and security practices appear weak or unclear across several answers.",
  },
  devices_infrastructure: {
    strong_foundation:
      "Devices, connectivity, and day-to-day tools appear relatively well managed.",
    mixed_signals:
      "Infrastructure reliability looks uneven — some areas may disrupt work more than others.",
    notable_gaps:
      "Device upkeep, connectivity, or ownership clarity shows meaningful room for improvement.",
    urgent_attention:
      "Core device and infrastructure practices look fragile or poorly defined.",
  },
  data_protection: {
    strong_foundation:
      "Backup and recovery readiness looks comparatively strong from your responses.",
    mixed_signals:
      "Protection exists in places, but restore confidence or planning may still be incomplete.",
    notable_gaps:
      "Backup or recovery practices show notable gaps that could hurt the business after an incident.",
    urgent_attention:
      "Data protection and recovery readiness looks critically thin based on your answers.",
  },
  technology_planning: {
    strong_foundation:
      "Technology priorities and handoff readiness look relatively intentional.",
    mixed_signals:
      "Planning exists in places, but documentation or change-driven review may lag.",
    notable_gaps:
      "Technology planning and knowledge transfer show notable gaps.",
    urgent_attention:
      "Technology direction and support continuity look largely reactive or undocumented.",
  },
};

const NEXT_STEPS: Record<SnapshotCategoryId, string> = {
  security_access:
    "Confirm MFA coverage on email and remote access, then review who still has active logins.",
  devices_infrastructure:
    "Standardize device updates and name a clear owner for day-to-day technology support.",
  data_protection:
    "Verify backups cover critical data and schedule a real restore test within 30 days.",
  technology_planning:
    "Write a one-page technology priority list and document how a backup contact would take over support.",
};

const OPPORTUNITY_COPY: Record<string, { title: string; why: string }> = {
  A1: {
    title: "Turn on multi-factor authentication for important systems",
    why: "An extra login step sharply reduces the chance a stolen password becomes a business breach.",
  },
  A2: {
    title: "Tighten offboarding so departed staff lose access promptly",
    why: "Leftover accounts are a common and preventable exposure.",
  },
  A3: {
    title: "Establish a simple cadence for reviewing security alerts",
    why: "Unwatched alerts let small problems become incidents.",
  },
  A4: {
    title: "Reduce shared passwords and control the ones that remain",
    why: "Shared credentials make accountability and lockouts harder when something goes wrong.",
  },
  B1: {
    title: "Keep company devices on a consistent update schedule",
    why: "Unpatched devices are a frequent entry point for malware.",
  },
  B2: {
    title: "Improve connectivity reliability for daily work",
    why: "Outages quietly tax productivity and frustrate customers and staff.",
  },
  B3: {
    title: "Organize where email, files, and chat work belongs",
    why: "Clear structure reduces lost work and accidental sharing.",
  },
  B4: {
    title: "Name a clear owner for day-to-day technology issues",
    why: "Ambiguous ownership slows every outage and security response.",
  },
  C1: {
    title: "Put critical company data on automatic backups",
    why: "Laptop-only copies are not a recovery strategy.",
  },
  C2: {
    title: "Run and document a successful backup restore test",
    why: "Backups that have never been restored are an unknown until crisis day.",
  },
  C3: {
    title: "Define a simple ransomware recovery plan",
    why: "Knowing who does what in the first hours limits downtime and guesswork.",
  },
  D1: {
    title: "Write a short technology priority and spend plan",
    why: "A one-page plan keeps spending aligned with business goals instead of emergencies.",
  },
  D2: {
    title: "Document enough for another trusted IT contact to take over",
    why: "Single-person knowledge is a continuity risk for the business.",
  },
  D3: {
    title: "Review technology needs when the business changes",
    why: "Growth, new locations, and new software often outpace informal habits.",
  },
};

/** Prefer these question IDs when opportunity scores tie. */
const OPPORTUNITY_SEVERITY: Record<string, number> = {
  C2: 100,
  C3: 95,
  C1: 90,
  A1: 85,
  A2: 70,
  A3: 65,
  A4: 60,
  B1: 55,
  B4: 50,
  B2: 45,
  B3: 40,
  D2: 35,
  D1: 30,
  D3: 25,
};

export function getAnswerPointsV2(answer: SnapshotAnswerValue): number {
  return ANSWER_POINTS[answer];
}

export function assertCompleteAnswersV2(answers: SnapshotAnswersV2): void {
  for (const question of SNAPSHOT_QUESTIONS_V2) {
    if (!answers[question.id]) {
      throw new Error(`Missing answer for ${question.id}`);
    }
  }
}

function citation(
  questionId: string,
  answer: SnapshotAnswerValue,
  text: string,
): SnapshotFindingCitation {
  return {
    questionId,
    answer,
    points: getAnswerPointsV2(answer),
    text,
  };
}

function buildCategoryFinding(
  categoryId: SnapshotCategoryId,
  answers: SnapshotAnswersV2,
): SnapshotCategoryFinding {
  const def = SNAPSHOT_CATEGORIES_V2.find((c) => c.id === categoryId)!;
  const questions = questionsForCategory(categoryId);
  const scored = questions.map((q) => {
    const answer = answers[q.id]!;
    return { question: q, answer, points: getAnswerPointsV2(answer) };
  });

  const points = scored.reduce((sum, row) => sum + row.points, 0);
  const max = questions.length * 3;
  const percent = max > 0 ? Math.round((points / max) * 1000) / 10 : 0;
  const band = classifyPosturePoints(points, max);

  const strengthCandidate = [...scored]
    .filter((row) => row.answer === "yes" || row.answer === "partially")
    .sort((a, b) => b.points - a.points || a.question.id.localeCompare(b.question.id))[0];

  const concernCandidate = [...scored]
    .filter((row) => row.answer === "no" || row.answer === "unsure" || row.answer === "partially")
    .sort((a, b) => {
      const rank = (answer: SnapshotAnswerValue) =>
        answer === "no" ? 0 : answer === "unsure" ? 1 : 2;
      return (
        rank(a.answer) - rank(b.answer) ||
        a.points - b.points ||
        a.question.id.localeCompare(b.question.id)
      );
    })[0];

  // Avoid using the same question as both strength and concern when possible.
  let strength = strengthCandidate ?? null;
  const concern = concernCandidate ?? null;
  if (strength && concern && strength.question.id === concern.question.id) {
    const altStrength = [...scored]
      .filter((row) => row.question.id !== concern.question.id)
      .filter((row) => row.answer === "yes" || row.answer === "partially")
      .sort((a, b) => b.points - a.points)[0];
    strength = altStrength ?? null;
  }

  return {
    id: categoryId,
    name: def.name,
    points,
    max,
    percent,
    band,
    classificationLabel: getPostureLabel(band),
    summary: CATEGORY_BAND_SUMMARIES[categoryId][band],
    strength: strength
      ? citation(
          strength.question.id,
          strength.answer,
          `${strength.question.shortLabel} rated “${labelFor(strength.answer)}.”`,
        )
      : null,
    concern: concern
      ? citation(
          concern.question.id,
          concern.answer,
          `${concern.question.shortLabel} rated “${labelFor(concern.answer)}.”`,
        )
      : null,
    nextStep: NEXT_STEPS[categoryId],
  };
}

function labelFor(answer: SnapshotAnswerValue): string {
  return SNAPSHOT_ANSWER_OPTIONS_V2.find((o) => o.value === answer)?.label ?? answer;
}

function buildOpportunities(answers: SnapshotAnswersV2): SnapshotOpportunity[] {
  const ranked = SNAPSHOT_QUESTIONS_V2.map((q) => {
    const answer = answers[q.id]!;
    return {
      questionId: q.id,
      answer,
      points: getAnswerPointsV2(answer),
      severity: OPPORTUNITY_SEVERITY[q.id] ?? 0,
    };
  })
    .filter((row) => row.points < 3)
    .sort(
      (a, b) =>
        a.points - b.points || b.severity - a.severity || a.questionId.localeCompare(b.questionId),
    )
    .slice(0, 3);

  return ranked.map((row) => {
    const copy = OPPORTUNITY_COPY[row.questionId] ?? {
      title: getSnapshotQuestionV2(row.questionId)?.shortLabel ?? row.questionId,
      why: "This area scored lower based on your Snapshot answers.",
    };
    return {
      questionId: row.questionId,
      title: copy.title,
      why: copy.why,
      answer: row.answer,
      points: row.points,
    };
  });
}

/**
 * Deterministic Snapshot 2.0 findings engine.
 * Safe for client-side anonymous results — no I/O, no randomness.
 */
export function buildSnapshotFindingsV2(
  answers: SnapshotAnswersV2,
  scoredAt: Date = new Date(),
): SnapshotFindingsV2 {
  assertCompleteAnswersV2(answers);

  const categories = SNAPSHOT_CATEGORIES_V2.map((c) =>
    buildCategoryFinding(c.id, answers),
  );

  const overallPoints = categories.reduce((sum, c) => sum + c.points, 0);
  const overallBand = classifyPosturePoints(overallPoints, SNAPSHOT_V2_MAX_SCORE);

  const strongest = [...categories].sort(
    (a, b) => b.percent - a.percent || a.name.localeCompare(b.name),
  )[0]!;

  // Prefer data protection, then security, on percent ties for “highest risk”.
  const riskPriority: Record<SnapshotCategoryId, number> = {
    data_protection: 0,
    security_access: 1,
    devices_infrastructure: 2,
    technology_planning: 3,
  };
  const highestRisk = [...categories].sort(
    (a, b) =>
      a.percent - b.percent ||
      riskPriority[a.id] - riskPriority[b.id] ||
      a.name.localeCompare(b.name),
  )[0]!;

  return {
    catalogVersion: SNAPSHOT_CATALOG_VERSION_V2,
    scoredAt: scoredAt.toISOString(),
    overall: {
      points: overallPoints,
      max: SNAPSHOT_V2_MAX_SCORE,
      band: overallBand,
      classificationLabel: getPostureLabel(overallBand),
      summary: getPostureSummary(overallBand),
    },
    categories,
    keyFindings: {
      strongestCategoryId: strongest.id,
      highestRiskCategoryId: highestRisk.id,
      opportunities: buildOpportunities(answers),
    },
    criticalRisks: buildCriticalRisks(answers),
  };
}
