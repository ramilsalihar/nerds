-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'approved',
ADD COLUMN     "className" TEXT,
ADD COLUMN     "graduationYear" INTEGER;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
