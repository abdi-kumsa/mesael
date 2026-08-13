-- AlterTable
ALTER TABLE "Voucher" ADD COLUMN     "bankReference" TEXT,
ADD COLUMN     "releasedById" TEXT;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_releasedById_fkey" FOREIGN KEY ("releasedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
