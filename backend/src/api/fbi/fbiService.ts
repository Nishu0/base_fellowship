import { OnchainDataManager } from './../../common/utils/OnchainDataManager';
import { GitHubHelper } from './../../common/utils/githubHelper';
import { AnalyzeUserRequest } from './fbiModel';
import { env } from '@/common/utils/envConfig';
import { GitHubGraphQLHelper } from '@/common/utils/githubHelperGraphql';
import { PrismaClient, DataStatus } from '@prisma/client';

const prisma = new PrismaClient();

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
                this.processContractsDeployed(request.addresses, user.id),
                this.processOnchainHistory(request.addresses, user.id)
            ]);

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

    private async processContractsDeployed(addresses: string[], userId: string): Promise<void> {
        try {
            // Initialize with empty data
            await prisma.contractsData.upsert({
                where: { userId },
                create: {
                    userId,
                    contracts: [],
                    status: DataStatus.PROCESSING,
                    lastFetchedAt: new Date()
                },
                update: {
                    status: DataStatus.PROCESSING
                }
            });

            const onchainDataManager = new OnchainDataManager(env.ALCHEMY_API_KEY);
            let allContractsDeployed: any = [];
            
            for(let i=0; i<addresses.length; i++) {
                const contractsDeployed = await onchainDataManager.getContractsDeployedByAddress(addresses[i], "0x0", "latest");
                allContractsDeployed = [...allContractsDeployed, ...contractsDeployed];
            }

            // Convert to plain objects for JSON storage
            const contractsJson = JSON.parse(JSON.stringify(allContractsDeployed));

            await prisma.contractsData.update({
                where: { userId },
                data: {
                    contracts: contractsJson,
                    status: DataStatus.COMPLETED,
                    lastFetchedAt: new Date()
                }
            });
        } catch (error) {
            await prisma.contractsData.update({
                where: { userId },
                data: { status: DataStatus.FAILED }
            });
            throw error;
        }
    }

    private async processOnchainHistory(addresses: string[], userId: string): Promise<void> {
        try {
            // Initialize with empty data
            await prisma.onchainData.upsert({
                where: { userId },
                create: {
                    userId,
                    history: [],
                    status: DataStatus.PROCESSING,
                    lastFetchedAt: new Date()
                },
                update: {
                    status: DataStatus.PROCESSING
                }
            });

            const onchainDataManager = new OnchainDataManager(env.ALCHEMY_API_KEY);
            let allOnchainHistory: any = [];
            
            for(let i=0; i<addresses.length; i++) {
                const onchainHistory = await onchainDataManager.getOnchainHistoryForAddresses(addresses, "0x0", "latest");
                allOnchainHistory = [...allOnchainHistory, ...onchainHistory];
            }

            // Convert to plain objects for JSON storage
            const historyJson = JSON.parse(JSON.stringify(allOnchainHistory));

            await prisma.onchainData.update({
                where: { userId },
                data: {
                    history: historyJson,
                    status: DataStatus.COMPLETED,
                    lastFetchedAt: new Date()
                }
            });
        } catch (error) {
            await prisma.onchainData.update({
                where: { userId },
                data: { status: DataStatus.FAILED }
            });
            throw error;
        }
    }
} 