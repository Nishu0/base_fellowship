import { PrismaClient } from '@prisma/client';
import { Network } from 'alchemy-sdk';

const prisma = new PrismaClient();

const defaultConfig = {
    name: "default",
    description: "Default platform configuration",
    thresholds: {
        // Web3 thresholds
        mainnetContracts: 5,
        testnetContracts: 3,
        mainnetTVL: 1000000, // 1M
        uniqueUsers: 100,
        transactions: 100,
        web3Languages: 10000,
        cryptoRepoContributions: 50,

        // Web2 thresholds
        prs: 20,
        contributions: 1000,
        forks: 50,
        stars: 100,
        issues: 30,
        totalLinesOfCode: 50000,
        accountAge: 365, // 1 year in days
        followers: 100
    },
    weights: {
        // Web3 weights
        mainnetContracts: 12,
        testnetContracts: 8,
        mainnetTVL: 5,
        uniqueUsers: 5,
        transactions: 20,
        web3Languages: 20,
        cryptoRepoContributions: 30,

        // Web2 weights
        prs: 10,
        contributions: 10,
        forks: 10,
        stars: 10,
        issues: 10,
        totalLinesOfCode: 20,
        accountAge: 10,
        followers: 10
    },
    enabledChains: {
        [Network.ETH_MAINNET]: true,
        [Network.ETH_SEPOLIA]: true,
        [Network.ARB_MAINNET]: false,
        [Network.OPT_MAINNET]: false,
        [Network.BASE_MAINNET]: true,
        [Network.BASE_SEPOLIA]: true,
        [Network.MATIC_MAINNET]: false,
    }
};

async function initPlatformConfig() {
    try {
        // Check if default config exists
        const existingConfig = await prisma.platformConfig.findUnique({
            where: { name: defaultConfig.name }
        });

        if (!existingConfig) {
            // Create default config
            await prisma.platformConfig.create({
                data: defaultConfig
            });
            console.log("Default platform configuration created successfully");
        } else {
            // Update existing config with new values
            await prisma.platformConfig.update({
                where: { name: defaultConfig.name },
                data: {
                    thresholds: defaultConfig.thresholds,
                    weights: defaultConfig.weights,
                    enabledChains: defaultConfig.enabledChains
                }
            });
            console.log("Default platform configuration updated successfully");
        }
    } catch (error) {
        console.error("Error initializing platform configuration:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the initialization
initPlatformConfig(); 