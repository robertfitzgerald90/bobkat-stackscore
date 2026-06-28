/**
 * Merge duplicate active recommendations per client + dedupe key.
 * Keeps the oldest createdAt row, re-links projects, merges trigger history, deletes duplicates.
 *
 * Usage:
 *   npm run merge:recommendations
 *   npm run merge:recommendations -- --dry-run
 */
import "dotenv/config";
import type { RecommendationStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

const dryRun = process.argv.includes("--dry-run");

const ACTIVE_STATUSES: RecommendationStatus[] = [
  "open",
  "accepted",
  "in_progress",
  "deferred",
];

type DuplicateGroup = {
  clientId: string;
  dedupeKey: string;
  count: number;
};

async function main() {
  const groups = await prisma.$queryRaw<DuplicateGroup[]>`
    SELECT "clientId", "dedupeKey", COUNT(*)::int AS count
    FROM "AssessmentRecommendation"
    WHERE status IN ('open', 'accepted', 'in_progress', 'deferred')
    GROUP BY "clientId", "dedupeKey"
    HAVING COUNT(*) > 1
  `;

  if (groups.length === 0) {
    console.log("No duplicate active recommendations found.");
    return;
  }

  console.log(`Found ${groups.length} duplicate group(s).${dryRun ? " (dry run)" : ""}`);

  let merged = 0;

  for (const group of groups) {
    const duplicates = await prisma.assessmentRecommendation.findMany({
      where: {
        clientId: group.clientId,
        dedupeKey: group.dedupeKey,
        status: { in: ACTIVE_STATUSES },
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: { project: true, triggers: true },
    });

    const [keeper, ...extras] = duplicates;
    if (!keeper || extras.length === 0) continue;

    console.log(
      `  ${group.clientId} / ${group.dedupeKey}: keep ${keeper.id}, merge ${extras.length} duplicate(s)`,
    );

    if (dryRun) {
      merged += extras.length;
      continue;
    }

    await prisma.$transaction(async (tx) => {
      let keeperHasProject = Boolean(keeper.project);

      for (const duplicate of extras) {
        if (duplicate.project && !keeperHasProject) {
          await tx.project.update({
            where: { id: duplicate.project.id },
            data: { recommendationId: keeper.id },
          });
          keeperHasProject = true;
        }

        for (const trigger of duplicate.triggers) {
          await tx.recommendationAssessmentTrigger.upsert({
            where: {
              recommendationId_assessmentId: {
                recommendationId: keeper.id,
                assessmentId: trigger.assessmentId,
              },
            },
            create: {
              recommendationId: keeper.id,
              assessmentId: trigger.assessmentId,
              triggeredAt: trigger.triggeredAt,
              triggerReason: trigger.triggerReason,
            },
            update: {
              triggeredAt: trigger.triggeredAt,
              triggerReason: trigger.triggerReason,
            },
          });
        }

        await tx.assessmentRecommendation.delete({ where: { id: duplicate.id } });
      }

      const latest = [...duplicates].sort(
        (a, b) => b.lastTriggeredAt.getTime() - a.lastTriggeredAt.getTime(),
      )[0]!;

      await tx.assessmentRecommendation.update({
        where: { id: keeper.id },
        data: {
          latestAssessmentId: latest.latestAssessmentId,
          lastTriggeredAt: latest.lastTriggeredAt,
          latestTriggerReason: latest.latestTriggerReason,
          priority: latest.priority,
        },
      });
    });

    merged += extras.length;
  }

  console.log(`Merged ${merged} duplicate recommendation row(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
