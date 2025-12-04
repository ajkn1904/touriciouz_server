-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'GUIDE', 'TOURIST');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "TourCategory" AS ENUM ('HISTORY', 'FOOD', 'NIGHTLIFE', 'SHOPPING', 'ADVENTURE', 'CULTURE', 'ART', 'NATURE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profilePic" TEXT,
    "bio" TEXT,
    "languages" TEXT[],
    "role" "UserRole" NOT NULL DEFAULT 'TOURIST',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
