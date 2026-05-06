-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "receivePayments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sendPayments" BOOLEAN NOT NULL DEFAULT true;
