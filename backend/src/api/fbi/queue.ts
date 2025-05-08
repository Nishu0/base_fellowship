import QueueManager from "@/common/utils/Queue";
import { FbiService } from "./fbiService";
import { Job } from 'bullmq';
import { env } from "@/common/utils/envConfig";


export const analyzeQueue = new QueueManager("analyzeQueue", 
    {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        defaultJobOptions: {
            attempts: 3,  // Number of retry attempts
            backoff: {
                type: 'exponential',
                delay: 1000  // Initial delay in ms
            }
        }
    }
)

const fbiService = new FbiService()

const analyzeQueueJobProcessor = async (job: Job) => {
    try {
        const data = job.data
        await fbiService.processUserData(data)
        return { success: true }
    } catch (error) {
        console.error(`Error processing job ${job.id}:`, error)
        // If we want to retry the job, we can throw the error
        // BullMQ will automatically retry based on the queue configuration
        throw error
    }
}

export const registerAnalyzeWorkers = async () => {
    analyzeQueue.registerWorker(analyzeQueueJobProcessor)
}



