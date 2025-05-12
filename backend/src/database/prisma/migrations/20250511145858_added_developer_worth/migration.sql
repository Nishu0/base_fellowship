-- CreateTable
CREATE TABLE "DeveloperWorth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalWorth" DOUBLE PRECISION NOT NULL,
    "breakdown" JSONB NOT NULL,
    "details" JSONB NOT NULL,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperWorth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperWorth_userId_key" ON "DeveloperWorth"("userId");

-- CreateIndex
CREATE INDEX "DeveloperWorth_userId_idx" ON "DeveloperWorth"("userId");

-- AddForeignKey
ALTER TABLE "DeveloperWorth" ADD CONSTRAINT "DeveloperWorth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
