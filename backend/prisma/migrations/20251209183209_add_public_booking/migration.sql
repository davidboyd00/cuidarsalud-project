/*
  Warnings:

  - You are about to drop the column `time` on the `appointments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cancelToken]` on the table `appointments` will be added. If there are existing duplicate values, this will fail.
  - The required column `cancelToken` was added to the `appointments` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `endTime` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientEmail` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientName` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientRut` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'NO_SHOW';

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_userId_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "time",
ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelToken" TEXT NOT NULL,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "patientEmail" TEXT NOT NULL,
ADD COLUMN     "patientName" TEXT NOT NULL,
ADD COLUMN     "patientPhone" TEXT,
ADD COLUMN     "patientRut" TEXT NOT NULL,
ADD COLUMN     "reminderSentAt" TIMESTAMP(3),
ADD COLUMN     "startTime" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "available_slots" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 60,
    "maxBookings" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "available_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_dates" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "isFullDay" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TEXT,
    "endTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_dates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blocked_dates_date_idx" ON "blocked_dates"("date");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_cancelToken_key" ON "appointments"("cancelToken");

-- CreateIndex
CREATE INDEX "appointments_date_status_idx" ON "appointments"("date", "status");

-- CreateIndex
CREATE INDEX "appointments_patientEmail_idx" ON "appointments"("patientEmail");

-- CreateIndex
CREATE INDEX "appointments_patientRut_idx" ON "appointments"("patientRut");

-- CreateIndex
CREATE INDEX "appointments_cancelToken_idx" ON "appointments"("cancelToken");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "available_slots" ADD CONSTRAINT "available_slots_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
