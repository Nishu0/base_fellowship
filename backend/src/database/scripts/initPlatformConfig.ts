import { PrismaClient } from '@prisma/client';
import { Network } from 'alchemy-sdk';


const prisma = new PrismaClient();

const defaultConfig = {
    name: "default",
    description: "Default platform configuration",
    thresholds: {
        contractsDeployed: 5,
        transactions: 100,
        internalSwapBridgeTx: 10,
        externalInteractions: 50,
        prs: 20,
        issues: 15,
        stars: 50,
        cryptoRepoContributions: 10,
        accountAge: 365, // in days
        web2Languages: 3,
        web3Languages: 2,
        followers: 100,
        forks: 20
    },
    weights: {
        contractsDeployed: 15,
        transactions: 10,
        internalSwapBridgeTx: 15,
        externalInteractions: 10,
        prs: 10,
        issues: 5,
        stars: 5,
        cryptoRepoContributions: 10,
        accountAge: 5,
        web2Languages: 5,
        web3Languages: 10,
        followers: 5,
        forks: 5
    },
    enabledChains: {
        [Network.ETH_MAINNET]: true,
        [Network.ETH_SEPOLIA]: false,
        [Network.ARB_MAINNET]: true,
        [Network.OPT_MAINNET]: true,
        [Network.BASE_MAINNET]: true,
        [Network.BASE_SEPOLIA]: false,
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
            console.log("Default platform configuration already exists");
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