-- AlterTable
ALTER TABLE "UserScore" ADD COLUMN     "lastCalculatedAt" TIMESTAMP(3),
ADD COLUMN     "status" "DataStatus" NOT NULL DEFAULT 'PENDING';
