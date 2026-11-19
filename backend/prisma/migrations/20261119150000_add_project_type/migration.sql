-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('startup', 'outsource');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "type" "ProjectType" NOT NULL DEFAULT 'startup';
