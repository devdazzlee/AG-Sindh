-- CreateEnum
CREATE TYPE "OutgoingStatus" AS ENUM ('PENDING_DISPATCH', 'DISPATCHED', 'DELIVERED', 'RETURNED');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_incomingId_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "outgoingId" TEXT,
ALTER COLUMN "incomingId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Outgoing" (
    "id" TEXT NOT NULL,
    "image" TEXT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "subject" TEXT,
    "qrCode" TEXT NOT NULL,
    "status" "OutgoingStatus" NOT NULL DEFAULT 'PENDING_DISPATCH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispatchedDate" TIMESTAMP(3),
    "deliveredDate" TIMESTAMP(3),

    CONSTRAINT "Outgoing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Outgoing_qrCode_key" ON "Outgoing"("qrCode");

-- AddForeignKey
ALTER TABLE "Outgoing" ADD CONSTRAINT "Outgoing_from_fkey" FOREIGN KEY ("from") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_incomingId_fkey" FOREIGN KEY ("incomingId") REFERENCES "Incoming"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_outgoingId_fkey" FOREIGN KEY ("outgoingId") REFERENCES "Outgoing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
