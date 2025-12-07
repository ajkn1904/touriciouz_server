/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `transactionId` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "invoiceUrl" TEXT,
ADD COLUMN     "paymentGatewayData" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'UNPAID',
ALTER COLUMN "transactionId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");
