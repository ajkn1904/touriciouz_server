/*
  Warnings:

  - You are about to drop the column `price` on the `Tour` table. All the data in the column will be lost.
  - Added the required column `guideFee` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packagePrice` to the `Tour` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "price",
ADD COLUMN     "guideFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "packagePrice" DOUBLE PRECISION NOT NULL;
