import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'https://api.klyro.dev/fbi'; // Default to localhost

interface TestUser {
    githubUsername: string;
    addresses: string[];
}

const testUsers: TestUser[] = [
    {
        githubUsername: 'VitalikButerin',
        addresses: ['vitalik.eth']
    },
    {
        githubUsername: 'haydenadams',
        addresses: ['hayden.eth']
    },
    {
        githubUsername: 'gakonst', // Georgios Konstantopoulos (Foundry)
        addresses: ['gakonst.eth']
    },
    {
        githubUsername: 'banteg', // Andre Cronje (Yearn) - often associated with, or use banteg for some things.
        addresses: ['banteg.eth']
    },
    {
        githubUsername: 'StaniKulechov', // Stani Kulechov (Aave)
        addresses: ['stani.eth']
    },
    {
        githubUsername: 'tayvano', // Taylor Monahan (MyCrypto/MEW)
        addresses: ['tay.eth']
    },
    {
        githubUsername: 'sassal', // Anthony Sassano
        addresses: ['sassal.eth']
    },
    // Adding a user with only a 0x address to test that case
    {
        githubUsername: 'randomGithubUserForTest123', // A placeholder, assuming this user might not exist on GitHub for a specific test type
        addresses: ['0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326'] // ENS DAO Timelock
    }
];

const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_POLLS = 24; // Max 2 minutes of polling (24 * 5s = 120s)
const CONCURRENT_REQUESTS = 3; // Number of users to process concurrently

async function analyzeAndCheckStatus(user: TestUser): Promise<void> {
    const analyzeUrl = `${API_BASE_URL}/analyze-user`;
    const statusUrl = `${API_BASE_URL}/status/${user.githubUsername}`;
    const startTime = Date.now();

    try {
        console.log(`[${user.githubUsername}] Submitting for analysis...`);
        const analyzeResponse = await axios.post(analyzeUrl, {
            githubUsername: user.githubUsername,
            addresses: user.addresses
        });
        console.log(`[${user.githubUsername}] Analysis request submitted: ${analyzeResponse.status} - ${analyzeResponse.data.data?.message || analyzeResponse.data.status}`);

        if (analyzeResponse.status !== 202 && analyzeResponse.status !== 200) {
            console.error(`[${user.githubUsername}] Failed to submit analysis. Status: ${analyzeResponse.status}`);
            return;
        }

        let pollCount = 0;
        let processingComplete = false;

        console.log(`[${user.githubUsername}] Polling status...`);
        while (pollCount < MAX_POLLS && !processingComplete) {
            pollCount++;
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));

            try {
                const statusResponse = await axios.get(statusUrl);
                const statusData = statusResponse.data.data;

                if (statusResponse.status === 200) {
                    if (statusData.status === 'COMPLETED') {
                        processingComplete = true;
                        const endTime = Date.now();
                        console.log(`[${user.githubUsername}] Processing COMPLETED. Data fetched. Time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
                        // console.log(`[${user.githubUsername}] Data:`, JSON.stringify(statusData, null, 2));
                    } else if (statusData.status === 'PROCESSING') {
                        console.log(`[${user.githubUsername}] Status: PROCESSING (Poll ${pollCount}/${MAX_POLLS}). Progress: ${JSON.stringify(statusData.progress)}`);
                    } else {
                        console.warn(`[${user.githubUsername}] Status: ${statusData.status} (Poll ${pollCount}/${MAX_POLLS})`);
                    }
                } else {
                    console.warn(`[${user.githubUsername}] Error polling status: ${statusResponse.status} (Poll ${pollCount}/${MAX_POLLS})`);
                }
            } catch (pollError: any) {
                console.error(`[${user.githubUsername}] Error during status poll: ${pollError.message} (Poll ${pollCount}/${MAX_POLLS})`);
                if (pollError.response) {
                    console.error(`[${user.githubUsername}] Poll Error Response:`, pollError.response.data);
                }
            }
        }

        if (!processingComplete) {
            const endTime = Date.now();
            console.warn(`[${user.githubUsername}] Processing did not complete within the timeout. Last status check after ${((endTime - startTime) / 1000).toFixed(2)}s.`);
        }

    } catch (error: any) {
        const endTime = Date.now();
        console.error(`[${user.githubUsername}] Error during analysis for ${user.githubUsername} after ${((endTime - startTime) / 1000).toFixed(2)}s: ${error.message}`);
        if (error.response) {
            console.error(`[${user.githubUsername}] Error Response:`, error.response.data);
        }
    }
}

async function runLoadTest() {
    console.log(`Starting load test with ${testUsers.length} users against API: ${API_BASE_URL}`);
    console.log(`Polling interval: ${POLLING_INTERVAL / 1000}s, Max polls: ${MAX_POLLS}`);
    console.log(`Concurrent requests: ${CONCURRENT_REQUESTS}`);
    console.log("---");

    const userPromises = [];
    for (let i = 0; i < testUsers.length; i += CONCURRENT_REQUESTS) {
        const batch = testUsers.slice(i, i + CONCURRENT_REQUESTS);
        const batchPromises = batch.map(user => analyzeAndCheckStatus(user));
        await Promise.all(batchPromises); // Wait for the current batch to complete before starting the next
        if (i + CONCURRENT_REQUESTS < testUsers.length) {
            console.log("--- Next batch ---");
        }
    }

    console.log("---");
    console.log("Load test finished.");
}

runLoadTest().catch(error => {
    console.error("Critical error in load test execution:", error);
});

// To run this script:
// 1. Ensure you have ts-node and axios installed:
//    npm install --save-dev ts-node axios typescript
//    OR
//    yarn add --dev ts-node axios typescript
// 2. Compile and run or run directly:
//    npx ts-node scripts/loadTest.ts
//
// To set a custom API URL:
// API_URL=http://your-backend-url.com/api/fbi npx ts-node scripts/loadTest.ts 