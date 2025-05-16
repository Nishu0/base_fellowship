import { PrismaClient } from '@prisma/client';
import { Network } from 'alchemy-sdk';

const prisma = new PrismaClient();

const defaultConfig = {
    name: "default",
    description: "Default platform configuration",
    thresholds: {
        // Web3 thresholds
        mainnetContracts: 5,
        testnetContracts: 10,
        mainnetTVL: 200, // 1000
        uniqueUsers: 50,
        transactions: 3000,
        web3Languages: 10000000,
        cryptoRepoContributions: 5,
        hackathonWins: 2,

        // Web2 thresholds
        prs: 25,
        contributions: 200,
        forks: 200,
        stars: 200,
        issues: 10,
        totalLinesOfCode: 26639660,
        accountAge: 4998, //  year in days
        followers: 100
    },
    weights: {
        // Web3 weights
        mainnetContracts: 5,
        testnetContracts: 3,
        mainnetTVL: 3,
        uniqueUsers: 3,
        transactions: 42,
        web3Languages: 24,
        cryptoRepoContributions: 10,
        hackathonWins: 10,

        // Web2 weights
        prs: 15,
        contributions: 10,
        forks: 10,
        stars: 10,
        issues: 5,
        totalLinesOfCode: 20,
        accountAge: 10,
        followers: 10
    },
    // Developer worth multipliers
    developerWorthMultipliers: {
        // Web3 multipliers
        web3: {
            experience: {
                mainnetContract: 3000,    // Reduced from 5000
                testnetContract: 2000,     // Reduced from 2000
                cryptoRepoContribution: 100 // Reduced from 1000
            },
            skill: {
                solidity: 0.002,           // Reduced from 0.1
                rust: 0.003,              // Reduced from 0.15
                move: 0.0025,             // Reduced from 0.12
                cadence: 0.0025           // Reduced from 0.12
            },
            influence: {
                tvlMultiplier: 0.1,    // Reduced from 0.001
                uniqueUser: 20,           // Reduced from 100
                transaction: 20            // Reduced from 10
            }
        },
        // Web2 multipliers
        web2: {
            experience: {
                accountAge: 2,           // Reduced from 100
                pr: 100,                  // Reduced from 500
                contribution: 20          // Reduced from 50
            },
            skill: {
                lineOfCode: 0.0001       // Reduced from 0.05
            },
            influence: {
                star: 10,                 // Reduced from 100
                fork: 20,                 // Reduced from 200
                follower: 10              // Reduced from 50
            }
        }
    },
    enabledChains: {
        [Network.ETH_MAINNET]: true,
        [Network.ETH_SEPOLIA]: true,
        [Network.ARB_MAINNET]: false,
        [Network.OPT_MAINNET]: false,
        [Network.BASE_MAINNET]: true,
        [Network.BASE_SEPOLIA]: true,
        [Network.MATIC_MAINNET]: false,
    },
    cryptoRepos: {
        repositories: [
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
            'starkware-libs/cairo-lang',
            'alloy-rs/alloy',
            'alloy-rs/core',
            'noir-lang/noir',
            'paradigmxyz/reth',
            'Layr-Labs/eigensdk-rs',


        ],
        lastUpdated: new Date().toISOString()
    }
};

async function initPlatformConfig() {
    try {
        // Check if default config exists
        const existingConfig = await prisma.platformConfig.findUnique({
            where: { name: defaultConfig.name }
        });

        if (!existingConfig) {
            // Create default config
            await prisma.platformConfig.create({
                data: defaultConfig
            });
            console.log("Default platform configuration created successfully");
        } else {
            // Update existing config with new values
            await prisma.platformConfig.update({
                where: { name: defaultConfig.name },
                data: {
                    thresholds: defaultConfig.thresholds,
                    weights: defaultConfig.weights,
                    developerWorthMultipliers: defaultConfig.developerWorthMultipliers,
                    enabledChains: defaultConfig.enabledChains,
                    cryptoRepos: defaultConfig.cryptoRepos
                }
            });
            console.log("Default platform configuration updated successfully");
        }
    } catch (error) {
        console.error("Error initializing platform configuration:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the initialization
initPlatformConfig(); 