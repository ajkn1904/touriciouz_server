-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Guide" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Earnings" (
    "id" TEXT NOT NULL,
    "guideId" TEXT,
    "adminId" TEXT,
    "bookingId" TEXT NOT NULL,
    "guideEarn" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adminEarn" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Earnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Earnings_bookingId_key" ON "Earnings"("bookingId");

-- AddForeignKey
ALTER TABLE "Earnings" ADD CONSTRAINT "Earnings_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Earnings" ADD CONSTRAINT "Earnings_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Earnings" ADD CONSTRAINT "Earnings_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
