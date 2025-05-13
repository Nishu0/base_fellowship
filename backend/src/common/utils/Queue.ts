import { Queue, Worker, Job, JobsOptions, WorkerOptions } from 'bullmq';

import {v4 as uuid} from "uuid";

interface QueueConfig {
    host: string;
    port?: number;
    password?: string;
    db?: number;
    defaultJobOptions?: {
        attempts?: number;
        backoff?: {
            type: 'fixed' | 'exponential';
            delay: number;
        };
    };
}

interface JobData {
    [key: string]: any;
}

class QueueManager {
    private queue: Queue;
    private queueName: string;
    private worker: Worker | null = null;

    constructor(queueName: string, config: QueueConfig) {
        this.queueName = queueName;
        this.queue = new Queue(queueName, {
            connection: {
                host: config.host,
                port: config.port,
                password: config.password,
                db: config.db,
            },
            defaultJobOptions: config.defaultJobOptions
        });
    }

    /**
     * Add a job to the queue
     * @param data - The data to be processed
     * @param options - Optional job options
     * @returns Promise<Job>
     */
    async addToQueue(data: JobData, options?: JobsOptions): Promise<Job> {
        try {
            const jobId = uuid();
            console.log(`Adding job ${jobId} to queue ${this.queueName}`);
            return await this.queue.add(jobId, data, options);
        } catch (error) {
            console.error(`Error adding job to queue: ${error}`);
            throw error;
        }
    }

    /**
     * Register a worker to process jobs
     * @param processor - The function to process jobs
     * @param options - Optional worker options
     */
    async registerWorker(processor: (job: Job) => Promise<any>, options?: any): Promise<void> {
        console.log(this.queueName , "Worker Registered..")
        try {
            this.worker = new Worker(this.queueName, processor, {
                connection: this.queue.opts.connection,
                ...options,
            });

            this.worker.on('completed', (job) => {
                console.log(`Job ${job.id} completed successfully`);
            });

            this.worker.on('failed', (job, error) => {
                console.error(`Job ${job?.id} failed: ${error}`);
            });

            this.worker.on('error', (error) => {
                console.error(`Worker error: ${error}`);
            });
        } catch (error) {
            console.error(`Error registering worker: ${error}`);
            throw error;
        }
    }

    /**
     * Pause the queue
     */
    async pauseQueue(): Promise<void> {
        try {
            await this.queue.pause();
            console.log(`Queue ${this.queueName} paused`);
        } catch (error) {
            console.error(`Error pausing queue: ${error}`);
            throw error;
        }
    }

    /**
     * Resume the queue
     */
    async resumeQueue(): Promise<void> {
        try {
            await this.queue.resume();
            console.log(`Queue ${this.queueName} resumed`);
        } catch (error) {
            console.error(`Error resuming queue: ${error}`);
            throw error;
        }
    }

    /**
     * Get queue status
     */
    async getQueueStatus(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
    }> {
        try {
            const [waiting, active, completed, failed] = await Promise.all([
                this.queue.getWaitingCount(),
                this.queue.getActiveCount(),
                this.queue.getCompletedCount(),
                this.queue.getFailedCount(),
            ]);

            return { waiting, active, completed, failed };
        } catch (error) {
            console.error(`Error getting queue status: ${error}`);
            throw error;
        }
    }

    /**
     * Clean up resources
     */
    async cleanup(): Promise<void> {
        try {
            if (this.worker) {
                await this.worker.close();
            }
            await this.queue.close();
            console.log(`Queue ${this.queueName} and worker cleaned up`);
        } catch (error) {
            console.error(`Error during cleanup: ${error}`);
            throw error;
        }
    }
}

export default QueueManager;