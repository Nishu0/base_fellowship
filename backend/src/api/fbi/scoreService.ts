import { PrismaClient, DataStatus } from '@prisma/client';

const prisma = new PrismaClient();

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

            if (!platformConfig) throw new Error("Platform configuration not found");

            const thresholds = platformConfig.thresholds as Record<string, number>;
            const weights = platformConfig.weights as Record<string, number>;

            // Initialize metrics object
            const metrics: Record<string, any> = {};

            // Calculate contract deployment score
            const contractStats = user.onchainData?.contractStats as any;
            const totalContracts = contractStats?.total?.total || 0;
            const contractScore = Math.min(totalContracts / thresholds.contractsDeployed, 1) * weights.contractsDeployed;
            metrics.contractsDeployed = {
                value: totalContracts,
                threshold: thresholds.contractsDeployed,
                weight: weights.contractsDeployed,
                score: contractScore
            };

            // Calculate transaction score
            const transactionStats = user.onchainData?.transactionStats as any;
            const totalTransactions = transactionStats?.total?.mainnet?.total || 0;
            const transactionScore = Math.min(totalTransactions / thresholds.transactions, 1) * weights.transactions;
            metrics.transactions = {
                value: totalTransactions,
                threshold: thresholds.transactions,
                weight: weights.transactions,
                score: transactionScore
            };

            // Calculate GitHub metrics
            const githubData = user.githubData;
            if (githubData) {
                const userInfo = githubData.userInfo as any;
                const repos = githubData.repos as any;

                // PRs score
                const totalPRs = userInfo.pull_requests || 0;
                const prScore = Math.min(totalPRs / thresholds.prs, 1) * weights.prs;
                metrics.prs = {
                    value: totalPRs,
                    threshold: thresholds.prs,
                    weight: weights.prs,
                    score: prScore
                };

                // Issues score
                const totalIssues = userInfo.open_issues || 0;
                const issuesScore = Math.min(totalIssues / thresholds.issues, 1) * weights.issues;
                metrics.issues = {
                    value: totalIssues,
                    threshold: thresholds.issues,
                    weight: weights.issues,
                    score: issuesScore
                };

                // Stars score
                const totalStars = repos.totalStars || 0;
                const starsScore = Math.min(totalStars / thresholds.stars, 1) * weights.stars;
                metrics.stars = {
                    value: totalStars,
                    threshold: thresholds.stars,
                    weight: weights.stars,
                    score: starsScore
                };

                // Crypto repo contributions score
                const cryptoContributions = Object.entries(repos.repoContributions || {})
                    .filter(([repo]) => repo.toLowerCase().includes('crypto') || repo.toLowerCase().includes('blockchain'))
                    .reduce((acc, [_, count]) => acc + (count as number), 0);
                const cryptoContribScore = Math.min(cryptoContributions / thresholds.cryptoRepoContributions, 1) * weights.cryptoRepoContributions;
                metrics.cryptoRepoContributions = {
                    value: cryptoContributions,
                    threshold: thresholds.cryptoRepoContributions,
                    weight: weights.cryptoRepoContributions,
                    score: cryptoContribScore
                };

                // Account age score
                const accountAge = Math.floor((Date.now() - new Date(userInfo.created_at).getTime()) / (1000 * 60 * 60 * 24));
                const accountAgeScore = Math.min(accountAge / thresholds.accountAge, 1) * weights.accountAge;
                metrics.accountAge = {
                    value: accountAge,
                    threshold: thresholds.accountAge,
                    weight: weights.accountAge,
                    score: accountAgeScore
                };

                // Web2 languages score
                const web2Languages = Object.keys(repos.totalLanguageLinesOfCode || {})
                    .filter(lang => !['solidity', 'rust', 'move'].includes(lang.toLowerCase()));
                const web2LangScore = Math.min(web2Languages.length / thresholds.web2Languages, 1) * weights.web2Languages;
                metrics.web2Languages = {
                    value: web2Languages.length,
                    threshold: thresholds.web2Languages,
                    weight: weights.web2Languages,
                    score: web2LangScore
                };

                // Web3 languages score
                const web3Languages = Object.keys(repos.totalLanguageLinesOfCode || {})
                    .filter(lang => ['solidity', 'rust', 'move'].includes(lang.toLowerCase()));
                const web3LangScore = Math.min(web3Languages.length / thresholds.web3Languages, 1) * weights.web3Languages;
                metrics.web3Languages = {
                    value: web3Languages.length,
                    threshold: thresholds.web3Languages,
                    weight: weights.web3Languages,
                    score: web3LangScore
                };

                // Followers score
                const followers = userInfo.followers || 0;
                const followersScore = Math.min(followers / thresholds.followers, 1) * weights.followers;
                metrics.followers = {
                    value: followers,
                    threshold: thresholds.followers,
                    weight: weights.followers,
                    score: followersScore
                };

                // Forks score
                const forks = repos.totalForks || 0;
                const forksScore = Math.min(forks / thresholds.forks, 1) * weights.forks;
                metrics.forks = {
                    value: forks,
                    threshold: thresholds.forks,
                    weight: weights.forks,
                    score: forksScore
                };
            }

            // Calculate total score
            const totalScore = Object.values(metrics).reduce((acc, metric) => acc + metric.score, 0);

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
} 