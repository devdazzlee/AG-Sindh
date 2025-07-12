-- AlterTable
ALTER TABLE "Outgoing" ADD COLUMN     "courierServiceId" TEXT;

-- AddForeignKey
ALTER TABLE "Outgoing" ADD CONSTRAINT "Outgoing_courierServiceId_fkey" FOREIGN KEY ("courierServiceId") REFERENCES "Courier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
