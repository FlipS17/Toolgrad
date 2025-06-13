-- AlterTable
ALTER TABLE "PasswordResetToken" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastPasswordResetRequest" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");
