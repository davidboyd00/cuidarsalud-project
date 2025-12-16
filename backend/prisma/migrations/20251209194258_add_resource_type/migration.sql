-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('ENFERMERA', 'CHOFER');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "resourceType" "ResourceType" NOT NULL DEFAULT 'ENFERMERA';

-- AlterTable
ALTER TABLE "available_slots" ADD COLUMN     "resourceType" "ResourceType" NOT NULL DEFAULT 'ENFERMERA';

-- AlterTable
ALTER TABLE "blocked_dates" ADD COLUMN     "resourceType" "ResourceType";

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "resourceType" "ResourceType" NOT NULL DEFAULT 'ENFERMERA';

-- CreateIndex
CREATE INDEX "appointments_date_resourceType_status_idx" ON "appointments"("date", "resourceType", "status");

-- CreateIndex
CREATE INDEX "blocked_dates_date_resourceType_idx" ON "blocked_dates"("date", "resourceType");
