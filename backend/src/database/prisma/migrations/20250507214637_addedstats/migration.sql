/*
  Warnings:

  - Added the required column `contractStats` to the `OnchainData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionStats` to the `OnchainData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OnchainData" ADD COLUMN     "contractStats" JSONB NOT NULL,
ADD COLUMN     "transactionStats" JSONB NOT NULL;
