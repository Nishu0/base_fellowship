import { Alchemy, AssetTransfersCategory, Network } from 'alchemy-sdk';

export class OnchainDataManager {
    private alchemy: Alchemy;
    private network: Network;

    constructor(apiKey: string, network: Network = Network.ETH_MAINNET) {
        this.network = network;
        this.alchemy = new Alchemy({
            apiKey,
            network,
        });
        console.log(`[OnchainDataManager] Initialized with network: ${network}`);
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
                const transfersForAddress = await this.alchemy.core.getAssetTransfers({
                    fromBlock: fromBlock?.toString(),
                    toBlock: toBlock?.toString(),
                    fromAddress: address,
                    excludeZeroValue: false,
                    category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC1155, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.INTERNAL],
                });

                console.log("response: ",transfersForAddress);

                if (transfersForAddress.transfers) {
                    console.log(`[getTransfersForAddresses] Found ${transfersForAddress.transfers.length} outgoing transfers for ${address}`);
                    transfers.push(...transfersForAddress.transfers);
                }

                // Also get transfers to this address
                console.log(`[getTransfersForAddresses] Fetching incoming transfers for ${address}`);
                const transfersToAddress = await this.alchemy.core.getAssetTransfers({
                    fromBlock: fromBlock?.toString(),
                    toBlock: toBlock?.toString(),
                    toAddress: address,
                    category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.INTERNAL, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
                });

                if (transfersToAddress.transfers) {
                    console.log(`[getTransfersForAddresses] Found ${transfersToAddress.transfers.length} incoming transfers for ${address}`);
                    transfers.push(...transfersToAddress.transfers);
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
            const code = await this.alchemy.core.getCode(address);
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
     * @returns Array of contract addresses with their deployment details
     */
    async getContractsDeployedByAddress(
        deployerAddress: string,
        startBlock: number | string,
        endBlock: number | string
    ): Promise<Array<{ address: string; blockNumber: number; }>> {
        try {
            console.log(`[getContractsDeployedByAddress] Starting contract search for deployer: ${deployerAddress}`);
            console.log(`[getContractsDeployedByAddress] Block range: ${startBlock} to ${endBlock}`);
            
            let transfers: any[] = [];
            // Get all transactions from the deployer address
            console.log(`[getContractsDeployedByAddress] Fetching transactions for ${deployerAddress}`);
            const response = await this.alchemy.core.getAssetTransfers({
                fromBlock: startBlock.toString(),
                toBlock: endBlock.toString(),
                fromAddress: deployerAddress,
                excludeZeroValue: false,
                category: [AssetTransfersCategory.EXTERNAL],
                withMetadata: true
            });

            transfers = response.transfers;

            const deployments = transfers.filter((transfer) => transfer.to === null);
            const txHashes = deployments.map((deployment) => deployment.hash);

            console.log("response: ",deployments[1]);

            const promises = txHashes.map((hash) =>
                this.alchemy.core.getTransactionReceipt(hash)
            );


            const receipts = await Promise.all(promises);
            const contractAddresses: Array<{ address: string; blockNumber: number;}> = receipts.map((receipt) => ({address: receipt?.contractAddress || "", blockNumber : receipt?.blockNumber || 0}));
            console.log(`Found ${contractAddresses?.length || 0} Contracts deployed by ${deployerAddress}`);

            return contractAddresses;

            // const deployedContracts: Array<{ address: string; blockNumber: number; code: string }> = [];

            // // Process each transaction
            // for (const transfer of transfers.transfers || []) {
            //     try {
            //         console.log(`[getContractsDeployedByAddress] Processing transaction: ${transfer.hash}`);
                    
            //         // Get the transaction receipt to check if it's a contract creation
            //         const receipt = await this.alchemy.core.getTransactionReceipt(transfer.hash);
                    
            //         if (receipt && receipt.contractAddress) {
            //             console.log(`[getContractsDeployedByAddress] Found contract deployment at address: ${receipt.contractAddress}`);
            //             console.log(`[getContractsDeployedByAddress] Contract deployed in block: ${receipt.blockNumber}`);
                        
            //             // Get the contract code
            //             console.log(`[getContractsDeployedByAddress] Fetching contract code for ${receipt.contractAddress}`);
            //             const code = await this.alchemy.core.getCode(receipt.contractAddress);
                        
            //             // Only include if it's a contract (code length > 2)
            //             if (code !== '0x') {
            //                 console.log(`[getContractsDeployedByAddress] Valid contract found at ${receipt.contractAddress}`);
            //                 console.log(`[getContractsDeployedByAddress] Contract code length: ${code.length}`);
                            
            //                 deployedContracts.push({
            //                     address: receipt.contractAddress,
            //                     blockNumber: receipt.blockNumber,
            //                     code: code
            //                 });
            //                 console.log(`[getContractsDeployedByAddress] Added contract to results: ${receipt.contractAddress}`);
            //             } else {
            //                 console.log(`[getContractsDeployedByAddress] Skipping empty contract at ${receipt.contractAddress}`);
            //             }
            //         } else {
            //             console.log(`[getContractsDeployedByAddress] Transaction ${transfer.hash} is not a contract deployment`);
            //         }
            //     } catch (error) {
            //         console.error(`[getContractsDeployedByAddress] Error processing transaction ${transfer.hash}:`, error);
            //         continue;
            //     }
            // }

            // console.log(`[getContractsDeployedByAddress] Search completed. Found ${deployedContracts.length} contracts deployed by ${deployerAddress}`);
            // console.log(`[getContractsDeployedByAddress] Contract addresses:`, deployedContracts.map(c => c.address));
            // return deployedContracts;
        } catch (error) {
            console.error('[getContractsDeployedByAddress] Error fetching deployed contracts:', error);
            throw error;
        }
    }
} 