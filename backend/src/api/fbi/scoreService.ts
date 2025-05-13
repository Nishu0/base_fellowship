import { PrismaClient, DataStatus } from '@prisma/client';
import { Logger } from '@/common/utils/logger';

const prisma = new PrismaClient();

// Well-known crypto repositories to check for contributions
const CRYPTO_REPOS = [
    // Existing major protocols
    'ethereum/go-ethereum',
    'ethereum/solidity',
    'bitcoin/bitcoin',
    'solana-labs/solana',
    'cosmos/cosmos-sdk',
    'paritytech/substrate',
    'near/nearcore',
    'aptos-labs/aptos-core',
    'matter-labs/zksync',
    'starkware-libs/starkex-contracts',
    'Uniswap/v3-core',
    'aave/aave-v3-core',
    'compound-finance/compound-protocol',
    'makerdao/dss',
    'curvefi/curve-contract',
    
    // ZK and Privacy
    '0xPARC/zk-bug-tracker',
    '0xPARC/zkrepl',
    '0xPolygonZero/plonky2',
    'AztecProtocol/Setup',
    'AztecProtocol/barretenberg',
    'ConsenSys/gnark',
    'HorizenLabs/poseidon2',
    'Zokrates/ZoKrates',
    'microsoft/Nova',
    'noir-lang/noir',
    'privacy-scaling-explorations/halo2curves',
    'privacy-scaling-explorations/halo2wrong',
    'privacy-scaling-explorations/sonobe',
    'privacy-scaling-explorations/zk-kit',
    'scipr-lab/libsnark',
    'semaphore-protocol/semaphore',
    'zcash/halo2',
    'zcash/zcash',
    'zkcrypto/bellman',
    'zkcrypto/ff',
    'zkcrypto/group',
    'zkcrypto/pairing',
    'zkp2p/zk-p2p',
    
    // Development Tools and Libraries
    'OpenZeppelin/openzeppelin-contracts',
    'OpenZeppelin/openzeppelin-contracts-upgradeable',
    'Vectorized/solady',
    'foundry-rs/foundry',
    'ethereum/web3.py',
    'ethereum/solc-js',
    'ethereum/eth-tester',
    'ethereum/c-kzg-4844',
    'ethereumjs/ethereumjs-abi',
    'ethjs/ethjs',
    'rainbow-me/rainbowkit',
    'thirdweb-dev/contracts',
    'thirdweb-dev/js',
    'transmissions11/solmate',
    
    // Infrastructure and Clients
    'Consensys/teku',
    'hyperledger/besu',
    'hyperledger/web3j',
    'ipfs/ipfs',
    'ipfs/kubo',
    'libp2p/go-libp2p',
    'libp2p/rust-libp2p',
    'prysmaticlabs/prysm',
    
    // Security and Analysis Tools
    'crytic/echidna',
    'crytic/slither',
    'cgewecke/hardhat-gas-reporter',
    'ItsNickBarry/hardhat-contract-sizer',
    'protofire/solhint',
    'sc-forks/solidity-coverage',
    
    // Educational Resources
    'CryptozombiesHQ/cryptozombie-lessons',
    'Cyfrin/foundry-devops',
    'Cyfrin/foundry-full-course-f23',
    'Cyfrin/security-and-auditing-full-course-s23',
    'Dapp-Learning-DAO/Dapp-Learning',
    'solidity-by-example/solidity-by-example.github.io',
    
    // Cryptographic Libraries and Tools
    'arkworks-rs/algebra',
    'arkworks-rs/crypto-primitives',
    'arkworks-rs/groth16',
    'arkworks-rs/marlin',
    'arkworks-rs/snark',
    'dalek-cryptography/bulletproofs',
    'krzyzanowskim/CryptoSwift',
    'lambdaclass/lambdaworks',
    
    // Other Important Tools and Protocols
    'Ankr-network/ankr.js',
    'ApeWorX/ape',
    'Hats-Protocol/hats-protocol',
    'Tenderly/tenderly-cli',
    'TrueBlocks/trueblocks-core',
    'blockchain-etl/ethereum-etl',
    'bluealloy/revm',
    'eth-infinitism/account-abstraction',
    'iden3/circom',
    'iden3/snarkjs',
    'merkletreejs/merkletreejs',
    'paradigmxyz/cryo',
    'pcaversaccio/snekmate',
    'poap-xyz/poap.js',
    'rust-ethereum/evm',
    'scaffold-eth/scaffold-eth-2',
    'starkware-libs/cairo-lang'
];

// Default thresholds if not present in platform config
const DEFAULT_THRESHOLDS = {
    // Web3 thresholds
    mainnetContracts: 5,
    testnetContracts: 3,
    mainnetTVL: 1000000, // 1M
    uniqueUsers: 100,
    transactions: 100,
    web3Languages: 10000,
    cryptoRepoContributions: 50,
    hackathonWins: 10,

    // Web2 thresholds
    prs: 20,
    contributions: 1000,
    forks: 50,
    stars: 100,
    issues: 30,
    totalLinesOfCode: 50000,
    accountAge: 365, // 1 year in days
    followers: 100
};

// Default weights if not present in platform config
const DEFAULT_WEIGHTS = {
    // Web3 weights
    mainnetContracts: 12,
    testnetContracts: 8,
    mainnetTVL: 5,
    uniqueUsers: 5,
    transactions: 20,
    web3Languages: 20,
    cryptoRepoContributions: 15,
    hackathonWins: 15,

    // Web2 weights
    prs: 10,
    contributions: 10,
    forks: 10,
    stars: 10,
    issues: 10,
    totalLinesOfCode: 20,
    accountAge: 10,
    followers: 10
};

export class ScoreService {
    async calculateUserScore(userId: string): Promise<void> {
        Logger.info('ScoreService', 'Starting calculateUserScore', { userId });
        try {
            // Get user data
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    githubData: true,
                    contractsData: true,
                    onchainData: true
                }
            });

            if (!user) throw new Error("User not found");

            // Get platform configuration
            const platformConfig = await prisma.platformConfig.findUnique({
                where: { name: "default" }
            });

            // Use thresholds and weights from platform config or defaults
            const thresholds = platformConfig?.thresholds as Record<string, number> || {};
            const weights = platformConfig?.weights as Record<string, number> || {};
            const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
            const finalWeights = { ...DEFAULT_WEIGHTS, ...weights };

            // Initialize metrics object
            const metrics: Record<string, any> = {
                web3: {},
                web2: {}
            };

            // Calculate Web3 Score
            const web3Score = await this.calculateWeb3Score(user, metrics, finalThresholds, finalWeights);
            
            // Calculate Web2 Score
            const web2Score = await this.calculateWeb2Score(user, metrics, finalThresholds, finalWeights);

            // Calculate total score (50% Web3 + 50% Web2)
            const totalScore = (web3Score + web2Score) / 2;

            // Update or create user score
            await prisma.userScore.upsert({
                where: { userId },
                create: {
                    userId,
                    totalScore,
                    metrics,
                    status: DataStatus.COMPLETED,
                    lastCalculatedAt: new Date()
                },
                update: {
                    totalScore,
                    metrics,
                    status: DataStatus.COMPLETED,
                    lastCalculatedAt: new Date()
                }
            });

            Logger.info('ScoreService', 'Successfully calculated user score', { userId });
        } catch (error) {
            Logger.error('ScoreService', 'Error calculating user score', error);
            // Update status to failed if any error occurs
            await prisma.userScore.upsert({
                where: { userId },
                create: {
                    userId,
                    totalScore: 0,
                    metrics: {},
                    status: DataStatus.FAILED,
                    lastCalculatedAt: new Date()
                },
                update: {
                    status: DataStatus.FAILED,
                    lastCalculatedAt: new Date()
                }
            });
            throw error;
        }
    }

    private async getCryptoRepos(): Promise<string[]> {
        try {
            const platformConfig = await prisma.platformConfig.findUnique({
                where: { name: "default" }
            });
            
            if (!platformConfig?.cryptoRepos) {
                Logger.warn('ScoreService', 'No crypto repos found in platform config, using empty list');
                return [];
            }

            const cryptoReposData = platformConfig.cryptoRepos as { repositories: string[] };
            Logger.info('ScoreService', 'Crypto repos found in platform config', { cryptoReposData: cryptoReposData.repositories.length });
            return cryptoReposData.repositories || [];
        } catch (error) {
            Logger.error('ScoreService', 'Error fetching crypto repos from database', error);
            return [];
        }
    }

    private async calculateWeb3Score(
        user: any, 
        metrics: Record<string, any>, 
        thresholds: Record<string, number>,
        weights: Record<string, number>
    ): Promise<number> {
        const web3Metrics = metrics.web3;
        let totalWeb3Score = 0;

        // Get hackathon data from onchainData
        const onchainData = await prisma.onchainData.findUnique({
            where: { userId: user.id }
        });

        const hackathonData = onchainData?.hackathonData as any;
        const totalWins = hackathonData?.totalWins || 0;

        // Calculate hackathon score
        const hackathonScore = Math.min(totalWins / thresholds.hackathonWins, 1) * weights.hackathonWins;
        web3Metrics.hackathonWins = {
            value: totalWins,
            threshold: thresholds.hackathonWins,
            weight: weights.hackathonWins,
            score: hackathonScore,
            details: hackathonData
        };

        // 1. Contracts Deployed (20 points total)
        const contractStats = user.onchainData?.contractStats as any;
        const mainnetContracts = contractStats?.total?.mainnet || 0;
        const testnetContracts = contractStats?.total?.testnet || 0;
        
        // Mainnet contracts
        const mainnetContractScore = Math.min(mainnetContracts / thresholds.mainnetContracts, 1) * weights.mainnetContracts;
        web3Metrics.mainnetContracts = {
            value: mainnetContracts,
            threshold: thresholds.mainnetContracts,
            weight: weights.mainnetContracts,
            score: mainnetContractScore
        };

        // Testnet contracts
        const testnetContractScore = Math.min(testnetContracts / thresholds.testnetContracts, 1) * weights.testnetContracts;
        web3Metrics.testnetContracts = {
            value: testnetContracts,
            threshold: thresholds.testnetContracts,
            weight: weights.testnetContracts,
            score: testnetContractScore
        };

        // 2. Contract Stats (10 points total)
        const contracts = user.contractsData?.contracts as any;
        let totalTVL = 0;
        let uniqueUsers = new Set();

        // Calculate TVL and unique users across all contracts
        Object.values(contracts || {}).forEach((chainContracts: any) => {
            chainContracts.forEach((contract: any) => {
                    totalTVL += Number(contract.tvl || 0);
                    uniqueUsers.add(contract.uniqueUsers);
            });
        });

        // Mainnet TVL
        const tvlScore = Math.min(totalTVL / thresholds.mainnetTVL, 1) * weights.mainnetTVL;
        web3Metrics.mainnetTVL = {
            value: totalTVL,
            threshold: thresholds.mainnetTVL,
            weight: weights.mainnetTVL,
            score: tvlScore
        };

        // Unique Users
        const uniqueUsersScore = Math.min(uniqueUsers.size / thresholds.uniqueUsers, 1) * weights.uniqueUsers;
        web3Metrics.uniqueUsers = {
            value: uniqueUsers.size,
            threshold: thresholds.uniqueUsers,
            weight: weights.uniqueUsers,
            score: uniqueUsersScore
        };

        // 3. Transactions
        const transactionStats = user.onchainData?.transactionStats as any;
        const mainnetStats = transactionStats?.total?.mainnet || {};
        
        const externalTxs = mainnetStats.external || 0;
        const internalTxs = mainnetStats.internal || 0;
        const totalTxs = mainnetStats.total || 0;

        const transactionScore = Math.min(totalTxs / thresholds.transactions, 1) * weights.transactions;
        web3Metrics.transactions = {
            value: totalTxs,
            threshold: thresholds.transactions,
            weight: weights.transactions,
            score: transactionScore,
            breakdown: {
                external: externalTxs,
                internal: internalTxs
            }
        };

        // 4. Web3 Languages
        const githubData = user.githubData;
        if (githubData) {
            const repos = githubData.repos as any;
            const languages = repos.totalLanguageLinesOfCode || {};
            
            const web3Languages = {
                Rust: languages.Rust || 0,
                Solidity: languages.Solidity || 0,
                Move: languages.Move || 0,
                Cadence: languages.Cadence || 0
            };

            const totalWeb3LOC = Object.values(web3Languages).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
            const web3LangScore = Math.min(totalWeb3LOC / thresholds.web3Languages, 1) * weights.web3Languages;
            web3Metrics.web3Languages = {
                value: totalWeb3LOC,
                threshold: thresholds.web3Languages,
                weight: weights.web3Languages,
                score: web3LangScore,
                breakdown: web3Languages
            };
        }

        // 5. Crypto Repo Contributions
        if (githubData) {
            const repos = githubData.languagesData as any;
            const contributions = repos.repoContributions || {};
            
            let totalCryptoContributions = 0;
            const cryptoRepoContributions: Record<string, number> = {};

            const cryptoRepos = await this.getCryptoRepos();
            
            cryptoRepos.forEach(repo => {
                const contribution = contributions[repo] || 0;
                if (contribution > 0) {
                    cryptoRepoContributions[repo] = contribution;
                    totalCryptoContributions += contribution;
                }
            });

            const cryptoContribScore = Math.min(totalCryptoContributions / thresholds.cryptoRepoContributions, 1) * weights.cryptoRepoContributions;
            web3Metrics.cryptoRepoContributions = {
                value: totalCryptoContributions,
                threshold: thresholds.cryptoRepoContributions,
                weight: weights.cryptoRepoContributions,
                score: cryptoContribScore,
                breakdown: cryptoRepoContributions
            };
        }

        // Calculate total Web3 score
        totalWeb3Score = Object.values(web3Metrics).reduce((acc: number, metric: any) => acc + (metric.score || 0), 0);
        web3Metrics.total = totalWeb3Score;

        return totalWeb3Score;
    }

    private async calculateWeb2Score(
        user: any, 
        metrics: Record<string, any>, 
        thresholds: Record<string, number>,
        weights: Record<string, number>
    ): Promise<number> {
        const web2Metrics = metrics.web2;
        let totalWeb2Score = 0;

        const githubData = user.githubData;
        if (githubData) {
            const userInfo = githubData.userInfo as any;
            const repos = githubData.repos as any;

            // 1. Total PRs
            const totalPRs = githubData.languagesData.totalPRs || 0;
            const prScore = Math.min(totalPRs / thresholds.prs, 1) * weights.prs;
            web2Metrics.prs = {
                value: totalPRs,
                threshold: thresholds.prs,
                weight: weights.prs,
                score: prScore
            };

            // 2. Total Contributions
            const totalContributions = githubData.languagesData.totalContributions || 0;
            const contributionScore = Math.min(totalContributions / thresholds.contributions, 1) * weights.contributions;
            web2Metrics.contributions = {
                value: totalContributions,
                threshold: thresholds.contributions,
                weight: weights.contributions,
                score: contributionScore
            };

            // 3. Total Forks
            const totalForks = repos.totalForks || 0;
            const forksScore = Math.min(totalForks / thresholds.forks, 1) * weights.forks;
            web2Metrics.forks = {
                value: totalForks,
                threshold: thresholds.forks,
                weight: weights.forks,
                score: forksScore
            };

            // 4. Total Stars
            const totalStars = repos.totalStars || 0;
            const starsScore = Math.min(totalStars / thresholds.stars, 1) * weights.stars;
            web2Metrics.stars = {
                value: totalStars,
                threshold: thresholds.stars,
                weight: weights.stars,
                score: starsScore
            };

            // 5. Total Issues
            const totalIssues = githubData.languagesData.totalIssues || 0;
            const issuesScore = Math.min(totalIssues / thresholds.issues, 1) * weights.issues;
            web2Metrics.issues = {
                value: totalIssues,
                threshold: thresholds.issues,
                weight: weights.issues,
                score: issuesScore
            };

            // 6. Total Lines of Code
            const languages = repos.totalLanguageLinesOfCode || {};
            const totalLOC = Object.values(languages).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
            const locScore = Math.min(totalLOC / thresholds.totalLinesOfCode, 1) * weights.totalLinesOfCode;
            web2Metrics.totalLinesOfCode = {
                value: totalLOC,
                threshold: thresholds.totalLinesOfCode,
                weight: weights.totalLinesOfCode,
                score: locScore,
                breakdown: languages
            };

            // 7. Account Age
            const accountAge = userInfo.accountAge
            const accountAgeScore = Math.min(accountAge / thresholds.accountAge, 1) * weights.accountAge;
            web2Metrics.accountAge = {
                value: accountAge,
                threshold: thresholds.accountAge,
                weight: weights.accountAge,
                score: accountAgeScore
            };

            // 8. Followers
            const followers = userInfo.followers || 0;
            const followersScore = Math.min(followers / thresholds.followers, 1) * weights.followers;
            web2Metrics.followers = {
                value: followers,
                threshold: thresholds.followers,
                weight: weights.followers,
                score: followersScore
            };
        }

        // Calculate total Web2 score
        totalWeb2Score = Object.values(web2Metrics).reduce((acc: number, metric: any) => acc + (metric.score || 0), 0);
        web2Metrics.total = totalWeb2Score;

        return totalWeb2Score;
    }

    async calculateDeveloperWorth(userId: string): Promise<void> {
        Logger.info('ScoreService', 'Starting calculateDeveloperWorth', { userId });
        try {
            // Get user data
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    githubData: true,
                    contractsData: true,
                    onchainData: true
                }
            });

            if (!user) throw new Error("User not found");

            // Initialize worth components
            const worth = {
                totalWorth: 0,
                breakdown: {
                    web3Worth: 0,
                    web2Worth: 0
                },
                details: {
                    experienceValue: 0,
                    influenceValue: 0,
                    skillValue: 0
                }
            };

            // Calculate Web3 Worth (60% of total)
            const web3Worth = await this.calculateWeb3DeveloperWorth(user);
            worth.breakdown.web3Worth = web3Worth.totalWorth;
            worth.details.experienceValue += web3Worth.web3Metrics.experienceValue;
            worth.details.skillValue += web3Worth.web3Metrics.skillValue;
            worth.details.influenceValue += web3Worth.web3Metrics.influenceValue;

            // Calculate Web2 Worth (40% of total)
            const web2Worth = await this.calculateWeb2DeveloperWorth(user);
            worth.breakdown.web2Worth = web2Worth.totalWorth;
            worth.details.experienceValue += web2Worth.web2Metrics.experienceValue;
            worth.details.skillValue += web2Worth.web2Metrics.skillValue;
            worth.details.influenceValue += web2Worth.web2Metrics.influenceValue;

            // Calculate total worth
            worth.totalWorth = worth.breakdown.web3Worth + worth.breakdown.web2Worth;

            // Update or create developer worth in database
            await prisma.developerWorth.upsert({
                where: { userId },
                create: {
                    userId,
                    totalWorth: worth.totalWorth,
                    breakdown: worth.breakdown,
                    details: worth.details,
                    lastCalculatedAt: new Date()
                },
                update: {
                    totalWorth: worth.totalWorth,
                    breakdown: worth.breakdown,
                    details: worth.details,
                    lastCalculatedAt: new Date()
                }
            });

            Logger.info('ScoreService', 'Successfully calculated developer worth', { userId });
        } catch (error) {
            Logger.error('ScoreService', 'Error calculating developer worth', error);
            throw error;
        }
    }

    private async calculateWeb3DeveloperWorth(user: any): Promise<{totalWorth: number, web3Metrics: any}> {
        let totalWorth = 0;
        const web3Metrics = {
            experienceValue: 0,
            skillValue: 0,
            influenceValue: 0
        };

        // Get platform configuration
        const platformConfig = await prisma.platformConfig.findUnique({
            where: { name: "default" }
        });

        let multipliersObj: any = platformConfig?.developerWorthMultipliers;
        if (typeof multipliersObj === 'string') {
            try {
                multipliersObj = JSON.parse(multipliersObj);
            } catch (e) {
                Logger.error('ScoreService', 'Failed to parse developerWorthMultipliers as JSON', e);
                multipliersObj = {};
            }
        }
        const multipliers = multipliersObj?.web3 || {
            experience: {
                mainnetContract: 2000,
                testnetContract: 500,
                cryptoRepoContribution: 200
            },
            skill: {
                solidity: 0.02,
                rust: 0.03,
                move: 0.025,
                cadence: 0.025
            },
            influence: {
                tvlMultiplier: 0.0001,
                uniqueUser: 20,
                transaction: 2
            }
        };

        // 1. Experience Value (30% of Web3 worth)
        const contractStats = user.onchainData?.contractStats as any;
        const mainnetContracts = contractStats?.total?.mainnet || 0;
        const testnetContracts = contractStats?.total?.testnet || 0;
        
        web3Metrics.experienceValue = (mainnetContracts * multipliers.experience.mainnetContract) + 
                                    (testnetContracts * multipliers.experience.testnetContract);

        // Add crypto repo contributions
        const githubData = user.githubData;
        if (githubData) {
            const repos = githubData.repos as any;
            const contributions = repos.repoContributions || {};
            
            let totalCryptoContributions = 0;
            const cryptoRepos = await this.getCryptoRepos();
            
            cryptoRepos.forEach(repo => {
                totalCryptoContributions += contributions[repo] || 0;
            });
            web3Metrics.experienceValue += totalCryptoContributions * multipliers.experience.cryptoRepoContribution;
        }

        // 2. Skill Value (40% of Web3 worth)
        if (githubData) {
            const repos = githubData.repos as any;
            const languages = repos.totalLanguageLinesOfCode || {};
            
            const web3Languages = {
                Solidity: languages.Solidity || 0,
                Rust: languages.Rust || 0,
                Move: languages.Move || 0,
                Cadence: languages.Cadence || 0
            };

            web3Metrics.skillValue = (
                (web3Languages.Solidity * multipliers.skill.solidity) +
                (web3Languages.Rust * multipliers.skill.rust) +
                (web3Languages.Move * multipliers.skill.move) +
                (web3Languages.Cadence * multipliers.skill.cadence)
            );
        }

        // 3. Influence Value (30% of Web3 worth)
        const contracts = user.contractsData?.contracts as any;
        let totalTVL = 0;
        let uniqueUsers = new Set();

        Object.values(contracts || {}).forEach((chainContracts: any) => {
            chainContracts.forEach((contract: any) => {
                totalTVL += Number(contract.tvl || 0);
                uniqueUsers.add(contract.uniqueUsers);
            });
        });

        const transactionStats = user.onchainData?.transactionStats as any;
        const mainnetStats = transactionStats?.total?.mainnet || {};
        const totalTxs = (mainnetStats.external || 0) + (mainnetStats.internal || 0);

        web3Metrics.influenceValue = (totalTVL * multipliers.influence.tvlMultiplier) + 
                                   (uniqueUsers.size * multipliers.influence.uniqueUser) + 
                                   (totalTxs * multipliers.influence.transaction);

        // Calculate total Web3 worth
        totalWorth = web3Metrics.experienceValue + web3Metrics.skillValue + web3Metrics.influenceValue;

        return {totalWorth, web3Metrics};
    }

    private async calculateWeb2DeveloperWorth(user: any): Promise<{totalWorth: number, web2Metrics: any}> {
        let totalWorth = 0;
        const web2Metrics = {
            experienceValue: 0,
            skillValue: 0,
            influenceValue: 0
        };

        // Get platform configuration
        const platformConfig = await prisma.platformConfig.findUnique({
            where: { name: "default" }
        });

        let multipliersObj: any = platformConfig?.developerWorthMultipliers;
        if (typeof multipliersObj === 'string') {
            try {
                multipliersObj = JSON.parse(multipliersObj);
            } catch (e) {
                Logger.error('ScoreService', 'Failed to parse developerWorthMultipliers as JSON', e);
                multipliersObj = {};
            }
        }
        const multipliers = multipliersObj?.web2 || {
            experience: {
                accountAge: 20,
                pr: 100,
                contribution: 10
            },
            skill: {
                lineOfCode: 0.00001
            },
            influence: {
                star: 20,
                fork: 40,
                follower: 10
            }
        };

        const githubData = user.githubData;
        if (githubData) {
            const userInfo = githubData.userInfo as any;
            const repos = githubData.repos as any;

            // 1. Experience Value (30% of Web2 worth)
            const accountAge = userInfo.accountAge || 0;
            const totalPRs = githubData.languagesData.totalPRs || 0;
            const totalContributions = githubData.languagesData.totalContributions || 0;

            web2Metrics.experienceValue = (accountAge * multipliers.experience.accountAge) + 
                                        (totalPRs * multipliers.experience.pr) + 
                                        (totalContributions * multipliers.experience.contribution);

            // 2. Skill Value (40% of Web2 worth)
            const languages = repos.totalLanguageLinesOfCode || {};
            const totalLOC = Object.values(languages).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
            
            web2Metrics.skillValue = totalLOC * multipliers.skill.lineOfCode;

            // 3. Influence Value (30% of Web2 worth)
            const totalStars = repos.totalStars || 0;
            const totalForks = repos.totalForks || 0;
            const followers = userInfo.followers || 0;

            web2Metrics.influenceValue = (totalStars * multipliers.influence.star) + 
                                       (totalForks * multipliers.influence.fork) + 
                                       (followers * multipliers.influence.follower);
        }

        // Calculate total Web2 worth
        totalWorth = web2Metrics.experienceValue + web2Metrics.skillValue + web2Metrics.influenceValue;

        return {totalWorth, web2Metrics};
    }
} 


