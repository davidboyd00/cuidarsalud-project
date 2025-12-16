-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('LOCAL', 'DOMICILIO');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "appointmentType" "AppointmentType" NOT NULL DEFAULT 'LOCAL';
