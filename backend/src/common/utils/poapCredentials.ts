import axios from 'axios';

interface POAPTransfer {
    timestamp: number;
}

interface POAPMintingStats {
    mint_order: number;
}

interface POAPDropStats {
    aggregate: {
        sum: {
            poap_count: number;
        };
    };
}

interface POAPDrop {
    id: number;
    created_date: string;
    end_date: string;
    start_date: string;
    image_url: string;
    country: string | null;
    city: string | null;
    expiry_date: string;
    name: string;
    timezone: string | null;
    stats_by_chain_aggregate: POAPDropStats;
}

interface POAP {
    id: number;
    chain: string;
    transfers: POAPTransfer[];
    minting_stats: POAPMintingStats;
    drop: POAPDrop;
}

interface POAPResponse {
    data: {
        poaps: POAP[];
    };
}

/**
 * Helper function to retry API calls with exponential backoff
 * @param operation Function to retry
 * @param maxRetries Maximum number of retries
 * @param delay Initial delay in ms
 */
async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            console.error(`POAP API call attempt ${attempt}/${maxRetries} failed: ${error.message}`);
            
            if (attempt === maxRetries) {
                break;
            }
            
            // Wait with exponential backoff before retrying
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
        }
    }
    
    throw lastError;
}

/**
 * Fetches POAPs for a given address from the POAP GraphQL API
 * @param address Ethereum address to fetch POAPs for
 * @param limit Number of POAPs to fetch (default: 100)
 * @param offset Pagination offset (default: 0)
 */
export async function fetchPOAPs(address: string, limit: number = 100, offset: number = 0): Promise<POAP[]> {
    try {
        console.log(`[fetchPOAPs] Fetching POAPs for address: ${address}`);
        
        const query = `
          query PaginatedPOAPsForCollector($order_by: [poaps_order_by!], $limit: Int!, $offset: Int!, $where: poaps_bool_exp!) {
            poaps(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
              id
              chain
              transfers(limit: 1, order_by: { timestamp: asc }) {
                timestamp
              }
              minting_stats {
                mint_order
              }
              drop {
                id
                created_date
                end_date
                start_date
                image_url
                country
                city
                expiry_date
                name
                timezone
                stats_by_chain_aggregate {
                  aggregate {
                    sum {
                      poap_count
                    }
                  }
                }
              }
            }
          }
        `;

        const variables = {
            where: {
                collector_address: {
                    _eq: address.toLowerCase()
                }
            },
            order_by: [
                { id: "desc" },
                { minted_on: "desc" }
            ],
            limit,
            offset
        };

        const response = await retryWithBackoff(() => axios.post(
            'https://public.compass.poap.tech/v1/graphql',
            { query, variables },
            {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Origin': 'https://collectors.poap.xyz',
                    'Referer': 'https://collectors.poap.xyz/'
                },
                timeout: 10000 // 10 second timeout
            }
        ));

        if (response.status !== 200) {
            throw new Error(`POAP API returned status code ${response.status}`);
        }

        console.log(`[fetchPOAPs] Successfully retrieved ${response.data.data.poaps.length} POAPs for ${address}`);
        return response.data.data.poaps;
    } catch (error) {
        console.error('[fetchPOAPs] Error fetching POAPs:', error);
        return [];
    }
}

/**
 * Categorizes POAPs into hackathon wins and general hacking experiences
 * @param poaps Array of POAPs to categorize
 */
export function categorizePOAPs(poaps: POAP[]) {
    const hackathonWins: {
        count: number;
        packs: Record<string, { name: string; image_url: string }>;
    } = {
        count: 0,
        packs: {}
    };
    
    const hackerExperience: {
        count: number;
        packs: Record<string, { name: string; image_url: string }>;
    } = {
        count: 0,
        packs: {}
    };

    // Keywords that indicate a hackathon or hacking event
    const hackathonKeywords = [
        'hackathon', 'hacker', 'ethglobal', 'hack', 'eth global', 
        'devcon', 'devconnect', 'builder', 'developer', 'buildathon',
        'summit', 'conference', 'dao hack', 'web3', 'web3jam'
    ];
    
    // Keywords that specifically indicate a win
    const winKeywords = [
        'winner', 'finalist', 'win', 'won', 'first place', 'award',
        '1st place', 'champion', 'prize', 'winning', 'selected', 'honored'
    ];

    for (const poap of poaps) {
        const name = poap.drop.name.toLowerCase();
        const isHackathonRelated = hackathonKeywords.some(keyword => name.includes(keyword));
        
        if (isHackathonRelated) {
            const isWin = winKeywords.some(keyword => name.includes(keyword));
            
            if (isWin) {
                hackathonWins.count++;
                hackathonWins.packs[poap.drop.id.toString()] = {
                    name: poap.drop.name,
                    image_url: poap.drop.image_url
                };
            } else {
                hackerExperience.count++;
                hackerExperience.packs[poap.drop.id.toString()] = {
                    name: poap.drop.name,
                    image_url: poap.drop.image_url
                };
            }
        }
    }

    return {
        wins: hackathonWins,
        experience: hackerExperience
    };
}

/**
 * Fetch and categorize POAPs for an address
 * @param address Ethereum address to fetch POAPs for
 * @param maxPages Maximum number of pages to fetch (default: 3, each page is 100 POAPs)
 */
export async function getPOAPCredentials(address: string, maxPages: number = 3): Promise<any> {
    console.log("Getting POAP credentials for", address);
    
    // Fetch multiple pages of POAPs if needed
    const allPoaps: POAP[] = [];
    let hasMoreData = true;
    let page = 0;
    
    while (hasMoreData && page < maxPages) {
        const offset = page * 100;
        const poaps = await fetchPOAPs(address, 100, offset);
        
        if (poaps.length > 0) {
            allPoaps.push(...poaps);
            page++;
        } else {
            hasMoreData = false;
        }
    }
    
    console.log(`[getPOAPCredentials] Total POAPs found for ${address}: ${allPoaps.length}`);
    const categorized = categorizePOAPs(allPoaps);
    
    return {
        POAP_WINS: categorized.wins,
        POAP_HACKER: categorized.experience,
        totalPoapWins: categorized.wins.count,
        totalPoapHacker: categorized.experience.count,
        totalPoaps: allPoaps.length
    };
} 