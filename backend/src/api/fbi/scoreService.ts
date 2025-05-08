import { PrismaClient, DataStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Well-known crypto repositories to check for contributions
const CRYPTO_REPOS = [
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
    'curvefi/curve-contract'
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
};

export class ScoreService {
    async calculateUserScore(userId: string): Promise<void> {
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
                    metrics
                },
                update: {
                    totalScore,
                    metrics
                }
            });
        } catch (error) {
            console.error("Error calculating user score:", error);
            throw error;
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
        const totalTxs = externalTxs + internalTxs;

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
            const repos = githubData.repos as any;
            const contributions = repos.repoContributions || {};
            
            let totalCryptoContributions = 0;
            const cryptoRepoContributions: Record<string, number> = {};

            CRYPTO_REPOS.forEach(repo => {
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
            const accountAge = Math.floor((Date.now() - new Date(userInfo.created_at).getTime()) / (1000 * 60 * 60 * 24));
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
} 