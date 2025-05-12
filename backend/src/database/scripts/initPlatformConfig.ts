import { PrismaClient } from '@prisma/client';
import { Network } from 'alchemy-sdk';

const prisma = new PrismaClient();

const defaultConfig = {
    name: "default",
    description: "Default platform configuration",
    thresholds: {
        // Web3 thresholds
        mainnetContracts: 40,
        testnetContracts: 100,
        mainnetTVL: 10000, // 10K
        uniqueUsers: 100,
        transactions: 3000,
        web3Languages: 246639660,
        cryptoRepoContributions: 50,

        // Web2 thresholds
        prs: 100,
        contributions: 10634,
        forks: 56488,
        stars: 196965,
        issues: 10,
        totalLinesOfCode: 2466396600,
        accountAge: 4998, //  year in days
        followers: 234058
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
    // Developer worth multipliers
    developerWorthMultipliers: {
        // Web3 multipliers
        web3: {
            experience: {
                mainnetContract: 2000,    // Reduced from 5000
                testnetContract: 500,     // Reduced from 2000
                cryptoRepoContribution: 200 // Reduced from 1000
            },
            skill: {
                solidity: 0.02,           // Reduced from 0.1
                rust: 0.03,              // Reduced from 0.15
                move: 0.025,             // Reduced from 0.12
                cadence: 0.025           // Reduced from 0.12
            },
            influence: {
                tvlMultiplier: 0.0001,    // Reduced from 0.001
                uniqueUser: 20,           // Reduced from 100
                transaction: 2            // Reduced from 10
            }
        },
        // Web2 multipliers
        web2: {
            experience: {
                accountAge: 20,           // Reduced from 100
                pr: 100,                  // Reduced from 500
                contribution: 10          // Reduced from 50
            },
            skill: {
                lineOfCode: 0.00001       // Reduced from 0.05
            },
            influence: {
                star: 20,                 // Reduced from 100
                fork: 40,                 // Reduced from 200
                follower: 10              // Reduced from 50
            }
        }
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
                    developerWorthMultipliers: defaultConfig.developerWorthMultipliers,
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