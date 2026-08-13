-- CreateTable
CREATE TABLE "RentalAgreement" (
    "id" TEXT NOT NULL,
    "equipmentName" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "advancePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalHoursBilled" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalHourLog" (
    "id" TEXT NOT NULL,
    "rentalAgreementId" TEXT NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL,
    "hoursWorked" DOUBLE PRECISION NOT NULL,
    "certifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalHourLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RentalAgreement" ADD CONSTRAINT "RentalAgreement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalHourLog" ADD CONSTRAINT "RentalHourLog_rentalAgreementId_fkey" FOREIGN KEY ("rentalAgreementId") REFERENCES "RentalAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalHourLog" ADD CONSTRAINT "RentalHourLog_certifiedById_fkey" FOREIGN KEY ("certifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
