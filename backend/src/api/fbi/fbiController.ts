import { Request, Response } from 'express';
import { FbiService } from './fbiService';
import { AnalyzeUserRequest } from './fbiModel';
import { analyzeQueue } from './queue';
import { PrismaClient, DataStatus } from '@prisma/client';
import { OnchainDataManager } from '@/common/utils/OnchainDataManager';

const prisma = new PrismaClient();

export class FbiController {
    private fbiService: FbiService;

    constructor() {
        this.fbiService = new FbiService();
    }

    async analyzeUser(req: Request, res: Response): Promise<void> {
        try {
            const request: AnalyzeUserRequest = {
                githubUsername: req.body.githubUsername,
                addresses: req.body.addresses
            };

            // Check if user exists
            let user = await prisma.user.findFirst({
                where: { githubId: request.githubUsername },
                include: {
                    githubData: true,
                    contractsData: true,
                    onchainData: true
                }
            });

            // If user doesn't exist, create and add to queue
            if (!user) {
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
                                status: DataStatus.PENDING
                            }
                        }
                    },
                    include: {
                        githubData: true,
                        contractsData: true,
                        onchainData: true
                    }
                });
                await analyzeQueue.addToQueue(request);
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
                res.status(200).json({
                    success: true,
                    data: {
                        userData: user.githubData?.userInfo,
                        userRepoData: user.githubData?.repos,
                        organizations: user.githubData?.orgs,
                        contributionData: user.githubData?.languagesData,
                        contractsDeployed: user.contractsData?.contracts,
                        onchainHistory: user.onchainData?.history
                    }
                });
                return;
            }

            // If data needs updating, add to queue
            await analyzeQueue.addToQueue(request);
            res.status(202).json({
                success: true,
                data: {
                    message: "Data update queued",
                    status: "PROCESSING"
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async checkProcessingStatus(req: Request, res: Response): Promise<void> {
        try {
            const githubUsername = req.params.githubUsername;
            
            const user = await prisma.user.findFirst({
                where: { githubId: githubUsername },
                include: {
                    githubData: true,
                    contractsData: true,
                    onchainData: true
                }
            });

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: "User not found"
                });
                return;
            }

            // Check if any data type has failed
            const hasFailed = [
                user.githubData?.status,
                user.contractsData?.status,
                user.onchainData?.status
            ].some(status => status === DataStatus.FAILED);

            if (hasFailed) {
                res.status(200).json({
                    success: false,
                    data: {
                        status: "FAILED",
                        message: "Data processing failed",
                        details: {
                            githubData: user.githubData?.status,
                            contractsData: user.contractsData?.status,
                            onchainData: user.onchainData?.status
                        }
                    }
                });
                return;
            }

            // Check if all data types are completed
            const isCompleted = [
                user.githubData?.status,
                user.contractsData?.status,
                user.onchainData?.status
            ].every(status => status === DataStatus.COMPLETED);

            if (isCompleted) {
                res.status(200).json({
                    success: true,
                    data: {
                        status: "COMPLETED",
                        userData: user.githubData?.userInfo,
                        userRepoData: user.githubData?.repos,
                        organizations: user.githubData?.orgs,
                        contributionData: user.githubData?.languagesData,
                        contractsDeployed: user.contractsData?.contracts,
                        onchainHistory: user.onchainData?.history
                    }
                });
                return;
            }

            // If still processing, return current status
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
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async getETHGlobalCredentials(req: Request, res: Response): Promise<void> {
        try {
            const address = req.params.address;
            const credentials = await OnchainDataManager.getETHGlobalCredentials(address);
            console.log(credentials);
            res.status(200).json(credentials);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }
    
} 