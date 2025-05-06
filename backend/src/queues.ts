import QueueManager from "./common/utils/Queue";


export const analyzeQueue = new QueueManager("analyzeQueue", 
    {
        host: "localhost",
        port: 6379
    }
)


