import { Network } from 'alchemy-sdk';
import { OnchainDataManager } from './../../common/utils/OnchainDataManager';
import { GitHubHelper } from './../../common/utils/githubHelper';
import { AnalyzeUserRequest } from './fbiModel';
import { env } from '@/common/utils/envConfig';
import { GitHubGraphQLHelper } from '@/common/utils/githubHelperGraphql';
import { PrismaClient, DataStatus, User } from '@prisma/client';
import { ScoreService } from './scoreService';

const prisma = new PrismaClient();
const scoreService = new ScoreService();

export class FbiService {
    async processUserData(request: AnalyzeUserRequest): Promise<void> {
        try {
            const user = await prisma.user.findFirst({
                where: { githubId: request.githubUsername }
            });

            if (!user) throw new Error("User not found");

            // Process all data in parallel
            await Promise.all([
                this.processGithubData(request.githubUsername, user.id),
                this.extractOnchainData(request, user)
            ]);

            // Calculate user score
            await scoreService.calculateUserScore(user.id);

            // Update user's last fetched timestamp and status
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    lastFetchedAt: new Date(),
                    dataStatus: DataStatus.COMPLETED
                }
            });
        } catch (error) {
            // Update user status to failed if any error occurs
            const user = await prisma.user.findFirst({
                where: { githubId: request.githubUsername }
            });
            if (user) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { dataStatus: DataStatus.FAILED }
                });
            }
            throw error;
        }
    }

    private async processGithubData(githubUsername: string, userId: string): Promise<void> {
        try {
            // Initialize with empty data
            await prisma.githubData.upsert({
                where: { userId },
                create: {
                    userId,
                    userInfo: {},
                    repos: [],
                    orgs: [],
                    languagesData: {},
                    status: DataStatus.PROCESSING,
                    lastFetchedAt: new Date()
                },
                update: {
                    status: DataStatus.PROCESSING
                }
            });

            const githubHelper = new GitHubHelper(env.GITHUB_ACCESS_TOKEN);
            const githubGraphHelper = new GitHubGraphQLHelper(env.GITHUB_ACCESS_TOKEN);

            const userData = await githubHelper.fetchUser(githubUsername);
            const userRepoData = await githubHelper.fetchUserReposWithDetails(githubUsername);
            const organizations = await githubHelper.fetchUserOrganizations(githubUsername);
            
            const now = new Date();
            const nowISOString = now.toISOString().split('.')[0] + 'Z';
            const twoYearsAgo = new Date(now);
            twoYearsAgo.setUTCFullYear(now.getUTCFullYear() - 1);
            const twoYearsAgoISOString = twoYearsAgo.toISOString().split('.')[0] + 'Z';

            const allContributions = await githubGraphHelper.getUserContributions(
                githubUsername,
                twoYearsAgoISOString,
                nowISOString,
            );

            // Convert to plain objects for JSON storage
            const userInfoJson = JSON.parse(JSON.stringify(userData));
            const reposJson = JSON.parse(JSON.stringify(userRepoData));
            const orgsJson = JSON.parse(JSON.stringify(organizations));
            const contributionsJson = JSON.parse(JSON.stringify(allContributions));

            await prisma.githubData.update({
                where: { userId },
                data: {
                    userInfo: userInfoJson,
                    repos: reposJson,
                    orgs: orgsJson,
                    languagesData: contributionsJson,
                    status: DataStatus.COMPLETED,
                    lastFetchedAt: new Date()
                }
            });
        } catch (error) {
            await prisma.githubData.update({
                where: { userId },
                data: { status: DataStatus.FAILED }
            });
            throw error;
        }
    }

    private async extractOnchainData(request: AnalyzeUserRequest, user: User): Promise<void> {
        try {
            // Get platform configuration
            const platformConfig = await prisma.platformConfig.findUnique({
                where: { name: "default" }
            });

            if (!platformConfig) throw new Error("Platform configuration not found");

            // Get enabled chains
            const enabledChains = Object.entries(platformConfig.enabledChains as Record<string, boolean>)
                .filter(([_, enabled]) => enabled)
                .map(([chain]) => chain as Network);

            // Initialize empty data structures
            await prisma.contractsData.upsert({
                where: { userId: user.id },
                create: {
                    userId: user.id,
                    contracts: {},
                    status: DataStatus.PROCESSING,
                    lastFetchedAt: new Date()
                },
                update: {
                    status: DataStatus.PROCESSING
                }
            });

            await prisma.onchainData.upsert({
                where: { userId: user.id },
                create: {
                    userId: user.id,
                    history: {},
                    contractStats: {} as any,
                    transactionStats: {} as any,
                    status: DataStatus.PROCESSING,
                    lastFetchedAt: new Date()
                },
                update: {
                    status: DataStatus.PROCESSING
                }
            });

            // Process each chain in parallel
            const chainResults = await Promise.all(
                enabledChains.map(async (chain) => {
                    try {
                        const onchainDataManager = new OnchainDataManager(env.ALCHEMY_API_KEY, chain);
                        
                        // Get contracts for this chain
                        let chainContracts: any = [];
                        for (const address of request.addresses) {
                            const contracts = await onchainDataManager.getContractsDeployedByAddress(address, "0x0", "latest");
                            chainContracts = [...chainContracts, ...contracts];
                        }

                        // Get history for this chain
                        let chainHistory: any = [];
                        for (const address of request.addresses) {
                            const history = await onchainDataManager.getOnchainHistoryForAddresses([address], "0x0", "latest");
                            chainHistory = [...chainHistory, ...history];
                        }

                        // Calculate contract statistics for this chain
                        const contractStats = {
                            mainnet: chainContracts.filter((c: any) => !c.isTestnet).length,
                            testnet: chainContracts.filter((c: any) => c.isTestnet).length,
                            total: chainContracts.length
                        };

                        // Calculate transaction statistics for this chain
                        const transactionStats = {
                            mainnet: {
                                external: chainHistory.filter((t: any) => !t.isTestnet && t.type === 'external').length,
                                nft: chainHistory.filter((t: any) => !t.isTestnet && t.type === 'nft').length,
                                erc20: chainHistory.filter((t: any) => !t.isTestnet && t.type === 'erc20').length,
                                total: chainHistory.filter((t: any) => !t.isTestnet).length
                            },
                            testnet: {
                                external: chainHistory.filter((t: any) => t.isTestnet && t.type === 'external').length,
                                nft: chainHistory.filter((t: any) => t.isTestnet && t.type === 'nft').length,
                                erc20: chainHistory.filter((t: any) => t.isTestnet && t.type === 'erc20').length,
                                total: chainHistory.filter((t: any) => t.isTestnet).length
                            }
                        };

                        return {
                            chain,
                            contracts: chainContracts,
                            history: chainHistory,
                            contractStats,
                            transactionStats,
                            status: DataStatus.COMPLETED
                        };
                    } catch (error) {
                        console.error(`Error processing chain ${chain}:`, error);
                        return {
                            chain,
                            contracts: [],
                            history: [],
                            contractStats: { mainnet: 0, testnet: 0, total: 0 },
                            transactionStats: {
                                mainnet: { external: 0, nft: 0, erc20: 0, total: 0 },
                                testnet: { external: 0, nft: 0, erc20: 0, total: 0 }
                            },
                            status: DataStatus.FAILED
                        };
                    }
                })
            );

            // Organize data by chain
            const contractsByChain: Record<string, any> = {};
            const historyByChain: Record<string, any> = {};
            const contractStatsByChain: Record<string, any> = {};
            const transactionStatsByChain: Record<string, any> = {};
            let hasFailed = false;

            // Calculate totals across all chains
            const totalContractStats = {
                mainnet: 0,
                testnet: 0,
                total: 0
            };

            const totalTransactionStats = {
                mainnet: { external: 0, nft: 0, erc20: 0, total: 0 },
                testnet: { external: 0, nft: 0, erc20: 0, total: 0 }
            };

            chainResults.forEach(result => {
                contractsByChain[result.chain] = result.contracts;
                historyByChain[result.chain] = result.history;
                contractStatsByChain[result.chain] = result.contractStats;
                transactionStatsByChain[result.chain] = result.transactionStats;

                // Add to totals
                totalContractStats.mainnet += result.contractStats.mainnet;
                totalContractStats.testnet += result.contractStats.testnet;
                totalContractStats.total += result.contractStats.total;

                // Add transaction totals
                totalTransactionStats.mainnet.external += result.transactionStats.mainnet.external;
                totalTransactionStats.mainnet.nft += result.transactionStats.mainnet.nft;
                totalTransactionStats.mainnet.erc20 += result.transactionStats.mainnet.erc20;
                totalTransactionStats.mainnet.total += result.transactionStats.mainnet.total;

                totalTransactionStats.testnet.external += result.transactionStats.testnet.external;
                totalTransactionStats.testnet.nft += result.transactionStats.testnet.nft;
                totalTransactionStats.testnet.erc20 += result.transactionStats.testnet.erc20;
                totalTransactionStats.testnet.total += result.transactionStats.testnet.total;

                if (result.status === DataStatus.FAILED) {
                    hasFailed = true;
                }
            });

            // Add totals to the stats objects
            contractStatsByChain['total'] = totalContractStats;
            transactionStatsByChain['total'] = totalTransactionStats;

            // Update database with organized data
            await prisma.contractsData.update({
                where: { userId: user.id },
                data: {
                    contracts: contractsByChain,
                    status: hasFailed ? DataStatus.FAILED : DataStatus.COMPLETED,
                    lastFetchedAt: new Date()
                }
            });

            await prisma.onchainData.update({
                where: { userId: user.id },
                data: {
                    history: historyByChain,
                    contractStats: contractStatsByChain as any,
                    transactionStats: transactionStatsByChain as any,
                    status: hasFailed ? DataStatus.FAILED : DataStatus.COMPLETED,
                    lastFetchedAt: new Date()
                }
            });
        } catch (error) {
            console.log(error)
            // Update status to failed if any error occurs
            await prisma.contractsData.update({
                where: { userId: user.id },
                data: { status: DataStatus.FAILED }
            });
            await prisma.onchainData.update({
                where: { userId: user.id },
                data: { status: DataStatus.FAILED }
            });
            throw error;
        }
    }
} 