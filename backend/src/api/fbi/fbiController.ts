import { Request, Response } from 'express';
import { FbiService } from './fbiService';
import { AnalyzeUserRequest } from './fbiModel';
import { analyzeQueue } from '@/queues';

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

            
            analyzeQueue.addToQueue(request)
            const result = await this.fbiService.analyzeUser(request);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }
} 