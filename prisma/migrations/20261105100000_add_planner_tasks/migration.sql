CREATE TABLE "PlannerTask" (
 "id" TEXT NOT NULL,
 "clientId" TEXT NOT NULL,
 "title" TEXT NOT NULL,
 "description" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "pillarCode" TEXT,
 "horizon" TEXT NOT NULL DEFAULT 'now',
 "status" TEXT NOT NULL DEFAULT 'planned',
 "dueDate" TEXT,
 "steps" TEXT NOT NULL DEFAULT '',
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "PlannerTask_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "PlannerTask_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "PlannerTask_horizon_check" CHECK ("horizon" IN ('now', 'next', 'later')),
 CONSTRAINT "PlannerTask_status_check" CHECK ("status" IN ('planned', 'in_progress', 'blocked', 'complete'))
);
CREATE INDEX "PlannerTask_clientId_createdAt_idx" ON "PlannerTask"("clientId", "createdAt");
