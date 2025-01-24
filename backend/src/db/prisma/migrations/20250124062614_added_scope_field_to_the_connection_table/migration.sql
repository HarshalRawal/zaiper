-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "scopes" TEXT[],
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "TriggerDefinition" ALTER COLUMN "connectionRequired" SET DEFAULT true;

-- CreateIndex
CREATE INDEX "Connection_expiresAt_idx" ON "Connection"("expiresAt");
