ALTER TABLE "PlannerTask" ADD COLUMN "sourceRecommendationId" TEXT;
CREATE UNIQUE INDEX "PlannerTask_clientId_sourceRecommendationId_key" ON "PlannerTask"("clientId", "sourceRecommendationId");
