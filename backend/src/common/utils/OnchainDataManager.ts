import { Alchemy, AssetTransfersCategory, Network } from 'alchemy-sdk';
import { checkCommunityPacks, checkFinalistPacks } from './ethglobalCred';

export class OnchainDataManager {
    private alchemy: Alchemy;
    private network: Network;
    private readonly MAX_RETRIES = 3;
    private readonly INITIAL_DELAY = 1000; // 1 second

    constructor(apiKey: string, network: Network = Network.ETH_MAINNET) {
        this.network = network;
        this.alchemy = new Alchemy({
            apiKey,
            network,
        });
        console.log(`[OnchainDataManager] Initialized with network: ${network}`);
    }

    /**
     * Helper function to retry API calls with exponential backoff
     * @param operation The async operation to retry
     * @param operationName Name of the operation for logging
     */
    private async retryWithBackoff<T>(
        operation: () => Promise<T>,
        operationName: string
    ): Promise<T> {
        let lastError: any;
        let delay = this.INITIAL_DELAY;

        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                return await operation();
            } catch (error: any) {
                lastError = error;
                console.log(`[${operationName}] Attempt ${attempt} failed with status ${error.status}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
              
            }
        }

        // If we've exhausted all retries, throw the last error
        console.error(`[${operationName}] All ${this.MAX_RETRIES} attempts failed`);
        throw lastError;
    }

    /**
     * Fetch all transfers for a given array of addresses
     * @param addresses Array of addresses to fetch transfers for
     * @param fromBlock Starting block number (optional)
     * @param toBlock Ending block number (optional)
     */
    async getOnchainHistoryForAddresses(
        addresses: string[],
        fromBlock?: number | string,
        toBlock?: number | string
    ): Promise<any[]> {
        try {
            console.log(`[getTransfersForAddresses] Starting transfer fetch for ${addresses.length} addresses`);
            console.log(`[getTransfersForAddresses] Block range: ${fromBlock || 'start'} to ${toBlock || 'latest'}`);
            
            const transfers: any[] = [];
            
            for (const address of addresses) {
                console.log(`[getTransfersForAddresses] Processing address: ${address}`);
                
                // Get all transfers for the address
                console.log(`[getTransfersForAddresses] Fetching outgoing transfers for ${address}`);

                if(this.network.includes("sepolia") || this.network === Network.BASE_MAINNET){
                    const transfersForAddress = await this.retryWithBackoff(
                        () => this.alchemy.core.getAssetTransfers({
                            fromBlock: fromBlock?.toString(),
                            toBlock: toBlock?.toString(),
                            fromAddress: address,
                            excludeZeroValue: false,
                            category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC1155, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721],
                        }),
                        `getAssetTransfers-outgoing-${address}`
                    );
    
                    if (transfersForAddress.transfers) {
                        console.log(`[getTransfersForAddresses] Found ${transfersForAddress.transfers.length} outgoing transfers for ${address}`);
                        // Add block information to each transfer
                        const transfersWithDates = await Promise.all(
                            transfersForAddress.transfers.map(async (transfer) => {
                                const block = await this.retryWithBackoff(
                                    () => this.alchemy.core.getBlock(transfer.blockNum),
                                    `getBlock-${transfer.blockNum}`
                                );
                                return {
                                    ...transfer,
                                    timestamp: block.timestamp,
                                    date: new Date(Number(block.timestamp) * 1000).toISOString()
                                };
                            })
                        );
                        transfers.push(...transfersWithDates);
                    }
                } else {
                    const transfersForAddress = await this.retryWithBackoff(
                        () => this.alchemy.core.getAssetTransfers({
                            fromBlock: fromBlock?.toString(),
                            toBlock: toBlock?.toString(),
                            fromAddress: address,
                            excludeZeroValue: false,
                            category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC1155, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.INTERNAL],
                        }),
                        `getAssetTransfers-outgoing-${address}`
                    );
    
                    if (transfersForAddress.transfers) {
                        console.log(`[getTransfersForAddresses] Found ${transfersForAddress.transfers.length} outgoing transfers for ${address}`);
                        // Add block information to each transfer
                        const transfersWithDates = await Promise.all(
                            transfersForAddress.transfers.map(async (transfer) => {
                                const block = await this.retryWithBackoff(
                                    () => this.alchemy.core.getBlock(transfer.blockNum),
                                    `getBlock-${transfer.blockNum}`
                                );
                                return {
                                    ...transfer,
                                    timestamp: block.timestamp,
                                    date: new Date(Number(block.timestamp) * 1000).toISOString()
                                };
                            })
                        );
                        transfers.push(...transfersWithDates);
                    }
                }

                // Also get transfers to this address
                console.log(`[getTransfersForAddresses] Fetching incoming transfers for ${address}`);

                if(this.network.includes("sepolia") || this.network === Network.BASE_MAINNET){
                    const transfersToAddress = await this.retryWithBackoff(
                        () => this.alchemy.core.getAssetTransfers({
                            fromBlock: fromBlock?.toString(),
                            toBlock: toBlock?.toString(),
                            toAddress: address,
                            category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
                        }),
                        `getAssetTransfers-incoming-${address}`
                    );
    
                    if (transfersToAddress.transfers) {
                        console.log(`[getTransfersForAddresses] Found ${transfersToAddress.transfers.length} incoming transfers for ${address}`);
                        // Add block information to each transfer
                        const transfersWithDates = await Promise.all(
                            transfersToAddress.transfers.map(async (transfer) => {
                                const block = await this.retryWithBackoff(
                                    () => this.alchemy.core.getBlock(transfer.blockNum),
                                    `getBlock-${transfer.blockNum}`
                                );
                                return {
                                    ...transfer,
                                    timestamp: block.timestamp,
                                    date: new Date(Number(block.timestamp) * 1000).toISOString()
                                };
                            })
                        );
                        transfers.push(...transfersWithDates);
                    }
                } else {
                    const transfersToAddress = await this.retryWithBackoff(
                        () => this.alchemy.core.getAssetTransfers({
                            fromBlock: fromBlock?.toString(),
                            toBlock: toBlock?.toString(),
                            toAddress: address,
                            category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.INTERNAL, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
                        }),
                        `getAssetTransfers-incoming-${address}`
                    );
    
                    if (transfersToAddress.transfers) {
                        console.log(`[getTransfersForAddresses] Found ${transfersToAddress.transfers.length} incoming transfers for ${address}`);
                        // Add block information to each transfer
                        const transfersWithDates = await Promise.all(
                            transfersToAddress.transfers.map(async (transfer) => {
                                const block = await this.retryWithBackoff(
                                    () => this.alchemy.core.getBlock(transfer.blockNum),
                                    `getBlock-${transfer.blockNum}`
                                );
                                return {
                                    ...transfer,
                                    timestamp: block.timestamp,
                                    date: new Date(Number(block.timestamp) * 1000).toISOString()
                                };
                            })
                        );
                        transfers.push(...transfersWithDates);
                    }
                }
            }

            console.log(`[getTransfersForAddresses] Completed. Retrieved ${transfers.length} total transfers`);
            return transfers;
        } catch (error) {
            console.error('[getTransfersForAddresses] Error fetching transfers:', error);
            throw error;
        }
    }

    /**
     * Get contract code for a given address
     * @param address Contract address
     */
    async getContractCode(address: string): Promise<string> {
        try {
            console.log(`[getContractCode] Fetching code for contract: ${address}`);
            const code = await this.retryWithBackoff(
                () => this.alchemy.core.getCode(address),
                `getContractCode-${address}`
            );
            console.log(`[getContractCode] Retrieved code for ${address}. Code length: ${code.length}`);
            return code;
        } catch (error) {
            console.error(`[getContractCode] Error fetching contract code for ${address}:`, error);
            throw error;
        }
    }

    /**
     * Fetch all smart contracts deployed by an address within a block range
     * @param deployerAddress Address that deployed the contracts
     * @param startBlock Starting block number
     * @param endBlock Ending block number
     * @returns Array of contract addresses with their deployment details and metrics
     */
    async getContractsDeployedByAddress(
        deployerAddress: string,
        startBlock: number | string,
        endBlock: number | string
    ): Promise<Array<{
        address: string;
        blockNumber: number;
        deploymentDate: string;
        uniqueUsers: number;
        tvl: string;
        totalTransactions: number;
        isTestnet: Boolean
    }>> {
        try {
            console.log(`[getContractsDeployedByAddress] Starting contract search for deployer: ${deployerAddress}`);
            console.log(`[getContractsDeployedByAddress] Block range: ${startBlock} to ${endBlock}`);
            
            // Get all transactions from the deployer address
            console.log(`[getContractsDeployedByAddress] Fetching transactions for ${deployerAddress}`);
            const response = await this.retryWithBackoff(
                () => this.alchemy.core.getAssetTransfers({
                    fromBlock: typeof startBlock === 'number' ? `0x${startBlock.toString(16)}` : startBlock,
                    toBlock: typeof endBlock === 'number' ? `0x${endBlock.toString(16)}` : endBlock,
                    fromAddress: deployerAddress,
                    excludeZeroValue: false,
                    category: [AssetTransfersCategory.EXTERNAL],
                    withMetadata: true
                }),
                `getAssetTransfers-deployer-${deployerAddress}`
            );

            const transfers = response.transfers;
            const deployments = transfers.filter((transfer) => transfer.to === null);
            const txHashes = deployments.map((deployment) => deployment.hash);

            const receipts = await Promise.all(
                txHashes.map((hash) => this.retryWithBackoff(
                    () => this.alchemy.core.getTransactionReceipt(hash),
                    `getTransactionReceipt-${hash}`
                ))
            );

            const contractAddresses = receipts
                .filter((receipt): receipt is NonNullable<typeof receipt> => receipt !== null && receipt.contractAddress !== undefined)
                .map(receipt => ({
                    address: receipt.contractAddress,
                    blockNumber: receipt.blockNumber
                }));

            console.log(`Found ${contractAddresses?.length || 0} Contracts deployed by ${deployerAddress}`);

            // Get detailed metrics for each contract
            const contractsWithMetrics = await Promise.all(
                contractAddresses.map(async (contract) => {
                    try {
                        // Get deployment block for timestamp
                        const block = await this.retryWithBackoff(
                            () => this.alchemy.core.getBlock(contract.blockNumber),
                            `getBlock-${contract.blockNumber}`
                        );
                        const deploymentDate = new Date(Number(block.timestamp) * 1000).toISOString();

                        // Get all transfers to/from the contract to calculate unique users and TVL
                        const transfers = await this.retryWithBackoff(
                            () => this.alchemy.core.getAssetTransfers({
                                fromBlock: `0x${contract.blockNumber.toString(16)}`,
                                toBlock: 'latest',
                                toAddress: contract.address,
                                category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20],
                            }),
                            `getAssetTransfers-contract-${contract.address}`
                        );

                        // Calculate unique users
                        const uniqueAddresses = new Set();
                        transfers.transfers.forEach(transfer => {
                            uniqueAddresses.add(transfer.from);
                        });

                        // Calculate TVL (sum of all incoming transfers)
                        const tvl = transfers.transfers.reduce((acc, transfer) => {
                            return acc + (transfer.value ? Number(transfer.value) : 0);
                        }, 0).toString();

                        // Get total number of transactions
                        const totalTransactions = transfers.transfers.length;

                        return {
                            address: contract.address,
                            blockNumber: contract.blockNumber,
                            deploymentDate,
                            uniqueUsers: uniqueAddresses.size,
                            tvl,
                            totalTransactions,
                            isTestnet: this.network.toString().includes("sepolia")
                        };
                    } catch (error) {
                        console.error(`Error getting metrics for contract ${contract.address}:`, error);
                        return {
                            address: contract.address,
                            blockNumber: contract.blockNumber,
                            deploymentDate: '',
                            uniqueUsers: 0,
                            tvl: '0',
                            totalTransactions: 0,
                            isTestnet: this.network.includes("sepolia")
                        };
                    }
                })
            );

            return contractsWithMetrics;
        } catch (error) {
            console.error('[getContractsDeployedByAddress] Error fetching deployed contracts:', error);
            throw error;
        }
    }

    static async getETHGlobalCredentials(address: string): Promise<any> {
        console.log("Getting ETHGlobal credentials for", address);
        
        // Run both checks in parallel
        const [communityPacksResult, finalistPacksResult] = await Promise.all([
            checkCommunityPacks(address),
            checkFinalistPacks(address)
        ]);
        
        return {
            wallet: address,
            community: {
                count: communityPacksResult.count,
                packs: communityPacksResult.results
            },
            finalist: {
                count: finalistPacksResult.count,
                packs: finalistPacksResult.results
            },
            totalPacksCount: communityPacksResult.count + finalistPacksResult.count
        };
    }
} 