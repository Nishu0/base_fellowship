import { Request, Response } from 'express';
import { FbiService } from './fbiService';
import { AnalyzeUserRequest } from './fbiModel';
import { analyzeQueue } from './queue';
import { PrismaClient, DataStatus } from '@prisma/client';
import { OnchainDataManager } from '@/common/utils/OnchainDataManager';
import { Logger } from '@/common/utils/logger';

const prisma = new PrismaClient();

export class FbiController {
    private fbiService: FbiService;

    constructor() {
        this.fbiService = new FbiService();
    }

    async analyzeUser(req: Request, res: Response): Promise<void> {
        Logger.info('FbiController', 'analyzeUser called', { body: req.body });
        try {
            const request: AnalyzeUserRequest = {
                githubUsername: req.body.githubUsername,
                addresses: req.body.addresses
            };

            Logger.info('FbiController', 'Checking if user exists', { githubUsername: request.githubUsername });
            // Check if user exists
            let user = await prisma.user.findFirst({
                where: { githubId: request.githubUsername },
                include: {
                    githubData: true,
                    contractsData: true,
                    onchainData: true,
                    userScore: true,
                    developerWorth: true
                }
            });

            // If user doesn't exist, create and add to queue
            if (!user) {
                Logger.info('FbiController', 'User not found, creating new user and adding to queue', { githubUsername: request.githubUsername });
                user = await prisma.user.create({
                    data: {
                        githubId: request.githubUsername,
                        dataStatus: DataStatus.PENDING,
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
                        }
                    },
                    include: {
                        githubData: true,
                        contractsData: true,
                        onchainData: true,
                        userScore: true,
                        developerWorth: true
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

            // Check if all data is already fetched and recent (within 24 hours)
            const isDataRecent = user.lastFetchedAt && 
                (Date.now() - user.lastFetchedAt.getTime()) < 24 * 60 * 60 * 1000;

            if (isDataRecent && user.dataStatus === DataStatus.COMPLETED) {
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
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async checkProcessingStatus(req: Request, res: Response): Promise<void> {
        Logger.info('FbiController', 'checkProcessingStatus called', { params: req.params });
        try {
            const { githubUsername } = req.params;

            const user = await prisma.user.findFirst({
                where: { githubId: githubUsername },
                include: {
                    githubData: true,
                    contractsData: true,
                    onchainData: true,
                    userScore: true,
                    developerWorth: true
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
                        developerWorth: user.developerWorth
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
            const credentials = await OnchainDataManager.getHackathonCredentials(address);
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
} 