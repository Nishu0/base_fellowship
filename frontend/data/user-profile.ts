// Mock user profile data
export interface UserProfile {
  username: string;
  name: string;
  avatar: string;
  verified: boolean;
  bio: string;
  location: string;
  joinedDate: string;
  skills: string[];
  wallets: string[];
  twitter: string;
  scores: {
    overall: number;
    github: number;
    onchain: number;
    web2: number;
  };
  chains: {
    name: string;
    score: number;
    maxScore: number;
    transactions: number;
  }[];
  hackathonWins: number;
  githubActivity: {
    totalContributions: number;
    contributionsByDay: number[];
    contributionMonths: string[];
    topRepos: {
      name: string;
      stars: number;
      description: string;
    }[];
  };
  onchainActivity: {
    totalTransactions: number;
    transactionsByDay: number[];
    transactionMonths: string[];
    topProtocols: {
      name: string;
      txCount: number;
      category: string;
    }[];
  };
}

// Generate mock data for a single day
const generateDailyData = (max: number): number[] => {
  return Array.from({ length: 365 }, () => Math.floor(Math.random() * max));
};

// Mock months for heatmap
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Sample user profile data
export const sampleUserProfile: UserProfile = {
  username: "lilycode",
  name: "Lily Zhang",
  avatar: "https://avatars.githubusercontent.com/u/67890",
  verified: true,
  bio: "Blockchain developer with expertise in ZK proofs",
  location: "Vancouver, Canada",
  joinedDate: "May 2020",
  skills: ["Solidity", "zk-SNARK", "TypeScript", "React", "Rust"],
  wallets: [
    "0x6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z",
    "0x8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b"
  ],
  twitter: "lilycode",
  scores: {
    overall: 94,
    github: 92,
    onchain: 88,
    web2: 85
  },
  chains: [
    { name: "Ethereum", score: 84, maxScore: 100, transactions: 217 },
    { name: "Base", score: 68, maxScore: 100, transactions: 182 },
    { name: "Optimism", score: 58, maxScore: 100, transactions: 97 },
    { name: "Polygon", score: 52, maxScore: 100, transactions: 86 }
  ],
  hackathonWins: 4,
  githubActivity: {
    totalContributions: 847,
    contributionsByDay: generateDailyData(12),
    contributionMonths: months,
    topRepos: [
      { name: "zk-proofs-lib", stars: 326, description: "A library for zero-knowledge proofs implementation" },
      { name: "eth-smart-contracts", stars: 214, description: "Collection of Ethereum smart contracts" },
      { name: "defi-protocol", stars: 189, description: "Open-source DeFi lending protocol" },
      { name: "blockchain-analytics", stars: 124, description: "Tools for analyzing blockchain data" }
    ]
  },
  onchainActivity: {
    totalTransactions: 706,
    transactionsByDay: generateDailyData(8),
    transactionMonths: months,
    topProtocols: [
      { name: "Uniswap", txCount: 126, category: "DEX" },
      { name: "Aave", txCount: 89, category: "Lending" },
      { name: "OpenSea", txCount: 62, category: "NFT" },
      { name: "ENS", txCount: 48, category: "Identity" },
      { name: "Snapshot", txCount: 37, category: "Governance" }
    ]
  }
}; 