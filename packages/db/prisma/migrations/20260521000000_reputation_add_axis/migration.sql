-- AlterTable: per-axis scoring and a dedicated business target field.
ALTER TABLE "Reputation" ADD COLUMN "axis" TEXT;
ALTER TABLE "Reputation" ADD COLUMN "businessId" TEXT;

-- CreateIndex
CREATE INDEX "Reputation_axis_idx" ON "Reputation"("axis");
CREATE INDEX "Reputation_businessId_idx" ON "Reputation"("businessId");

-- Composite unique key (target tuple + axis). Postgres 15+ NULLS NOT DISTINCT
-- treats NULLs as equal so partial targets — e.g. (playerId=X, axis=NULL) — are
-- uniquely identified. Enables atomic upsert via `ON CONFLICT` from the
-- reputation engine, eliminating the findFirst→update/create race.
CREATE UNIQUE INDEX "Reputation_target_axis_uniq"
  ON "Reputation" ("playerId", "gangId", "familyId", "area", "businessId", "axis")
  NULLS NOT DISTINCT;
