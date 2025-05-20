import { Network } from 'alchemy-sdk';
import { getAlchemyProvider } from './alchemyProvider';

const devfolioPacks = {
    // Base Network
    "EthSF Hackathon": {
        address: "0x2cb02ffcad9d09a08a365e7fffd166ebb369318c",
        network: "base"
    },
    "EthDenver 2025": {
        address: "0x7abe24c1568031401b2d0bad7d752779d22b1ffa",
        network: "base"
    },
    "EthIndia 2024": {
        address: "0x49a650e8f1054b556bce815b12eff7dd8d9ee",
        network: "base"
    },
    "Base Around the World Buildathon": {
        address: "0x91f311e31319fe79d6aca4a898cd6a00e12c3d23",
        network: "base"
    },
    "Onchain Summer Buildathon": {
        address: "0x59ca61566c03a7fb8e4280d97bfa2e8e691da3a6",
        network: "base"
    },
    
    // Arbitrum Network
    "Arbitrum U-Hack": {
        address: "0x2d06b90ec8a3082adea993d99bc6e354fac78b04",
        network: "arbitrum"
    },
    "EthDenver 2024": {
        address: "0x93fd88df3e2a377c0f23bf22c1cfd87047818d20",
        network: "arbitrum"
    },
    "EthMumbai": {
        address: "0xc051abb005ccf2eec5836a03f08591c22c2f3273",
        network: "arbitrum"
    },
    "EthIndia 2023": {
        address: "0xe34494de41383fbad7d1cdba6730d0e943425701",
        network: "arbitrum"
    },
    "Unfold 2023": {
        address: "0x473a55f826b4805c779450a03d8ee7f79727af99",
        network: "arbitrum"
    },
    "EthBarcelona": {
        address: "0x861f978a160270c495ff906db24afdb2199dcaf9",
        network: "arbitrum"
    },
    "EthMunich": {
        address: "0x020c3a900fdbd33795d709e2b40a1f3510fbe1fc",
        network: "arbitrum"
    },
    
    // Polygon Network
    "Ethernals": {
        address: "0x752ceec57492edb08a733284e372362c6d2ea385",
        network: "polygon"
    }
};

/**
 * Get the appropriate Alchemy network for a given network name
 */
function getNetworkForProvider(network: string): Network {
    switch (network.toLowerCase()) {
        case 'base':
            return Network.BASE_MAINNET;
        case 'arbitrum':
            return Network.ARB_MAINNET;
        case 'polygon':
            return Network.MATIC_MAINNET;
        default:
            return Network.BASE_MAINNET;
    }
}

/**
 * Check if an address owns any NFTs from the specified packs and categorize them as winners or participants
 */
async function checkPackBalances(walletAddress: string, packs: Record<string, { address: string, network: string }>) {
    const results: any[] = [];
    let count = 0;

    // Group packs by network for efficient checking
    const packsByNetwork = Object.entries(packs).reduce((acc, [name, info]) => {
        if (!acc[info.network]) {
            acc[info.network] = {};
        }
        acc[info.network][name] = info.address;
        return acc;
    }, {} as Record<string, Record<string, string>>);

    // Check each network separately
    for (const [network, networkPacks] of Object.entries(packsByNetwork)) {
        try {
            // Get provider for this network
            const provider = await getAlchemyProvider(getNetworkForProvider(network));
            
            // Create a map of contract address to pack name for reverse lookup
            const contractToPackName = Object.entries(networkPacks).reduce((acc, [name, addr]) => {
                acc[addr.toLowerCase()] = name;
                return acc;
            }, {} as Record<string, string>);

            // Create a Set of contract addresses for faster lookup
            const contractAddresses = new Set(Object.values(networkPacks).map(addr => addr.toLowerCase()));
            
            try {
                // Get all NFTs owned by the address
                const nfts = await provider.nft.getNftsForOwner(walletAddress);
                
                // Check which NFTs are from our target contracts
                const ownedNfts = nfts.ownedNfts.filter(nft => 
                    contractAddresses.has(nft.contract.address.toLowerCase())
                );

                // Update results based on owned NFTs
                for (const nft of ownedNfts) {
                    const packName = contractToPackName[nft.contract.address.toLowerCase()];
                    if (packName) {
                        // Check if the metadata contains "winner" to categorize
                        const isWinner = nft.name?.toLowerCase().includes('winner') || 
                                       nft.description?.toLowerCase().includes('winner');
                        
                        results.push({
                            name: packName,
                            imageUrl: nft.image?.originalUrl?.replace("https://ipfs.io/ipfs/", "https://gateway.pinata.cloud/ipfs/") || '',
                            type: isWinner ? 'winner' : 'participant',
                            network: network
                        });
                        
                        count++;
                    }
                }
            } catch (error) {
                console.error(`Error fetching NFTs for network ${network}:`, error);
                
                // Fallback method: Direct contract calls if the NFT endpoint fails
                await Promise.all(
                    Object.entries(networkPacks).map(async ([packName, contractAddress]) => {
                        try {
                            const ownerAddr = walletAddress.startsWith('0x') ? walletAddress : `0x${walletAddress}`;
                            const balance = await checkNFTBalance(provider, contractAddress, ownerAddr);
                            
                            if (balance > 0) {
                                // Try to get NFT metadata including image and title
                                let imageUrl = '';
                                let isWinner = false;
                                
                                try {
                                    const nftsForContract = await provider.nft.getNftsForOwner(
                                        walletAddress,
                                        { contractAddresses: [contractAddress] }
                                    );
                                    
                                    if (nftsForContract.ownedNfts.length > 0) {
                                        const nft = nftsForContract.ownedNfts[0];
                                        imageUrl = nft.image?.originalUrl || '';
                                        isWinner = Boolean(nft.name?.toLowerCase().includes('winner') || 
                                                 nft.description?.toLowerCase().includes('winner'));
                                    }
                                } catch (metadataErr) {
                                    console.error(`Failed to fetch NFT metadata for ${packName}:`, metadataErr);
                                }

                                results.push({
                                    name: packName,
                                    imageUrl: imageUrl.replace("https://ipfs.io/ipfs/", "https://gateway.pinata.cloud/ipfs/"),
                                    type: isWinner ? 'winner' : 'participant',
                                    network: network
                                });
                                             
                                count++;
                            }
                        } catch (err) {
                            console.error(`Failed to check balance for ${packName}:`, err);
                        }
                    })
                );
            }
        } catch (error) {
            console.error(`Error checking pack balances for network ${network}:`, error);
            // Continue with other networks even if one fails
        }
    }

    return { results, count };
}

/**
 * Helper function to check NFT balance directly via contract call
 */
async function checkNFTBalance(provider: any, contractAddress: string, ownerAddress: string): Promise<number> {
    try {
        // Simple ERC721 balanceOf ABI
        const abi = ['function balanceOf(address owner) view returns (uint256)'];
        
        // @ts-ignore - Using the core provider directly
        const contract = provider.core.provider.attachContract(contractAddress, abi);
        const balance = await contract.balanceOf(ownerAddress);
        
        // Convert BigInt or similar to number
        return Number(balance.toString());
    } catch (error) {
        console.error(`Error checking NFT balance for ${contractAddress}:`, error);
        return 0;
    }
}

/**
 * Check for Devfolio hackathon credentials
 */
export const checkDevfolioCreds = async (walletAddress: string) => {
    console.log("Checking Devfolio credentials for", walletAddress);
    try {
        const data = await checkPackBalances(walletAddress, devfolioPacks);
        const wins = {count: 0, results: [] as any[]}
        const hackers = {count: 0, results: [] as any[]}
        for (const result of data.results) {
            if (result.type === "winner") {
                wins.count++;
                wins.results.push({name: result.name, imageUrl: result.imageUrl});
            } else {
                hackers.count++;
                hackers.results.push({name: result.name, imageUrl: result.imageUrl});
            }
        }

        console.log("Devfolio credentials checked for", walletAddress, "with results", data.results);
        return {wins, hackers};
    } catch (error) {
        console.error("Error checking Devfolio credentials:", error);
        // Return empty results instead of failing
        return { results: [], count: 0 };
    }
}; 