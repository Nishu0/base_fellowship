-- AlterEnum
ALTER TYPE "UserType" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "OrganizationUser" ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'ORGANIZATION';
