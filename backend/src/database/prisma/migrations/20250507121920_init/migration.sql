-- CreateEnum
CREATE TYPE "DataStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastFetchedAt" TIMESTAMP(3),
    "dataStatus" "DataStatus",

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chainType" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GithubData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userInfo" JSONB NOT NULL,
    "repos" JSONB NOT NULL,
    "orgs" JSONB NOT NULL,
    "languagesData" JSONB NOT NULL,
    "status" "DataStatus" NOT NULL DEFAULT 'PENDING',
    "lastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GithubData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractsData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contracts" JSONB NOT NULL,
    "status" "DataStatus" NOT NULL DEFAULT 'PENDING',
    "lastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractsData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnchainData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "history" JSONB NOT NULL,
    "status" "DataStatus" NOT NULL DEFAULT 'PENDING',
    "lastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnchainData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "GithubData_userId_key" ON "GithubData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContractsData_userId_key" ON "ContractsData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OnchainData_userId_key" ON "OnchainData"("userId");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GithubData" ADD CONSTRAINT "GithubData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractsData" ADD CONSTRAINT "ContractsData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnchainData" ADD CONSTRAINT "OnchainData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
