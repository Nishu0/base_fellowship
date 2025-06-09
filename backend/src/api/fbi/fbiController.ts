import { Request, Response } from 'express';
import { FbiService } from './fbiService';
import { AnalyzeUserRequest } from './fbiModel';
import { analyzeQueue } from './queue';
import { PrismaClient, DataStatus } from '@prisma/client';
import { OnchainDataManager } from '@/common/utils/OnchainDataManager';
import { Logger } from '@/common/utils/logger';
import { Network } from 'alchemy-sdk';
import { getAlchemyProvider } from '@/common/utils/alchemyProvider';
import { GitHubHelper } from '@/common/utils/githubHelper';
import { env } from '@/common/utils/envConfig';
import { getNextGithubToken } from '@/common/utils/getCreds';

const prisma = new PrismaClient();

export class FbiController {
    private fbiService: FbiService;

    constructor() {
        this.fbiService = new FbiService();
    }

    async analyzeUser(req: Request, res: Response): Promise<void | Response> {
        Logger.info('FbiController', 'analyzeUser called', { body: req.body });
        try {
            const request: AnalyzeUserRequest = {
                githubUsername: req.body.githubUsername.toLowerCase(),
                addresses: req.body.addresses,
                email: req.body.email
            };

            const githubHelper = new GitHubHelper(await getNextGithubToken());

            // Check if username is valid
            const isValidUsername = await githubHelper.isValidUsername(request.githubUsername);
            if (!isValidUsername) {
                Logger.error('FbiController', 'Invalid Github username', { githubUsername: request.githubUsername });
                return res.status(400).json({
                    success: false,
                    error: "Invalid github username"
                });

            }

            // Resolve ENS names to addresses
            const resolvedAddresses = await Promise.all(
                request.addresses.map(async (address) => {
                    // If it's already an address, return as is
                    if (address.startsWith('0x') && !address.endsWith(".eth")) {
                        return address;
                    }
                    
                    try {
                        // First try Ethereum mainnet
                        const mainnetProvider = await getAlchemyProvider(Network.ETH_MAINNET);
                        let resolvedAddress = await mainnetProvider.core.resolveName(address);
                        
                        // If not found on mainnet, try Base chain
                        if (!resolvedAddress) {
                            const baseProvider = await getAlchemyProvider(Network.BASE_MAINNET);
                            resolvedAddress = await baseProvider.core.resolveName(address);
                        }
                        
                        if (resolvedAddress) {
                            Logger.info('FbiController', 'ENS name resolved', { 
                                ensName: address, 
                                resolvedAddress 
                            });
                            return resolvedAddress;
                        }
                    } catch (error) {
                        Logger.error('FbiController', 'Error resolving ENS name', { 
                            ensName: address, 
                            error 
                        });
                    }
                    return null; // Return original if resolution fails
                })
            );

            // Update request with resolved addresses
            request.addresses = resolvedAddresses.filter((address): address is string => address !== null);

            Logger.info('FbiController', 'Resolved addresses', { addresses: request.addresses });

            Logger.info('FbiController', 'Checking if user exists', { githubUsername: request.githubUsername });
            // Check if user exists
            let user = await prisma.user.findFirst({
                where: { githubId: request.githubUsername },
                include: {
                    githubData: true,
                    contractsData: true,
                    onchainData: true,
                    userScore: true,
                    developerWorth: true,
                    wallets: true // Include wallets in the query
                }
            });

            // If user doesn't exist, create and add to queue
            if (!user) {
                Logger.info('FbiController', 'User not found, creating new user and adding to queue', { githubUsername: request.githubUsername });
                user = await prisma.user.create({
                    data: {
                        githubId: request.githubUsername,
                        dataStatus: DataStatus.PENDING,
                        email: request.email,
                        githubData: {
                            create: {
                                userInfo: {},
                                repos: [],
                                orgs: [],
                                languagesData: {},
                                status: DataStatus.PENDING
                            }
                        },
                        contractsData: {
                            create: {
                                contracts: [],
                                status: DataStatus.PENDING
                            }
                        },
                        onchainData: {
                            create: {
                                history: [],
                                contractStats: {},
                                transactionStats: {},
                                status: DataStatus.PENDING
                            }
                        },
                        // Add wallets creation
                        wallets: {
                            create: request.addresses.map(address => ({
                                id: `${request.githubUsername}-${address}`,
                                address: address,
                                chainType: 'ethereum',
                                chainId: '1' // Mainnet
                            }))
                        }
                    },
                    include: {
                        githubData: true,
                        contractsData: true,
                        onchainData: true,
                        userScore: true,
                        developerWorth: true,
                        wallets: true
                    }
                });
                await analyzeQueue.addToQueue(request);
                Logger.info('FbiController', 'User created and added to processing queue', { githubUsername: request.githubUsername });
                res.status(202).json({
                    success: true,
                    data: {
                        message: "User created and added to processing queue",
                        status: "PENDING"
                    }
                });
                return;
            }

            // If user exists, update their wallets
            const existingAddresses = new Set(user.wallets.map(w => w.address));
            const newAddresses = request.addresses.filter(addr => !existingAddresses.has(addr));

            if (newAddresses.length > 0) {
                Logger.info('FbiController', 'Adding new wallets for existing user', { 
                    githubUsername: request.githubUsername,
                    newAddresses 
                });
                
                await prisma.wallet.createMany({
                    data: newAddresses.map(address => ({
                        id: `${request.githubUsername}-${address}`,
                        address: address,
                        chainType: 'ethereum',
                        chainId: '1', // Mainnet
                        userId: user.id
                    })),
                    skipDuplicates: true
                });
            }

            // Check if all data is already fetched and recent (within 24 hours)
            const isDataRecent = user.lastFetchedAt && 
                (Date.now() - user.lastFetchedAt.getTime()) < 24 * 60 * 60 * 1000;

            const isAllDataCompleted = user.dataStatus === DataStatus.COMPLETED &&
                user.githubData?.status === DataStatus.COMPLETED &&
                user.contractsData?.status === DataStatus.COMPLETED &&
                user.onchainData?.status === DataStatus.COMPLETED;

            if (isDataRecent && isAllDataCompleted) {
                Logger.info('FbiController', 'Returning cached user data', { githubUsername: request.githubUsername });
                res.status(200).json({
                    success: true,
                    data: {
                        userData: user.githubData?.userInfo,
                        userRepoData: user.githubData?.repos,
                        organizations: user.githubData?.orgs,
                        contributionData: user.githubData?.languagesData,
                        contractsDeployed: user.contractsData?.contracts,
                        onchainHistory: user.onchainData?.history,
                        hackathonData: user.onchainData?.hackathonData,
                        score: user.userScore,
                        developerWorth: user.developerWorth
                    }
                });
                return;
            }

            // If data needs updating, add to queue
            Logger.info('FbiController', 'Data not recent or incomplete, adding to queue', { githubUsername: request.githubUsername });
            await analyzeQueue.addToQueue(request);
            res.status(202).json({
                success: true,
                data: {
                    message: "Data update queued",
                    status: "PROCESSING"
                }
            });
        } catch (error) {
            Logger.error('FbiController', 'Error in analyzeUser', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    }

    async checkProcessingStatus(req: Request, res: Response): Promise<void> {
        Logger.info('FbiController', 'checkProcessingStatus called', { params: req.params });
        try {
            let { githubUsername } = req.params;
            githubUsername = githubUsername.toLowerCase();
            const user = await prisma.user.findFirst({
                where: { githubId: githubUsername },
                include: {
                    githubData: true,
                    contractsData: true,
                    onchainData: true,
                    userScore: true,
                    developerWorth: true,
                    wallets: true
                }
            });

            if (!user) {
                Logger.warn('FbiController', 'User not found in checkProcessingStatus', { githubUsername });
                res.status(404).json({
                    success: false,
                    error: "User not found"
                });
                return;
            }

            const isCompleted = user.dataStatus === DataStatus.COMPLETED &&
                user.githubData?.status === DataStatus.COMPLETED &&
                user.contractsData?.status === DataStatus.COMPLETED &&
                user.onchainData?.status === DataStatus.COMPLETED;

            if (isCompleted) {
                Logger.info('FbiController', 'User processing completed', { githubUsername });
                res.status(200).json({
                    success: true,
                    data: {
                        status: "COMPLETED",
                        userData: user.githubData?.userInfo,
                        userRepoData: user.githubData?.repos,
                        organizations: user.githubData?.orgs,
                        contributionData: user.githubData?.languagesData,
                        contractsDeployed: user.contractsData?.contracts,
                        onchainHistory: user.onchainData?.history,
                        hackathonData: user.onchainData?.hackathonData,
                        contractStats: user.onchainData?.contractStats,
                        transactionStats: user.onchainData?.transactionStats,
                        score: user.userScore,
                        developerWorth: user.developerWorth,
                        wallets: user.wallets
                    }
                });
                return;
            }

            // If still processing, return current status
            Logger.info('FbiController', 'User processing in progress', { githubUsername });
            res.status(200).json({
                success: true,
                data: {
                    status: "PROCESSING",
                    progress: {
                        githubData: user.githubData?.status || "PENDING",
                        contractsData: user.contractsData?.status || "PENDING",
                        onchainData: user.onchainData?.status || "PENDING"
                    }
                }
            });
        } catch (error) {
            Logger.error('FbiController', 'Error in checkProcessingStatus', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async getETHGlobalCredentials(req: Request, res: Response): Promise<void> {
        Logger.info('FbiController', 'getETHGlobalCredentials called', { params: req.params });
        try {
            const address = req.params.address;
            const credentials = await OnchainDataManager.getHackerCredentials(address);
            Logger.info('FbiController', 'ETHGlobal credentials fetched', { address, credentials });
            res.status(200).json(credentials);
        } catch (error) {
            Logger.error('FbiController', 'Error in getETHGlobalCredentials', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }
    
    async getAllUsersByScore(req: Request, res: Response): Promise<void> {
        Logger.info('FbiController', 'getAllUsersByScore called');
        try {
            const users = await prisma.user.findMany({
                include: {
                    githubData: true,
                    userScore: true
                },
                orderBy: {
                    userScore: {
                        totalScore: 'desc'
                    }
                },
                where: {
                    dataStatus: DataStatus.COMPLETED,
                    userScore: {
                        isNot: null
                    }
                }
            });

            Logger.info('FbiController', 'Fetched users by score', { count: users.length });
            const formattedUsers = users.map(user => ({
                githubUsername: user.githubId,
                userInfo: user.githubData?.userInfo,
                score: user.userScore
            }));

            res.status(200).json({
                success: true,
                data: formattedUsers
            });
        } catch (error) {
            Logger.error('FbiController', 'Error in getAllUsersByScore', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async getAllOrganizations(req: Request, res: Response): Promise<void> {
        Logger.info('FbiController', 'getAllOrganizations called');
        try {
            const organizations = await prisma.organization.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });

            Logger.info('FbiController', 'Fetched all organizations', { count: organizations.length });
            res.status(200).json({
                success: true,
                data: organizations
            });
        } catch (error) {
            Logger.error('FbiController', 'Error in getAllOrganizations', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async getOrganizationByName(req: Request, res: Response): Promise<void> {
        Logger.info('FbiController', 'getOrganizationByName called', { params: req.params });
        try {
            const { name } = req.params;

            const organization = await prisma.organization.findUnique({
                where: { name }
            });

            if (!organization) {
                Logger.warn('FbiController', 'Organization not found', { name });
                res.status(404).json({
                    success: false,
                    error: "Organization not found"
                });
                return;
            }

            Logger.info('FbiController', 'Organization found', { organizationId: organization.id });
            res.status(200).json({
                success: true,
                data: organization
            });
        } catch (error) {
            Logger.error('FbiController', 'Error in getOrganizationByName', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async reprocessUser(req: Request, res: Response): Promise<void> {
        Logger.info('FbiController', 'reprocessUser called', { params: req.params });
        try {
            let { githubUsername } = req.params;
            if (!githubUsername) {
                res.status(400).json({
                    success: false,
                    error: "GitHub username is required"
                });
                return;
            }
            
            githubUsername = githubUsername.toLowerCase();
            
            // Check if user exists
            const user = await prisma.user.findFirst({
                where: { githubId: githubUsername },
                include: { wallets: true }
            });

            if (!user) {
                Logger.warn('FbiController', 'User not found for reprocessing', { githubUsername });
                res.status(404).json({
                    success: false,
                    error: "User not found"
                });
                return;
            }

            // Extract addresses from user's wallets
            const addresses = user.wallets.map(wallet => wallet.address);
            
            if (addresses.length === 0) {
                Logger.warn('FbiController', 'No wallet addresses found for user', { githubUsername });
                res.status(400).json({
                    success: false,
                    error: "No wallet addresses found for this user"
                });
                return;
            }

            // Create analyze request
            const request: AnalyzeUserRequest = {
                githubUsername,
                addresses,
                forceRefresh: true,
                email: user.email || ''
            };

            // Reset data status to PENDING for this user
            await prisma.user.update({
                where: { id: user.id },
                data: { dataStatus: DataStatus.PENDING }
            });

            // Add to processing queue
            await analyzeQueue.addToQueue(request);
            
            Logger.info('FbiController', 'User added to reprocessing queue', { githubUsername });
            
            res.status(202).json({
                success: true,
                data: {
                    message: "User added to reprocessing queue",
                    status: "PENDING"
                }
            });
        } catch (error) {
            Logger.error('FbiController', 'Error in reprocessUser', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async reprocessAllUsers(req: Request, res: Response): Promise<void> {
        Logger.info('FbiController', 'reprocessAllUsers called');
        try {
            // Get all users with completed data
            const users = await prisma.user.findMany({
                include: { wallets: true }
            });

            if (users.length === 0) {
                Logger.warn('FbiController', 'No users found for reprocessing');
                res.status(404).json({
                    success: false,
                    error: "No users found"
                });
                return;
            }

            // Count of users with addresses
            let usersProcessed = 0;

            // Process each user
            for (const user of users) {
                const addresses = user.wallets.map(wallet => wallet.address);
                
                // Skip users with no addresses
                if (addresses.length === 0) {
                    Logger.warn('FbiController', 'Skipping user with no wallet addresses', { githubUsername: user.githubId });
                    continue;
                }

                // Create analyze request
                const request: AnalyzeUserRequest = {
                    githubUsername: user.githubId || '',
                    addresses,
                    forceRefresh: true,
                    email: user.email || ''
                };

                // Reset data status to PENDING
                await prisma.user.update({
                    where: { id: user.id },
                    data: { dataStatus: DataStatus.PENDING }
                });

                // Add to processing queue
                await analyzeQueue.addToQueue(request);
                usersProcessed++;
                
                Logger.info('FbiController', 'User added to reprocessing queue', { githubUsername: user.githubId });
            }

            res.status(202).json({
                success: true,
                data: {
                    message: `${usersProcessed} users added to reprocessing queue`,
                    totalUsers: users.length,
                    usersProcessed
                }
            });
        } catch (error) {
            Logger.error('FbiController', 'Error in reprocessAllUsers', { error });
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }
} 