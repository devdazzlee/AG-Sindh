-- CreateEnum
CREATE TYPE "IncomingStatus" AS ENUM ('RECEIVED', 'TRANSFERRED', 'COLLECTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Incoming" (
    "id" TEXT NOT NULL,
    "image" TEXT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "subject" TEXT,
    "description" TEXT,
    "filing" TEXT,
    "qrCode" TEXT NOT NULL,
    "status" "IncomingStatus" NOT NULL DEFAULT 'RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incoming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "incomingId" TEXT NOT NULL,
    "departmentId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Incoming_qrCode_key" ON "Incoming"("qrCode");

-- AddForeignKey
ALTER TABLE "Incoming" ADD CONSTRAINT "Incoming_to_fkey" FOREIGN KEY ("to") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_incomingId_fkey" FOREIGN KEY ("incomingId") REFERENCES "Incoming"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
