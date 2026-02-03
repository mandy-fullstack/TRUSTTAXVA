-- Migration: Add notificationSenderName to CompanyProfile
-- Run this SQL directly on your database if Prisma migrate fails

ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "notificationSenderName" TEXT;
