-- AlterEnum
-- Add 'dine_in' to FulfilmentType enum
ALTER TYPE "FulfilmentType" ADD VALUE IF NOT EXISTS 'dine_in';
