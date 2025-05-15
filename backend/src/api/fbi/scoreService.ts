import { PrismaClient, DataStatus } from '@prisma/client';
import { Logger } from '@/common/utils/logger';

const prisma = new PrismaClient();

// Well-known crypto repositories to check for contributions
const CRYPTO_REPOS = [
    // Existing major protocols
    'ethereum/go-ethereum',
    'ethereum/solidity',
    'bitcoin/bitcoin',
    'solana-labs/solana',
    'cosmos/cosmos-sdk',
    'paritytech/substrate',
    'near/nearcore',
    'aptos-labs/aptos-core',
    'matter-labs/zksync',
    'starkware-libs/starkex-contracts',
    'Uniswap/v3-core',
    'aave/aave-v3-core',
    'compound-finance/compound-protocol',
    'makerdao/dss',
    'curvefi/curve-contract',
    
    // ZK and Privacy
    '0xPARC/zk-bug-tracker',
    '0xPARC/zkrepl',
    '0xPolygonZero/plonky2',
    'AztecProtocol/Setup',
    'AztecProtocol/barretenberg',
    'ConsenSys/gnark',
    'HorizenLabs/poseidon2',
    'Zokrates/ZoKrates',
    'microsoft/Nova',
    'noir-lang/noir',
    'privacy-scaling-explorations/halo2curves',
    'privacy-scaling-explorations/halo2wrong',
    'privacy-scaling-explorations/sonobe',
    'privacy-scaling-explorations/zk-kit',
    'scipr-lab/libsnark',
    'semaphore-protocol/semaphore',
    'zcash/halo2',
    'zcash/zcash',
    'zkcrypto/bellman',
    'zkcrypto/ff',
    'zkcrypto/group',
    'zkcrypto/pairing',
    'zkp2p/zk-p2p',
    
    // Development Tools and Libraries
    'OpenZeppelin/openzeppelin-contracts',
    'OpenZeppelin/openzeppelin-contracts-upgradeable',
    'Vectorized/solady',
    'foundry-rs/foundry',
    'ethereum/web3.py',
    'ethereum/solc-js',
    'ethereum/eth-tester',
    'ethereum/c-kzg-4844',
    'ethereumjs/ethereumjs-abi',
    'ethjs/ethjs',
    'rainbow-me/rainbowkit',
    'thirdweb-dev/contracts',
    'thirdweb-dev/js',
    'transmissions11/solmate',
    
    // Infrastructure and Clients
    'Consensys/teku',
    'hyperledger/besu',
    'hyperledger/web3j',
    'ipfs/ipfs',
    'ipfs/kubo',
    'libp2p/go-libp2p',
    'libp2p/rust-libp2p',
    'prysmaticlabs/prysm',
    
    // Security and Analysis Tools
    'crytic/echidna',
    'crytic/slither',
    'cgewecke/hardhat-gas-reporter',
    'ItsNickBarry/hardhat-contract-sizer',
    'protofire/solhint',
    'sc-forks/solidity-coverage',
    
    // Educational Resources
    'CryptozombiesHQ/cryptozombie-lessons',
    'Cyfrin/foundry-devops',
    'Cyfrin/foundry-full-course-f23',
    'Cyfrin/security-and-auditing-full-course-s23',
    'Dapp-Learning-DAO/Dapp-Learning',
    'solidity-by-example/solidity-by-example.github.io',
    
    // Cryptographic Libraries and Tools
    'arkworks-rs/algebra',
    'arkworks-rs/crypto-primitives',
    'arkworks-rs/groth16',
    'arkworks-rs/marlin',
    'arkworks-rs/snark',
    'dalek-cryptography/bulletproofs',
    'krzyzanowskim/CryptoSwift',
    'lambdaclass/lambdaworks',
    
    // Other Important Tools and Protocols
    'Ankr-network/ankr.js',
    'ApeWorX/ape',
    'Hats-Protocol/hats-protocol',
    'Tenderly/tenderly-cli',
    'TrueBlocks/trueblocks-core',
    'blockchain-etl/ethereum-etl',
    'bluealloy/revm',
    'eth-infinitism/account-abstraction',
    'iden3/circom',
    'iden3/snarkjs',
    'merkletreejs/merkletreejs',
    'paradigmxyz/cryo',
    'pcaversaccio/snekmate',
    'poap-xyz/poap.js',
    'rust-ethereum/evm',
    'scaffold-eth/scaffold-eth-2',
    'starkware-libs/cairo-lang'
];

// Default thresholds if not present in platform config
const DEFAULT_THRESHOLDS = {
    // Web3 thresholds
    mainnetContracts: 5,
    testnetContracts: 3,
    mainnetTVL: 1000000, // 1M
    uniqueUsers: 100,
    transactions: 100,
    web3Languages: 10000,
    cryptoRepoContributions: 50,
    hackathonWins: 10,

    // Web2 thresholds
    prs: 20,
    contributions: 1000,
    forks: 50,
    stars: 100,
    issues: 30,
    totalLinesOfCode: 50000,
    accountAge: 365, // 1 year in days
    followers: 100
};

// Default weights if not present in platform config
const DEFAULT_WEIGHTS = {
    // Web3 weights
    mainnetContracts: 12,
    testnetContracts: 8,
    mainnetTVL: 5,
    uniqueUsers: 5,
    transactions: 20,
    web3Languages: 20,
    cryptoRepoContributions: 15,
    hackathonWins: 15,

    // Web2 weights
    prs: 10,
    contributions: 10,
    forks: 10,
    stars: 10,
    issues: 10,
    totalLinesOfCode: 20,
    accountAge: 10,
    followers: 10
};

export class ScoreService {
    async calculateUserScore(userId: string): Promise<void> {
        Logger.info('ScoreService', 'Starting calculateUserScore', { userId });
        try {
            // Get user data
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    githubData: true,
                    contractsData: true,
                    onchainData: true
                }
            });

            if (!user) throw new Error("User not found");

            // Get platform configuration
            const platformConfig = await prisma.platformConfig.findUnique({
                where: { name: "default" }
            });

            // Use thresholds and weights from platform config or defaults
            const thresholds = platformConfig?.thresholds as Record<string, number> || {};
            const weights = platformConfig?.weights as Record<string, number> || {};
            const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
            const finalWeights = { ...DEFAULT_WEIGHTS, ...weights };

            // Initialize metrics object
            const metrics: Record<string, any> = {
                web3: {},
                web2: {}
            };

            // Calculate Web3 Score
            const web3Score = await this.calculateWeb3Score(user, metrics, finalThresholds, finalWeights);
            
            // Calculate Web2 Score
            const web2Score = await this.calculateWeb2Score(user, metrics, finalThresholds, finalWeights);

            // Calculate total score (50% Web3 + 50% Web2)
            const totalScore = (web3Score + web2Score) / 2;

            // Update or create user score
            await prisma.userScore.upsert({
                where: { userId },
                create: {
                    userId,
                    totalScore,
                    metrics,
                    status: DataStatus.COMPLETED,
                    lastCalculatedAt: new Date()
                },
                update: {
                    totalScore,
                    metrics,
                    status: DataStatus.COMPLETED,
                    lastCalculatedAt: new Date()
                }
            });

            Logger.info('ScoreService', 'Successfully calculated user score', { userId });
        } catch (error) {
            Logger.error('ScoreService', 'Error calculating user score', error);
            // Update status to failed if any error occurs
            await prisma.userScore.upsert({
                where: { userId },
                create: {
                    userId,
                    totalScore: 0,
                    metrics: {},
                    status: DataStatus.FAILED,
                    lastCalculatedAt: new Date()
                },
                update: {
                    status: DataStatus.FAILED,
                    lastCalculatedAt: new Date()
                }
            });
            throw error;
        }
    }

    private async getCryptoRepos(): Promise<string[]> {
        try {
            const platformConfig = await prisma.platformConfig.findUnique({
                where: { name: "default" }
            });
            
            if (!platformConfig?.cryptoRepos) {
                Logger.warn('ScoreService', 'No crypto repos found in platform config, using empty list');
                return [];
            }

            const cryptoReposData = platformConfig.cryptoRepos as { repositories: string[] };
            Logger.info('ScoreService', 'Crypto repos found in platform config', { cryptoReposData: cryptoReposData.repositories.length });
            return cryptoReposData.repositories || [];
        } catch (error) {
            Logger.error('ScoreService', 'Error fetching crypto repos from database', error);
            return [];
        }
    }

    private async calculateWeb3Score(
        user: any, 
        metrics: Record<string, any>, 
        thresholds: Record<string, number>,
        weights: Record<string, number>
    ): Promise<number> {
        const web3Metrics = metrics.web3;
        let totalWeb3Score = 0;

        // Get hackathon data from onchainData
        const onchainData = await prisma.onchainData.findUnique({
            where: { userId: user.id }
        });

        const hackathonData = onchainData?.hackathonData as any;
        const totalWins = (hackathonData?.totalWins || 0) + (hackathonData?.POAP_WINS?.count || 0);

        // Calculate hackathon score
        const hackathonScore = Math.min(totalWins / thresholds.hackathonWins, 1) * weights.hackathonWins;
        web3Metrics.hackathonWins = {
            value: totalWins,
            threshold: thresholds.hackathonWins,
            weight: weights.hackathonWins,
            score: hackathonScore,
            details: {
                ethGlobalWins: hackathonData?.WINS || { count: 0, packs: {} },
                poapWins: hackathonData?.POAP_WINS || { count: 0, packs: {} }
            }
        };

        // 1. Contracts Deployed (20 points total)
        const contractStats = user.onchainData?.contractStats as any;
        const mainnetContracts = contractStats?.total?.mainnet || 0;
        const testnetContracts = contractStats?.total?.testnet || 0;
        
        // Mainnet contracts
        const mainnetContractScore = Math.min(mainnetContracts / thresholds.mainnetContracts, 1) * weights.mainnetContracts;
        web3Metrics.mainnetContracts = {
            value: mainnetContracts,
            threshold: thresholds.mainnetContracts,
            weight: weights.mainnetContracts,
            score: mainnetContractScore
        };

        // Testnet contracts
        const testnetContractScore = Math.min(testnetContracts / thresholds.testnetContracts, 1) * weights.testnetContracts;
        web3Metrics.testnetContracts = {
            value: testnetContracts,
            threshold: thresholds.testnetContracts,
            weight: weights.testnetContracts,
            score: testnetContractScore
        };

        // 2. Contract Stats (10 points total)
        const contracts = user.contractsData?.contracts as any;
        let totalTVL = 0;
        let uniqueUsers = new Set();

        // Calculate TVL and unique users across all contracts
        Object.values(contracts || {}).forEach((chainContracts: any) => {
            chainContracts.forEach((contract: any) => {
                    totalTVL += Number(contract.tvl || 0);
                    uniqueUsers.add(contract.uniqueUsers);
            });
        });

        // Mainnet TVL
        const tvlScore = Math.min(totalTVL / thresholds.mainnetTVL, 1) * weights.mainnetTVL;
        web3Metrics.mainnetTVL = {
            value: totalTVL,
            threshold: thresholds.mainnetTVL,
            weight: weights.mainnetTVL,
            score: tvlScore
        };

        // Unique Users
        const uniqueUsersScore = Math.min(uniqueUsers.size / thresholds.uniqueUsers, 1) * weights.uniqueUsers;
        web3Metrics.uniqueUsers = {
            value: uniqueUsers.size,
            threshold: thresholds.uniqueUsers,
            weight: weights.uniqueUsers,
            score: uniqueUsersScore
        };

        // 3. Transactions
        const transactionStats = user.onchainData?.transactionStats as any;
        const mainnetStats = transactionStats?.total?.mainnet || {};
        
        const externalTxs = mainnetStats.external || 0;
        const internalTxs = mainnetStats.internal || 0;
        const totalTxs = mainnetStats.total || 0;

        const transactionScore = Math.min(totalTxs / thresholds.transactions, 1) * weights.transactions;
        web3Metrics.transactions = {
            value: totalTxs,
            threshold: thresholds.transactions,
            weight: weights.transactions,
            score: transactionScore,
            breakdown: {
                external: externalTxs,
                internal: internalTxs
            }
        };

        // 4. Web3 Languages
        const githubData = user.githubData;
        if (githubData) {
            const repos = githubData.repos as any;
            const languages = repos.totalLanguageLinesOfCode || {};
            
            const web3Languages = {
                Rust: languages.Rust || 0,
                Solidity: languages.Solidity || 0,
                Move: languages.Move || 0,
                Cadence: languages.Cadence || 0
            };

            const totalWeb3LOC = Object.values(web3Languages).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
            const web3LangScore = Math.min(totalWeb3LOC / thresholds.web3Languages, 1) * weights.web3Languages;
            web3Metrics.web3Languages = {
                value: totalWeb3LOC,
                threshold: thresholds.web3Languages,
                weight: weights.web3Languages,
                score: web3LangScore,
                breakdown: web3Languages
            };
        }

        // 5. Crypto Repo Contributions
        if (githubData) {
            const repos = githubData.languagesData as any;
            const contributions = repos.repoContributions || {};
            
            let totalCryptoContributions = 0;
            const cryptoRepoContributions: Record<string, number> = {};

            const cryptoRepos = await this.getCryptoRepos();
            
            cryptoRepos.forEach(repo => {
                const contribution = contributions[repo] || 0;
                if (contribution > 0) {
                    cryptoRepoContributions[repo] = contribution;
                    totalCryptoContributions += contribution;
                }
            });

            const cryptoContribScore = Math.min(totalCryptoContributions / thresholds.cryptoRepoContributions, 1) * weights.cryptoRepoContributions;
            web3Metrics.cryptoRepoContributions = {
                value: totalCryptoContributions,
                threshold: thresholds.cryptoRepoContributions,
                weight: weights.cryptoRepoContributions,
                score: cryptoContribScore,
                breakdown: cryptoRepoContributions
            };
        }

        // Calculate total Web3 score
        totalWeb3Score = Object.values(web3Metrics).reduce((acc: number, metric: any) => acc + (metric.score || 0), 0);
        web3Metrics.total = totalWeb3Score;

        return totalWeb3Score;
    }

    private async calculateWeb2Score(
        user: any, 
        metrics: Record<string, any>, 
        thresholds: Record<string, number>,
        weights: Record<string, number>
    ): Promise<number> {
        const web2Metrics = metrics.web2;
        let totalWeb2Score = 0;

        const githubData = user.githubData;
        if (githubData) {
            const userInfo = githubData.userInfo as any;
            const repos = githubData.repos as any;

            // 1. Total PRs
            const totalPRs = githubData.languagesData.totalPRs || 0;
            const prScore = Math.min(totalPRs / thresholds.prs, 1) * weights.prs;
            web2Metrics.prs = {
                value: totalPRs,
                threshold: thresholds.prs,
                weight: weights.prs,
                score: prScore
            };

            // 2. Total Contributions
            const totalContributions = githubData.languagesData.totalContributions || 0;
            const contributionScore = Math.min(totalContributions / thresholds.contributions, 1) * weights.contributions;
            web2Metrics.contributions = {
                value: totalContributions,
                threshold: thresholds.contributions,
                weight: weights.contributions,
                score: contributionScore
            };

            // 3. Total Forks
            const totalForks = repos.totalForks || 0;
            const forksScore = Math.min(totalForks / thresholds.forks, 1) * weights.forks;
            web2Metrics.forks = {
                value: totalForks,
                threshold: thresholds.forks,
                weight: weights.forks,
                score: forksScore
            };

            // 4. Total Stars
            const totalStars = repos.totalStars || 0;
            const starsScore = Math.min(totalStars / thresholds.stars, 1) * weights.stars;
            web2Metrics.stars = {
                value: totalStars,
                threshold: thresholds.stars,
                weight: weights.stars,
                score: starsScore
            };

            // 5. Total Issues
            const totalIssues = githubData.languagesData.totalIssues || 0;
            const issuesScore = Math.min(totalIssues / thresholds.issues, 1) * weights.issues;
            web2Metrics.issues = {
                value: totalIssues,
                threshold: thresholds.issues,
                weight: weights.issues,
                score: issuesScore
            };

            // 6. Total Lines of Code
            const languages = repos.totalLanguageLinesOfCode || {};
            const totalLOC = Object.values(languages).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
            const locScore = Math.min(totalLOC / thresholds.totalLinesOfCode, 1) * weights.totalLinesOfCode;
            web2Metrics.totalLinesOfCode = {
                value: totalLOC,
                threshold: thresholds.totalLinesOfCode,
                weight: weights.totalLinesOfCode,
                score: locScore,
                breakdown: languages
            };

            // 7. Account Age
            const accountAge = userInfo.accountAge
            const accountAgeScore = Math.min(accountAge / thresholds.accountAge, 1) * weights.accountAge;
            web2Metrics.accountAge = {
                value: accountAge,
                threshold: thresholds.accountAge,
                weight: weights.accountAge,
                score: accountAgeScore
            };

            // 8. Followers
            const followers = userInfo.followers || 0;
            const followersScore = Math.min(followers / thresholds.followers, 1) * weights.followers;
            web2Metrics.followers = {
                value: followers,
                threshold: thresholds.followers,
                weight: weights.followers,
                score: followersScore
            };
        }

        // Calculate total Web2 score
        totalWeb2Score = Object.values(web2Metrics).reduce((acc: number, metric: any) => acc + (metric.score || 0), 0);
        web2Metrics.total = totalWeb2Score;

        return totalWeb2Score;
    }

    async calculateDeveloperWorth(userId: string): Promise<void> {
        Logger.info('ScoreService', 'Starting calculateDeveloperWorth', { userId });
        try {
            // Get user data
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    githubData: true,
                    contractsData: true,
                    onchainData: true
                }
            });

            if (!user) throw new Error("User not found");

            // Calculate Web3 Worth (60% of total)
            const web3Worth = await this.calculateWeb3DeveloperWorth(user);
            
            // Calculate Web2 Worth (40% of total)
            const web2Worth = await this.calculateWeb2DeveloperWorth(user);

            // Calculate total worth
            const totalWorth = web3Worth.totalWorth + web2Worth.totalWorth;

            // Store detailed metrics
            const detailedMetrics = {
                web3: {
                    mainnetContracts: web3Worth.web3Metrics.experienceBreakdown.mainnetContracts,
                    testnetContracts: web3Worth.web3Metrics.experienceBreakdown.testnetContracts,
                    cryptoRepoContributions: web3Worth.web3Metrics.experienceBreakdown.cryptoRepoContributions,
                    languages: {
                        solidity: web3Worth.web3Metrics.skillBreakdown.solidity,
                        rust: web3Worth.web3Metrics.skillBreakdown.rust,
                        move: web3Worth.web3Metrics.skillBreakdown.move,
                        cadence: web3Worth.web3Metrics.skillBreakdown.cadence
                    },
                    tvl: web3Worth.web3Metrics.influenceBreakdown.tvl,
                    uniqueUsers: web3Worth.web3Metrics.influenceBreakdown.uniqueUsers,
                    transactions: web3Worth.web3Metrics.influenceBreakdown.transactions,
                    totalWorth: web3Worth.totalWorth
                },
                web2: {
                    accountAge: web2Worth.web2Metrics.experienceBreakdown.accountAge,
                    prs: web2Worth.web2Metrics.experienceBreakdown.prs,
                    contributions: web2Worth.web2Metrics.experienceBreakdown.contributions,
                    linesOfCode: web2Worth.web2Metrics.skillBreakdown.linesOfCode,
                    stars: web2Worth.web2Metrics.influenceBreakdown.stars,
                    forks: web2Worth.web2Metrics.influenceBreakdown.forks,
                    followers: web2Worth.web2Metrics.influenceBreakdown.followers,
                    totalWorth: web2Worth.totalWorth
                },
                totalWorth
            };

            // Update or create developer worth in database
            await prisma.developerWorth.upsert({
                where: { userId },
                create: {
                    userId,
                    totalWorth,
                    breakdown: detailedMetrics,
                    details: detailedMetrics, // Store full details here
                    lastCalculatedAt: new Date()
                },
                update: {
                    totalWorth,
                    breakdown: detailedMetrics,
                    details: detailedMetrics, // Store full details here
                    lastCalculatedAt: new Date()
                }
            });

            Logger.info('ScoreService', 'Successfully calculated developer worth', { userId });
        } catch (error) {
            Logger.error('ScoreService', 'Error calculating developer worth', error);
            throw error;
        }
    }

    private async calculateWeb3DeveloperWorth(user: any): Promise<{totalWorth: number, web3Metrics: any}> {
        let totalWorth = 0;
        const web3Metrics = {
            experienceValue: 0,
            experienceBreakdown: {
                mainnetContracts: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                },
                testnetContracts: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                },
                cryptoRepoContributions: {
                    value: 0,
                    multiplier: 0,
                    worth: 0,
                    details: {} as Record<string, number>
                },
                hackathonWins: {
                    value: 0,
                    multiplier: 0,
                    worth: 0,
                    details: {
                        ethGlobalWins: 0,
                        poapWins: 0
                    }
                }
            },
            skillValue: 0,
            skillBreakdown: {
                solidity: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                },
                rust: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                },
                move: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                },
                cadence: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                }
            },
            influenceValue: 0,
            influenceBreakdown: {
                tvl: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                },
                uniqueUsers: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                },
                transactions: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                }
            }
        };

        // Get platform configuration
        const platformConfig = await prisma.platformConfig.findUnique({
            where: { name: "default" }
        });

        let multipliersObj: any = platformConfig?.developerWorthMultipliers;
        if (typeof multipliersObj === 'string') {
            try {
                multipliersObj = JSON.parse(multipliersObj);
            } catch (e) {
                Logger.error('ScoreService', 'Failed to parse developerWorthMultipliers as JSON', e);
                multipliersObj = {};
            }
        }
        const multipliers = multipliersObj?.web3 || {
            experience: {
                mainnetContract: 2000,
                testnetContract: 500,
                cryptoRepoContribution: 200,
                hackathonWin: 1000
            },
            skill: {
                solidity: 0.02,
                rust: 0.03,
                move: 0.025,
                cadence: 0.025
            },
            influence: {
                tvlMultiplier: 0.0001,
                uniqueUser: 20,
                transaction: 2
            }
        };

        // 1. Experience Value
        const contractStats = user.onchainData?.contractStats as any;
        const mainnetContracts = contractStats?.total?.mainnet || 0;
        const testnetContracts = contractStats?.total?.testnet || 0;
        
        // Store mainnet contracts details
        web3Metrics.experienceBreakdown.mainnetContracts = {
            value: mainnetContracts,
            multiplier: multipliers.experience.mainnetContract,
            worth: mainnetContracts * multipliers.experience.mainnetContract
        };

        // Store testnet contracts details
        web3Metrics.experienceBreakdown.testnetContracts = {
            value: testnetContracts,
            multiplier: multipliers.experience.testnetContract,
            worth: testnetContracts * multipliers.experience.testnetContract
        };

        // Add hackathon wins
        const onchainData = await prisma.onchainData.findUnique({
            where: { userId: user.id }
        });
        
        const hackathonData = onchainData?.hackathonData as any;
        const ethGlobalWins = hackathonData?.WINS?.count || 0;
        const poapWins = hackathonData?.POAP_WINS?.count || 0;
        const totalHackathonWins = ethGlobalWins + poapWins;

        web3Metrics.experienceBreakdown.hackathonWins = {
            value: totalHackathonWins,
            multiplier: multipliers.experience.hackathonWin || 1000,
            worth: totalHackathonWins * (multipliers.experience.hackathonWin || 1000),
            details: {
                ethGlobalWins,
                poapWins
            }
        };

        // Add crypto repo contributions
        const githubData = user.githubData;
        if (githubData) {
            const repos = githubData.languagesData as any;
            const contributions = repos.repoContributions || {};
            
            let totalCryptoContributions = 0;
            const cryptoRepos = await this.getCryptoRepos();
            const contributionDetails: Record<string, number> = {};
            
            cryptoRepos.forEach(repo => {
                const contribution = contributions[repo] || 0;
                if (contribution > 0) {
                    contributionDetails[repo] = contribution;
                    totalCryptoContributions += contribution;
                }
            });

            web3Metrics.experienceBreakdown.cryptoRepoContributions = {
                value: totalCryptoContributions,
                multiplier: multipliers.experience.cryptoRepoContribution,
                worth: totalCryptoContributions * multipliers.experience.cryptoRepoContribution,
                details: contributionDetails
            };
        }

        web3Metrics.experienceValue = 
            web3Metrics.experienceBreakdown.mainnetContracts.worth +
            web3Metrics.experienceBreakdown.testnetContracts.worth +
            web3Metrics.experienceBreakdown.cryptoRepoContributions.worth +
            web3Metrics.experienceBreakdown.hackathonWins.worth;

        // 2. Skill Value
        if (githubData) {
            const repos = githubData.repos as any;
            const languages = repos.totalLanguageLinesOfCode || {};
            
            // Store individual language details
            web3Metrics.skillBreakdown.solidity = {
                value: languages.Solidity || 0,
                multiplier: multipliers.skill.solidity,
                worth: (languages.Solidity || 0) * multipliers.skill.solidity
            };

            web3Metrics.skillBreakdown.rust = {
                value: languages.Rust || 0,
                multiplier: multipliers.skill.rust,
                worth: (languages.Rust || 0) * multipliers.skill.rust
            };

            web3Metrics.skillBreakdown.move = {
                value: languages.Move || 0,
                multiplier: multipliers.skill.move,
                worth: (languages.Move || 0) * multipliers.skill.move
            };

            web3Metrics.skillBreakdown.cadence = {
                value: languages.Cadence || 0,
                multiplier: multipliers.skill.cadence,
                worth: (languages.Cadence || 0) * multipliers.skill.cadence
            };

            web3Metrics.skillValue = 
                web3Metrics.skillBreakdown.solidity.worth +
                web3Metrics.skillBreakdown.rust.worth +
                web3Metrics.skillBreakdown.move.worth +
                web3Metrics.skillBreakdown.cadence.worth;
        }

        // 3. Influence Value
        const contracts = user.contractsData?.contracts as any;
        let totalTVL = 0;
        let uniqueUsers = new Set();

        Object.values(contracts || {}).forEach((chainContracts: any) => {
            chainContracts.forEach((contract: any) => {
                totalTVL += Number(contract.tvl || 0);
                uniqueUsers.add(contract.uniqueUsers);
            });
        });

        const transactionStats = user.onchainData?.transactionStats as any;
        const mainnetStats = transactionStats?.total?.mainnet || {};
        const totalTxs = mainnetStats.total || 0;

        // Store influence metrics details
        web3Metrics.influenceBreakdown.tvl = {
            value: totalTVL,
            multiplier: multipliers.influence.tvlMultiplier,
            worth: totalTVL * multipliers.influence.tvlMultiplier
        };

        web3Metrics.influenceBreakdown.uniqueUsers = {
            value: uniqueUsers.size,
            multiplier: multipliers.influence.uniqueUser,
            worth: uniqueUsers.size * multipliers.influence.uniqueUser
        };

        web3Metrics.influenceBreakdown.transactions = {
            value: totalTxs,
            multiplier: multipliers.influence.transaction,
            worth: totalTxs * multipliers.influence.transaction
        };

        web3Metrics.influenceValue = 
            web3Metrics.influenceBreakdown.tvl.worth +
            web3Metrics.influenceBreakdown.uniqueUsers.worth +
            web3Metrics.influenceBreakdown.transactions.worth;

        // Calculate total Web3 worth
        totalWorth = web3Metrics.experienceValue + web3Metrics.skillValue + web3Metrics.influenceValue;

        return {totalWorth, web3Metrics};
    }

    private async calculateWeb2DeveloperWorth(user: any): Promise<{totalWorth: number, web2Metrics: any}> {
        let totalWorth = 0;
        const web2Metrics = {
            experienceValue: 0,
            experienceBreakdown: {
                accountAge: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                },
                prs: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                },
                contributions: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                }
            },
            skillValue: 0,
            skillBreakdown: {
                linesOfCode: {
                    value: 0,
                    multiplier: 0,
                    worth: 0,
                    breakdown: {} as Record<string, number>
                }
            },
            influenceValue: 0,
            influenceBreakdown: {
                stars: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                },
                forks: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                },
                followers: {
                    value: 0,
                    multiplier: 0,
                    worth: 0
                }
            }
        };

        // Get platform configuration
        const platformConfig = await prisma.platformConfig.findUnique({
            where: { name: "default" }
        });

        let multipliersObj: any = platformConfig?.developerWorthMultipliers;
        if (typeof multipliersObj === 'string') {
            try {
                multipliersObj = JSON.parse(multipliersObj);
            } catch (e) {
                Logger.error('ScoreService', 'Failed to parse developerWorthMultipliers as JSON', e);
                multipliersObj = {};
            }
        }
        const multipliers = multipliersObj?.web2 || {
            experience: {
                accountAge: 20,
                pr: 100,
                contribution: 10
            },
            skill: {
                lineOfCode: 0.00001
            },
            influence: {
                star: 20,
                fork: 40,
                follower: 10
            }
        };

        const githubData = user.githubData;
        if (githubData) {
            const userInfo = githubData.userInfo as any;
            const repos = githubData.repos as any;

            // 1. Experience Value
            const accountAge = userInfo.accountAge || 0;
            const totalPRs = githubData.languagesData.totalPRs || 0;
            const totalContributions = githubData.languagesData.totalContributions || 0;

            // Store experience metrics details
            web2Metrics.experienceBreakdown.accountAge = {
                value: accountAge,
                multiplier: multipliers.experience.accountAge,
                worth: accountAge * multipliers.experience.accountAge
            };

            web2Metrics.experienceBreakdown.prs = {
                value: totalPRs,
                multiplier: multipliers.experience.pr,
                worth: totalPRs * multipliers.experience.pr
            };

            web2Metrics.experienceBreakdown.contributions = {
                value: totalContributions,
                multiplier: multipliers.experience.contribution,
                worth: totalContributions * multipliers.experience.contribution
            };

            web2Metrics.experienceValue = 
                web2Metrics.experienceBreakdown.accountAge.worth +
                web2Metrics.experienceBreakdown.prs.worth +
                web2Metrics.experienceBreakdown.contributions.worth;

            // 2. Skill Value
            const languages = repos.totalLanguageLinesOfCode || {};
            const totalLOC = Object.values(languages).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
            
            web2Metrics.skillBreakdown.linesOfCode = {
                value: totalLOC,
                multiplier: multipliers.skill.lineOfCode,
                worth: totalLOC * multipliers.skill.lineOfCode,
                breakdown: languages
            };

            web2Metrics.skillValue = web2Metrics.skillBreakdown.linesOfCode.worth;

            // 3. Influence Value
            const totalStars = repos.totalStars || 0;
            const totalForks = repos.totalForks || 0;
            const followers = userInfo.followers || 0;

            // Store influence metrics details
            web2Metrics.influenceBreakdown.stars = {
                value: totalStars,
                multiplier: multipliers.influence.star,
                worth: totalStars * multipliers.influence.star
            };

            web2Metrics.influenceBreakdown.forks = {
                value: totalForks,
                multiplier: multipliers.influence.fork,
                worth: totalForks * multipliers.influence.fork
            };

            web2Metrics.influenceBreakdown.followers = {
                value: followers,
                multiplier: multipliers.influence.follower,
                worth: followers * multipliers.influence.follower
            };

            web2Metrics.influenceValue = 
                web2Metrics.influenceBreakdown.stars.worth +
                web2Metrics.influenceBreakdown.forks.worth +
                web2Metrics.influenceBreakdown.followers.worth;
        }

        // Calculate total Web2 worth
        totalWorth = web2Metrics.experienceValue + web2Metrics.skillValue + web2Metrics.influenceValue;

        return {totalWorth, web2Metrics};
    }
} 


