import QueueManager from "@/common/utils/Queue";
import { FbiService } from "./fbiService";
import { Job } from 'bullmq';


export const analyzeQueue = new QueueManager("analyzeQueue", 
    {
        host: "localhost",
        port: 6379
    }
)

const fbiService = new FbiService()

const analyzeQueueJobProcessor = async (job: Job) => {
    const data = job.data
    fbiService.processUserData(data)
}

export const registerAnalyzeWorkers = async () => {
    analyzeQueue.registerWorker(analyzeQueueJobProcessor)
}



