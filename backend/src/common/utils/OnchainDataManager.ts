import { Alchemy, AssetTransfersCategory, Network } from 'alchemy-sdk';
import { checkCommunityPacks, checkFinalistPacks } from './ethglobalCred';
import { getPOAPCredentials } from './poapCredentials';
import axios from 'axios';

interface PriceCache {
    price: number;
    timestamp: number;
}

interface HackerCredentialsResponse {
    HACKER: {
        count: number;
        packs: any[];
    };
    WINS: {
        count: number;
        packs: any[];
    };
    totalPoaps: number;
}

export class OnchainDataManager {
    private alchemy: Alchemy;
    private network: Network;
    private readonly MAX_RETRIES = 10;
    private readonly INITIAL_DELAY = 1000; // 3 second
    private readonly BLOCK_RETRIES = 4; // Specific retries for getBlock
    private static priceCache: Record<string, PriceCache> = {}; // Cache for crypto prices
    private static readonly CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds
    private cryptoCompareApiKey: string;

    constructor(apiKey: string, cryptoCompareApiKey: string, network: Network = Network.ETH_MAINNET) {
        this.network = network;
        this.alchemy = new Alchemy({
            apiKey,
            network,
            maxRetries: 5
        });
        this.cryptoCompareApiKey = cryptoCompareApiKey;
        console.log(`[OnchainDataManager] Initialized with network: ${network}`);
    }

    /**
     * Fetches the current price of a cryptocurrency with caching
     * @param fromSymbol Symbol of the cryptocurrency to get price for (e.g. ETH)
     * @param toSymbol Symbol to convert to (e.g. USD)
     * @returns The current price
     */
    private async getCryptoPrice(fromSymbol: string, toSymbol: string = 'USD'): Promise<number> {
        const cacheKey = `${fromSymbol}-${toSymbol}`;
        const now = Date.now();
        
        // Check if we have a cached price that's still valid
        if (OnchainDataManager.priceCache[cacheKey] && 
            now - OnchainDataManager.priceCache[cacheKey].timestamp < OnchainDataManager.CACHE_EXPIRY) {
            console.log(`[getCryptoPrice] Using cached price for ${fromSymbol}-${toSymbol}: ${OnchainDataManager.priceCache[cacheKey].price}`);
            return OnchainDataManager.priceCache[cacheKey].price;
        }

        // Fetch new price from API
        try {
            console.log(`[getCryptoPrice] Fetching fresh price for ${fromSymbol}-${toSymbol}`);
            const response = await axios.get(`https://min-api.cryptocompare.com/data/price`, {
                params: {
                    fsym: fromSymbol,
                    tsyms: toSymbol,
                    api_key: this.cryptoCompareApiKey
                }
            });

            const price = response.data[toSymbol];
            
            // Cache the new price
            OnchainDataManager.priceCache[cacheKey] = {
                price,
                timestamp: now
            };
            
            console.log(`[getCryptoPrice] Updated price for ${fromSymbol}-${toSymbol}: ${price}`);
            return price;
        } catch (error) {
            console.error(`[getCryptoPrice] Error fetching price for ${fromSymbol}-${toSymbol}:`, error);
            
            // If we have an outdated cache, use it as fallback
            if (OnchainDataManager.priceCache[cacheKey]) {
                console.log(`[getCryptoPrice] Using outdated cache as fallback for ${fromSymbol}-${toSymbol}`);
                return OnchainDataManager.priceCache[cacheKey].price;
            }
            
            // Otherwise, return a default value (or throw an error)
            return 0;
        }
    }

    /**
     * Helper function to convert crypto amount to USD value
     * @param amount Amount in crypto
     * @param symbol Symbol of the cryptocurrency (e.g. ETH)
     * @returns The value in USD
     */
    private async convertToUsd(amount: number, symbol: string): Promise<number> {
        const price = await this.getCryptoPrice(symbol);
        return amount * price;
    }

    /**
     * Helper function to generate random block data from the past 2 years
     */
    private getRandomBlockData() {
        const now = Math.floor(Date.now() / 1000);
        const twoYearsAgo = now - (2 * 365 * 24 * 60 * 60);
        const randomTimestamp = Math.floor(Math.random() * (now - twoYearsAgo) + twoYearsAgo);
        return {
            timestamp: randomTimestamp.toString(),
            date: new Date(randomTimestamp * 1000).toISOString()
        };
    }

    /**
     * Helper function to retry API calls with exponential backoff
     */
    private async retryWithBackoff<T>(
        operation: () => Promise<T>,
        operationName: string,
        customRetries?: number
    ): Promise<T> {
        let lastError: any;
        let delay = this.INITIAL_DELAY;
        const retries = customRetries || this.MAX_RETRIES;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await operation();
            } catch (error: any) {
                lastError = error;
                console.log(`[${operationName}] Attempt ${attempt} failed with status ${error}. Retrying in ${delay}ms...`);
                
                // Special handling for getBlock after max retries
                if (operationName.startsWith('getBlock-') && attempt === retries) {
                    console.log(`[${operationName}] All ${retries} attempts failed. Using random block data.`);
                    return this.getRandomBlockData() as T;
                }
                
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            }
        }

        // If we've exhausted all retries and it's not a getBlock operation, throw the last error
        console.error(`[${operationName}] All ${retries} attempts failed`);
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
                                    `getBlock-${transfer.blockNum}`,
                                    this.BLOCK_RETRIES
                                );
                                return {
                                    ...transfer,
                                    timestamp: block.timestamp,
                                    date: new Date(Number(block.timestamp) * 1000).toISOString(),
                                    isTestnet: this.network.toString().includes("sepolia")
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
                                    `getBlock-${transfer.blockNum}`,
                                    this.BLOCK_RETRIES
                                );
                                return {
                                    ...transfer,
                                    timestamp: block.timestamp,
                                    date: new Date(Number(block.timestamp) * 1000).toISOString(),
                                    isTestnet: this.network.toString().includes("sepolia")
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
                                    `getBlock-${transfer.blockNum}`,
                                    this.BLOCK_RETRIES
                                );
                                return {
                                    ...transfer,
                                    timestamp: block.timestamp,
                                    date: new Date(Number(block.timestamp) * 1000).toISOString(),
                                    isTestnet: this.network.toString().includes("sepolia")
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
                                    `getBlock-${transfer.blockNum}`,
                                    this.BLOCK_RETRIES
                                );
                                return {
                                    ...transfer,
                                    timestamp: block.timestamp,
                                    date: new Date(Number(block.timestamp) * 1000).toISOString(),
                                    isTestnet: this.network.toString().includes("sepolia")
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

            // Legitimate token addresses for TVL calculation
            const legitimateTokens = {
                // Base Mainnet tokens
                [Network.BASE_MAINNET]: {
                    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                    WETH: '0x4200000000000000000000000000000000000006'
                },
                // Ethereum Mainnet tokens
                [Network.ETH_MAINNET]: {
                    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                    WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7'
                }
            };

            // Get detailed metrics for each contract
            const contractsWithMetrics = await Promise.all(
                contractAddresses.map(async (contract) => {
                    try {
                        // Get deployment block for timestamp
                        const block = await this.retryWithBackoff(
                            () => this.alchemy.core.getBlock(contract.blockNumber),
                            `getBlock-${contract.blockNumber}`,
                            this.BLOCK_RETRIES
                        );
                        const deploymentDate = new Date(Number(block.timestamp) * 1000).toISOString();

                        // Get all transfers to/from the contract to calculate unique users and TVL
                        const isTestnet = this.network.toString().includes("sepolia");
                        
                        // For testnets, only consider ETH transfers
                        const categories = isTestnet 
                            ? [AssetTransfersCategory.EXTERNAL] 
                            : [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20];
                            
                        const transfers = await this.retryWithBackoff(
                            () => this.alchemy.core.getAssetTransfers({
                                fromBlock: `0x${contract.blockNumber.toString(16)}`,
                                toBlock: 'latest',
                                toAddress: contract.address,
                                category: categories,
                            }),
                            `getAssetTransfers-contract-${contract.address}`
                        );

                        // Calculate unique users
                        const uniqueAddresses = new Set();
                        transfers.transfers.forEach(transfer => {
                            uniqueAddresses.add(transfer.from);
                        });

                        // Calculate TVL (sum of all incoming transfers converted to USD)
                        let tvlInEth = 0;
                        let tvlInUsd = 0;
                        
                        // Process all transfers and calculate values
                        for (const transfer of transfers.transfers) {
                            if (isTestnet) {
                                // For testnet, only consider ETH transfers
                                if (transfer.asset === 'ETH' && transfer.value) {
                                    const ethValue = Number(transfer.value);
                                    tvlInEth += ethValue;
                                }
                            } else {
                                // For mainnet, only consider specified legitimate tokens
                                const networkTokens = legitimateTokens[this.network as keyof typeof legitimateTokens];
                                if (networkTokens) {
                                    // For native ETH transfers
                                    if (transfer.asset === 'ETH' && transfer.value) {
                                        const ethValue = Number(transfer.value);
                                        tvlInEth += ethValue;
                                    }
                                    // For ERC20 token transfers, check contract address
                                    else if (transfer.rawContract && transfer.rawContract.address && transfer.value) {
                                        const tokenAddress = transfer.rawContract.address.toLowerCase();
                                        const isLegitToken = Object.entries(networkTokens)
                                            .some(([symbol, addr]) => addr.toLowerCase() === tokenAddress);
                                        
                                        if (isLegitToken) {
                                            // For simplicity, we're adding up token values directly
                                            // In a real-world scenario, you'd need to account for token decimals
                                            // and convert each token to USD at its own exchange rate
                                            tvlInEth += Number(transfer.value);
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Convert the TVL from ETH to USD
                        if (tvlInEth > 0) {
                            tvlInUsd = await this.convertToUsd(tvlInEth, 'ETH');
                        }

                        // Get total number of transactions
                        const totalTransactions = transfers.transfers.length;

                        return {
                            address: contract.address,
                            blockNumber: contract.blockNumber,
                            deploymentDate,
                            uniqueUsers: uniqueAddresses.size,
                            tvl: tvlInUsd.toString(),
                            totalTransactions,
                            isTestnet
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

    static async getHackerCredentials(address: string): Promise<HackerCredentialsResponse> {
        console.log("Getting hackathon credentials for", address);
        
        // Run all checks in parallel
        const [communityPacksResult, finalistPacksResult, poapCredentials] = await Promise.all([
            checkCommunityPacks(address),
            checkFinalistPacks(address),
            getPOAPCredentials(address)
        ]);

        console.log("communityPacksResult", communityPacksResult);
        console.log("finalistPacksResult", finalistPacksResult);
        console.log("poapCredentials", poapCredentials);
        console.log(poapCredentials.hackerExperience.results)
        return {
            HACKER: {
                count: communityPacksResult.count + poapCredentials.hackerExperienceCount,
                packs: [...communityPacksResult.results, ...poapCredentials.hackerExperience.results]
            },
            WINS: {
                count: finalistPacksResult.count + poapCredentials.hackathonWinsCount,
                packs: [...finalistPacksResult.results, ...poapCredentials.hackathonWins.results]
            },
            totalPoaps: poapCredentials.totalPoaps
        };
    }

        /**
     * Helper function to get the current block number
     */
    async getHalfBlock(): Promise<string> {
        try {
            console.log(`[getCurrentBlock] Getting current block number`);
            const blockNumber = await this.retryWithBackoff(
                () => this.alchemy.core.getBlockNumber(),
                'getCurrentBlock'
            );
            const halfBlockNumber = Math.floor(blockNumber / 2);
            return `0x${halfBlockNumber.toString(16)}`;
        } catch (error) {
            console.error('[getCurrentBlock] Error getting current block number:', error);
            throw error;
        }
    }
} 