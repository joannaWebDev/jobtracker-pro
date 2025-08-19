-- DropForeignKey
ALTER TABLE "public"."Job" DROP CONSTRAINT "Job_postedById_fkey";

-- AlterTable
ALTER TABLE "public"."Job" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'local',
ALTER COLUMN "postedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
