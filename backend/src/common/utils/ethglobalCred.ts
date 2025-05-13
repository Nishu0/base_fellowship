import { Network } from 'alchemy-sdk';
import { getAlchemyProvider } from './alchemyProvider';

const communityPacks = {
    "OG Pack": "0x37C6fe4049c95f80e18C9cDDaA8481742456520B",
    "Partner Pack": "0x27479dd41a85002F5987B8C7E999ca0e07Dba817",
    "Supporter Pack": "0x5CF3C75E0036f76bB7BE1815F641DDd57Fd54feb",
    "Pioneer Pack": "0x69B4e2BD6D5c5eeeB7E152FB9bc9b6c4364fA410",
    "Builder Pack": "0xe600A7AD9B86A2D949069A6092b7b5a1Dae50e20",
    "Hacker Pack": "0x32382a82d9faDc55f971f33DaEeE5841cfbADbE0"
};

const finalistPacks = {
    "ETHGlobal Finalist 2025": "0x75883f9158a11234E5D94DDeDc23F431ce51Aa1d",
    "ETHGlobal Taipei 2025 Finalist": "0xf1F0B74870B946a8Cb96CeD06749036B65f5018B",
    "Agentic Ethereum 2025 Finalist": "0x1Da04F739e4b9Cff65bd8D1Ecb9ADf15Cc093f08",
    "ETHGlobal Bangkok 2025 Finalist": "0x148f46e97fb11e938ef291b72b9a8c858cd3c157",
    "ETHGlobal San Francisco 2025 Finalist": "0x778cca1bd0dd82ac049aecd1fa5f93c3a328954b",
    "ETHGlobal Singapore Finalist": "0xda9d339c9ef58db3e3af9667b1e68feb2815c972",
    "ETHGlobal Singapore 2025 Finalist": "0x44Ebc0A6fA6700931F7a817126aa7BDce41831C4",
    "ETHOnline 2024 Finalist": "0x09c2ffbb99fcccd62cfefc6356bd6846fb30153f",
    "Superhack 2024 Finalist": "0x416784e5fcc0bb1e0d2f172a4ad3b1e937a42544",
    "Brussels 2024 Finalist": "0x2cA7362eE7A3b5532d02FBc5927CA8B213d1c7Ca",
    "Frameworks 2024 Finalist": "0xe8bb0abd672d977acd06b68889bba46643d114a1",
    "Circuit Breaker 2024 Finalist": "0xe2fb6b612a90d38e6183ff8a9323b2a13d9afa5d",
    "LFGHO 2024 Finalist": "0x3c63848388ca9f98403aa5c5c0bb579bdff039bf",
    "StarkHack 2024 Finalist": "0x9e4b7e7bca9389e44b7e7d789fc828819d7ec0a9",
    "HackFS 2024 Finalist": "0x6f06173d2920d1b8a9a523132cfdc1c3debd1e71",
    "ETHGlobal Sydney 2024 Finalist": "0x85052Af96Ce5D90469A13bc69A618dC9a2d49aD6",
    "Scaling Ethereum 2024 Finalist": "0x6f2942E1fb7737ec3d3b29BED92Ff3e73601DcD3",
    "ETHGlobal London 2024 Finalist": "0xa94b0a0ad9485946a771acb89a7927923ddd389f"
};

/**
 * Check if an address owns any NFTs from the specified packs
 * This version uses our enhanced Alchemy provider with fallbacks
 */
async function checkPackBalances(walletAddress: string, packs: Record<string, string>) {
    const results: { [key: string]: boolean } = {};
    let count = 0;

    // Create a map of contract address to pack name for reverse lookup
    const contractToPackName = Object.entries(packs).reduce((acc, [name, addr]) => {
        acc[addr.toLowerCase()] = name;
        return acc;
    }, {} as Record<string, string>);

    try {
        // Get our enhanced Alchemy provider for Optimism
        const provider = getAlchemyProvider(Network.OPT_MAINNET);
        
        // Create a Set of contract addresses for faster lookup
        const contractAddresses = new Set(Object.values(packs).map(addr => addr.toLowerCase()));
        
        try {
            // Get all NFTs owned by the address with retry and fallback logic
            const nfts = await provider.nft.getNftsForOwner(walletAddress);
            
            // Check which NFTs are from our target contracts
            const ownedNfts = nfts.ownedNfts.filter(nft => 
                contractAddresses.has(nft.contract.address.toLowerCase())
            );
    
            // Update results based on owned NFTs
            for (const nft of ownedNfts) {
                const packName = contractToPackName[nft.contract.address.toLowerCase()];
                if (packName) {
                    results[packName] = true;
                    count++;
                }
            }
        } catch (error) {
            console.error('Error fetching NFTs:', error);
            
            // Fallback method: Direct contract calls if the NFT endpoint fails
            await Promise.all(
                Object.entries(packs).map(async ([packName, contractAddress]) => {
                    try {
                        // Check balance using the basic balanceOf function
                        const ownerAddr = walletAddress.startsWith('0x') ? walletAddress : `0x${walletAddress}`;
                        const balance = await checkNFTBalance(provider, contractAddress, ownerAddr);
                        
                        if (balance > 0) {
                            results[packName] = true;
                            count++;
                        }
                    } catch (err) {
                        console.error(`Failed to check balance for ${packName}:`, err);
                    }
                })
            );
        }
    } catch (error) {
        console.error('Error checking pack balances:', error);
        // Don't throw - return empty results instead
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
 * Check for community packs (Hacker, Builder, etc.)
 */
export const checkCommunityPacks = async (walletAddress: string) => {
    console.log("Checking community packs for", walletAddress);
    try {
        const data = await checkPackBalances(walletAddress, communityPacks);
        console.log("Community packs checked for", walletAddress, "with results", data.results);
        return data;
    } catch (error) {
        console.error("Error checking community packs:", error);
        // Return empty results instead of failing
        return { results: {}, count: 0 };
    }
};

/**
 * Check for finalist packs (hackathon wins)
 */
export const checkFinalistPacks = async (walletAddress: string) => {
    try {
        return await checkPackBalances(walletAddress, finalistPacks);
    } catch (error) {
        console.error("Error checking finalist packs:", error);
        // Return empty results instead of failing
        return { results: {}, count: 0 };
    }
};


  