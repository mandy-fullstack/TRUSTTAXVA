-- CreateTable
CREATE TABLE "SmsOtpSession" (
  "id" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "purpose" TEXT NOT NULL DEFAULT 'REGISTRATION',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SmsOtpSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmsOtpSession_phone_idx" ON "SmsOtpSession"("phone");

-- CreateIndex
CREATE INDEX "SmsOtpSession_expiresAt_idx" ON "SmsOtpSession"("expiresAt");

