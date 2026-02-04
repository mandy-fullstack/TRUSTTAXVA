-- CreateTable
CREATE TABLE "PortalAccessToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "approvalId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PortalAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortalAccessToken_tokenHash_key" ON "PortalAccessToken" ("tokenHash");

-- CreateIndex
CREATE INDEX "PortalAccessToken_purpose_idx" ON "PortalAccessToken" ("purpose");

-- CreateIndex
CREATE INDEX "PortalAccessToken_expiresAt_idx" ON "PortalAccessToken" ("expiresAt");

-- CreateIndex
CREATE INDEX "PortalAccessToken_approvalId_idx" ON "PortalAccessToken" ("approvalId");

-- CreateIndex
CREATE INDEX "PortalAccessToken_userId_idx" ON "PortalAccessToken" ("userId");

-- AddForeignKey
ALTER TABLE "PortalAccessToken"
ADD CONSTRAINT "PortalAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalAccessToken"
ADD CONSTRAINT "PortalAccessToken_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE;