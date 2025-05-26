-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PhoneVerificationCode" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneVerificationCode_pkey" PRIMARY KEY ("id")
);
