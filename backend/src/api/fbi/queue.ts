import QueueManager from "@/common/utils/Queue";
import { FbiService } from "./fbiService";
import { Job } from 'bullmq';
import { env } from "@/common/utils/envConfig";
import { Logger } from '@/common/utils/logger';

Logger.info('AnalyzeQueue', 'Initializing queue with Redis host and port', { host: env.REDIS_HOST, port: env.REDIS_PORT });
export const analyzeQueue = new QueueManager("analyzeQueue", 
    {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD ,
        defaultJobOptions: {
            attempts: 6,  // Number of retry attempts
            backoff: {
                type: 'exponential',
                delay: 10000  // Initial delay in ms
            }
        }
    }
)

const fbiService = new FbiService()

const analyzeQueueJobProcessor = async (job: Job) => {
    try {
        Logger.info('AnalyzeQueue', `Processing job`, { jobId: job.id, data: job.data });
        const data = job.data;
        const forceRefresh = data.forceRefresh || false;
        await fbiService.processUserData(data, forceRefresh);
        Logger.info('AnalyzeQueue', `Successfully processed job`, { jobId: job.id });
        return { success: true }
    } catch (error) {
        Logger.error('AnalyzeQueue', `Error processing job`, { jobId: job.id, error });
        // If we want to retry the job, we can throw the error
        // BullMQ will automatically retry based on the queue configuration
        throw error
    }
}

export const registerAnalyzeWorkers = async () => {
    Logger.info('AnalyzeQueue', 'Registering worker for analyzeQueue');
    analyzeQueue.registerWorker(analyzeQueueJobProcessor, {
        concurrency: 5
    })
}



