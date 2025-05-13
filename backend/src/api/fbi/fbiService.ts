import { Network } from 'alchemy-sdk';
import { OnchainDataManager } from './../../common/utils/OnchainDataManager';
import { GitHubHelper } from './../../common/utils/githubHelper';
import { AnalyzeUserRequest } from './fbiModel';
import { env } from '@/common/utils/envConfig';
import { GitHubGraphQLHelper } from '@/common/utils/githubHelperGraphql';
import { PrismaClient, DataStatus, User } from '@prisma/client';
import { ScoreService } from './scoreService';
import { Logger } from '@/common/utils/logger';

const prisma = new PrismaClient();
const scoreService = new ScoreService();

export class FbiService {
    async processUserData(request: AnalyzeUserRequest): Promise<void> {
        try {
            Logger.info('FbiService', `Starting processUserData for githubUsername: ${request.githubUsername}`);
            const user = await prisma.user.findFirst({
                where: { githubId: request.githubUsername }
            });

            if (!user) throw new Error("User not found");

            // Fetch all related data
            const [githubData, contractsData, onchainData, userScore, developerWorth] = await Promise.all([
                prisma.githubData.findUnique({ where: { userId: user.id } }),
                prisma.contractsData.findUnique({ where: { userId: user.id } }),
                prisma.onchainData.findUnique({ where: { userId: user.id } }),
                prisma.userScore.findUnique({ where: { userId: user.id } }),
                prisma.developerWorth.findUnique({ where: { userId: user.id } })
            ]);

            // Check if each data type needs processing
            const githubNeedsProcessing = !githubData || githubData.status !== DataStatus.COMPLETED;
            const onchainNeedsProcessing = !contractsData || contractsData.status !== DataStatus.COMPLETED || !onchainData || onchainData.status !== DataStatus.COMPLETED;
            const scoreNeedsProcessing = !userScore;
            const worthNeedsProcessing = !developerWorth;

            // If all are already completed, just update user and return
            if (!githubNeedsProcessing && !onchainNeedsProcessing && !scoreNeedsProcessing && !worthNeedsProcessing) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        lastFetchedAt: new Date(),
                        dataStatus: DataStatus.COMPLETED
                    }
                });
                Logger.info('FbiService', `All data already completed for user: ${user.id}. Skipping processing.`);
                return;
            }

            Logger.info('FbiService', `User found: ${user.id}. Processing only missing/incomplete data.`);
            // Process only the missing/incomplete data in parallel
            const processPromises = [];
            if (githubNeedsProcessing) processPromises.push(this.processGithubData(request.githubUsername, user.id));
            if (onchainNeedsProcessing) {
                processPromises.push(this.extractOnchainData(request, user));
                processPromises.push(this.extractHackathonData(request, user));
            }
            await Promise.all(processPromises);

            Logger.info('FbiService', `GitHub and onchain data processed for user: ${user.id}. Calculating scores if needed.`);
            // Calculate user score and developer worth if needed
            const scorePromises = [];
            if (scoreNeedsProcessing) scorePromises.push(scoreService.calculateUserScore(user.id));
            if (worthNeedsProcessing) scorePromises.push(scoreService.calculateDeveloperWorth(user.id));
            await Promise.all(scorePromises);

            Logger.info('FbiService', `Scores calculated for user: ${user.id}. Checking all service statuses.`);
            
            // Fetch latest status of all services
            const [latestGithubData, latestContractsData, latestOnchainData, latestUserScore, latestDeveloperWorth] = await Promise.all([
                prisma.githubData.findUnique({ where: { userId: user.id } }),
                prisma.contractsData.findUnique({ where: { userId: user.id } }),
                prisma.onchainData.findUnique({ where: { userId: user.id } }),
                prisma.userScore.findUnique({ where: { userId: user.id } }),
                prisma.developerWorth.findUnique({ where: { userId: user.id } })
            ]);

            // Check if any service failed or is still processing
            const failedServices = [];
            if (latestGithubData?.status !== DataStatus.COMPLETED) failedServices.push('GitHub Data');
            if (latestContractsData?.status !== DataStatus.COMPLETED) failedServices.push('Contracts Data');
            if (latestOnchainData?.status !== DataStatus.COMPLETED) failedServices.push('Onchain Data');
            if (!latestUserScore) failedServices.push('User Score');
            if (!latestDeveloperWorth) failedServices.push('Developer Worth');

            if (failedServices.length > 0) {
                const errorMessage = `The following services failed to complete: ${failedServices.join(', ')}`;
                Logger.error('FbiService', errorMessage);
                throw new Error(errorMessage);
            }

            // Update user's last fetched timestamp and status only if all services completed successfully
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    lastFetchedAt: new Date(),
                    dataStatus: DataStatus.COMPLETED
                }
            });
            Logger.info('FbiService', `processUserData completed for user: ${user.id}`);
        } catch (error) {
            // Update user status to failed if any error occurs
            Logger.error('FbiService', 'Error in processUserData', error);
            const user = await prisma.user.findFirst({
                where: { githubId: request.githubUsername }
            });
            if (user) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { dataStatus: DataStatus.FAILED }
                });
                Logger.info('FbiService', `User status set to FAILED for user: ${user.id}`);
            }
            throw error;
        }
    }

    private async processGithubData(githubUsername: string, userId: string): Promise<void> {
        try {
            Logger.info('FbiService', `Starting processGithubData for userId: ${userId}, githubUsername: ${githubUsername}`);
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

            Logger.info('FbiService', `Fetching GitHub user data for: ${githubUsername}`);
            const userData = await githubHelper.fetchUser(githubUsername);
            Logger.info('FbiService', `Fetching GitHub repos for: ${githubUsername}`);
            const userRepoData = await githubHelper.fetchUserReposWithDetails(githubUsername);
            Logger.info('FbiService', `Fetching GitHub organizations for: ${githubUsername}`);
            const organizations = await githubHelper.fetchUserOrganizations(githubUsername);
            
            // Get contributions for last 4 years
            const now = new Date();
            const mergedContributions : any = {
                totalContributions: 0,
                contributionCalendar: {
                    totalContributions: 0,
                    weeks: []
                },
                totalPRs: 0,
                totalIssues: 0,
                repoContributions: {}
            };
            
            Logger.info('FbiService', `Fetching GitHub contributions for last 4 years for: ${githubUsername}`);
            // Loop through last 4 years
            for (let i = 0; i < 4; i++) {
                const endDate = new Date(now);
                endDate.setUTCFullYear(now.getUTCFullYear() - i);
                const startDate = new Date(endDate);
                startDate.setUTCFullYear(endDate.getUTCFullYear() - 1);
                
                const endDateISOString = endDate.toISOString().split('.')[0] + 'Z';
                const startDateISOString = startDate.toISOString().split('.')[0] + 'Z';
                
                Logger.info('FbiService', `Fetching contributions for year ${i + 1}: ${startDateISOString} to ${endDateISOString}`);
                const yearContributions = await githubGraphHelper.getUserContributions(
                    githubUsername,
                    startDateISOString,
                    endDateISOString,
                );

                // Merge the contributions data
                mergedContributions.totalContributions += yearContributions.totalContributions;
                mergedContributions.contributionCalendar.totalContributions += yearContributions.contributionCalendar.totalContributions;
                mergedContributions.totalPRs += yearContributions.totalPRs;
                mergedContributions.totalIssues += yearContributions.totalIssues;
                
                // Merge weeks
                mergedContributions.contributionCalendar.weeks = [
                    ...yearContributions.contributionCalendar.weeks,
                    ...mergedContributions.contributionCalendar.weeks
                ];

                // Merge repo contributions
                for (const [repo, contributions] of Object.entries(yearContributions.repoContributions)) {
                    mergedContributions.repoContributions[repo] = (mergedContributions.repoContributions[repo] || 0) + contributions;
                }
            }

            // Convert to plain objects for JSON storage
            const userInfoJson = JSON.parse(JSON.stringify(userData));
            const reposJson = JSON.parse(JSON.stringify(userRepoData));
            const orgsJson = JSON.parse(JSON.stringify(organizations));
            const contributionsJson = JSON.parse(JSON.stringify(mergedContributions));

            Logger.info('FbiService', `Updating githubData in DB for userId: ${userId}`);
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
            Logger.info('FbiService', `processGithubData completed for userId: ${userId}`);
        } catch (error) {
            await prisma.githubData.update({
                where: { userId },
                data: { status: DataStatus.FAILED }
            });
            Logger.error('FbiService', 'Error in processGithubData', error);
            throw error;
        }
    }

    private async extractOnchainData(request: AnalyzeUserRequest, user: User): Promise<void> {
        try {
            Logger.info('FbiService', `Starting extractOnchainData for userId: ${user.id}`);
            // Get platform configuration
            const platformConfig = await prisma.platformConfig.findUnique({
                where: { name: "default" }
            });

            if (!platformConfig) throw new Error("Platform configuration not found");

            // Get enabled chains
            const enabledChains = Object.entries(platformConfig.enabledChains as Record<string, boolean>)
                .filter(([_, enabled]) => enabled)
                .map(([chain]) => chain as Network);

            Logger.info('FbiService', `Enabled chains for userId ${user.id}: ${enabledChains.join(', ')}`);
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

            Logger.info('FbiService', `Processing onchain data for each chain for userId: ${user.id}`);
            // Process each chain in parallel
            const chainResults = await Promise.all(
                enabledChains.map(async (chain) => {
                    try {
                        Logger.info('FbiService', `Processing chain: ${chain} for userId: ${user.id}`);
                        const onchainDataManager = new OnchainDataManager(env.ALCHEMY_API_KEY, chain);
                        
                        // Get contracts for this chain
                        let chainContracts: any = [];
                        for (const address of request.addresses) {
                            Logger.info('FbiService', `Getting contracts deployed by address: ${address} on chain: ${chain}`);
                            const contracts = await onchainDataManager.getContractsDeployedByAddress(address, "0x0", "latest");
                            chainContracts = [...chainContracts, ...contracts];
                        }

                        Logger.info('FbiService', `Getting onchain history for addresses: ${request.addresses} on chain: ${chain}`);
                        // Get history for this chain
                        let chainHistory: any = [];
                        for (const address of request.addresses) {
                            Logger.info('FbiService', `Getting onchain history for address: ${address} on chain: ${chain}`);
                            const history = await onchainDataManager.getOnchainHistoryForAddresses([address], "0x0", "latest");
                            chainHistory = [...chainHistory, ...history];
                        }

                        Logger.info('FbiService', `Chain ${chain} processed for userId: ${user.id}`);
                        Logger.info('FbiService', `Chain ${chain} contracts: ${chainContracts.length}`);
                        Logger.info('FbiService', `Chain ${chain} history: ${chainHistory.length}`);


                        

                        // Calculate contract statistics for this chain
                        const contractStats = {
                            mainnet: chainContracts.filter((c: any) => !c.isTestnet).length,
                            testnet: chainContracts.filter((c: any) => c.isTestnet).length,
                            total: chainContracts.length
                        };

                        
                        // Calculate transaction statistics for this chain
                        const transactionStats = {
                            mainnet: {
                                external: chainHistory.filter((t: any) => !t.isTestnet && t.category === 'external').length,
                                internal: chainHistory.filter((t: any) => !t.isTestnet && t.category === 'internal').length,
                                nft: chainHistory.filter((t: any) => !t.isTestnet && t.category === 'nft').length,
                                erc20: chainHistory.filter((t: any) => !t.isTestnet && t.category === 'erc20').length,
                                total: chainHistory.filter((t: any) => !t.isTestnet).length
                            },
                            testnet: {
                                external: chainHistory.filter((t: any) => t.isTestnet && t.category === 'external').length,
                                internal: chainHistory.filter((t: any) => t.isTestnet && t.category === 'internal').length,
                                nft: chainHistory.filter((t: any) => t.isTestnet && t.category === 'nft').length,
                                erc20: chainHistory.filter((t: any) => t.isTestnet && t.category === 'erc20').length,
                                total: chainHistory.filter((t: any) => t.isTestnet).length
                            }
                        };

                        Logger.info('FbiService', `Chain ${chain} processed for userId: ${user.id}`);
                        return {
                            chain,
                            contracts: chainContracts,
                            history: chainHistory,
                            contractStats,
                            transactionStats,
                            status: DataStatus.COMPLETED
                        };
                    } catch (error) {
                        Logger.error('FbiService', `Error processing chain ${chain}:`, error);
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

            Logger.info('FbiService', `Updating contractsData and onchainData in DB for userId: ${user.id}`);
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
            Logger.info('FbiService', `extractOnchainData completed for userId: ${user.id}`);
        } catch (error) {
            Logger.error('FbiService', 'Error in extractOnchainData', error);
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

    private async extractHackathonData(request: AnalyzeUserRequest, user: User): Promise<void> {
        try {
            Logger.info('FbiService', `Starting extractHackathonData for userId: ${user.id}`);
            
            // Get hackathon credentials for all addresses
            Logger.info('FbiService', `Getting hackathon credentials for all addresses for userId: ${user.id}`);
            const hackathonCredentialsPromises = request.addresses.map(address => 
                OnchainDataManager.getHackathonCredentials(address)
            );
            const hackathonResults = await Promise.all(hackathonCredentialsPromises);
            
            // Combine hackathon results from all addresses
            const combinedHackathonData = hackathonResults.reduce((acc, curr) => ({
                totalWins: acc.totalWins + (curr.totalWins || 0),
                totalHacker: acc.totalHacker + (curr.totalHacker || 0),
                HACKER: {
                    count: acc.HACKER.count + (curr.HACKER?.count || 0),
                    packs: { ...acc.HACKER.packs, ...curr.HACKER?.packs }
                },
                WINS: {
                    count: acc.WINS.count + (curr.WINS?.count || 0),
                    packs: { ...acc.WINS.packs, ...curr.WINS?.packs }
                }
            }), {
                totalWins: 0,
                totalHacker: 0,
                HACKER: { count: 0, packs: {} },
                WINS: { count: 0, packs: {} }
            });

            // Store hackathon data in onchainData
            await prisma.onchainData.update({
                where: { userId: user.id },
                data: {
                    hackathonData: combinedHackathonData
                }
            });

            Logger.info('FbiService', `extractHackathonData completed for userId: ${user.id}`);
        } catch (error) {
            Logger.error('FbiService', 'Error in extractHackathonData', error);
            throw error;
        }
    }
} 