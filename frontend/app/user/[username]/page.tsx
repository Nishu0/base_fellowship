"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import Link from "next/link";
import { 
  Github, 
  Twitter, 
  Globe,
  ExternalLink, 
  Star, 
  ChevronDown, 
  MapPin, 
  Calendar, 
  BarChart4, 
  Code2, 
  Trophy, 
  BookOpen,
  Linkedin,
  FileCode,
  Users,
  GitFork,
  GitPullRequest,
  GitCommit,
  Layers,
  Share2,
  Copy,
  Check
} from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "@/lib/axiosClient";

// Format numbers to display with K for thousands, M for millions, etc.
const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return value.toString();
  }
};

// Format TVL values with proper currency formatting
const formatTVL = (value: string | number): string => {
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle invalid or zero values
  if (isNaN(numValue) || numValue === 0) return "$0.00";
  
  // Format based on value size
  if (numValue >= 1000000) {
    return `$${(numValue / 1000000).toFixed(2)}M`;
  } else if (numValue >= 1000) {
    return `$${(numValue / 1000).toFixed(2)}K`;
  } else {
    // Add commas to separate thousands
    return `$${numValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
};

// Add interface for ChainData to ensure consistent typing
interface ChainData {
  name: string;
  transactions: number;
  contracts: number;
  score: number;
  firstActivity: string | null;
  tvl: string;
  uniqueUsers: number;
  mainnet: {
    transactions: number;
    contracts: number;
    tvl: string;
    uniqueUsers: number;
  };
  testnet: {
    transactions: number;
    contracts: number;
    tvl: string;
    uniqueUsers: number;
  };
}

// Add Score component
const Score = ({ value }: { value: number }) => {
  const getColor = () => {
    if (value >= 80) return "text-green-500";
    if (value >= 60) return "text-yellow-500";
    if (value >= 40) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="flex items-center">
      <div className={`text-lg font-bold ${getColor()}`}>{value}</div>
      <div className="text-xs text-zinc-400 ml-1">/100</div>
    </div>
  );
};

export default function UserProfilePage() {
  const { username } = useParams();
  // Define TypeScript interface for API response
  interface GitHubUserData {
    userData: {
      avatar_url: string;
      name: string;
      login: string;
      bio: string;
      location: string;
      created_at: string;
      html_url: string;
      twitter_username: string;
      email: string;
      blog: string;
      followers: number;
      public_repos: number;
    };
    userRepoData: {
      totalForks: number;
      totalStars: number;
      detailedRepos: Array<{
        name: string;
        description: string | null;
        html_url: string;
        stargazers_count: number;
        forks_count: number; 
        languages: Record<string, number>;
      }>;
    };
    organizations?: Array<{
      id: number;
      login: string;
      avatar_url: string;
      description: string;
    }>;
    contributionData?: {
      totalContributions: number;
      totalPRs: number;
      totalIssues: number;
      contributionCalendar: {
        weeks: Array<{
          contributionDays: Array<{
            date: string;
            contributionCount: number;
          }>;
        }>;
      };
      repoContributions?: Record<string, number>;
    };
    onchainHistory?: Record<string, Array<{
      date: string;
      [key: string]: any;
    }>>;
    contractsDeployed?: Record<string, Array<{
      tvl: string;
      uniqueUsers: number;
      [key: string]: any;
    }>>;
    score?: {
      totalScore: number;
      metrics: {
        web2: {
          total: number;
          prs: { score: number; value: number };
          forks: { score: number; value: number };
          stars: { score: number; value: number };
          issues: { score: number; value: number };
          followers: { score: number; value: number };
          accountAge: { score: number; value: number };
          contributions: { score: number; value: number };
          totalLinesOfCode: { score: number; value: number };
        };
        web3: {
          total: number;
          mainnetTVL: { score: number; value: number };
          uniqueUsers: { score: number; value: number };
          transactions: { score: number; value: number };
          web3Languages: { score: number; value: number };
          mainnetContracts: { score: number; value: number };
          testnetContracts: { score: number; value: number };
          cryptoRepoContributions: { score: number; value: number };
        };
      };
    };
    developerWorth?: {
      totalWorth: number;
      breakdown: {
        web2Worth: number;
        web3Worth: number;
      };
    };
    hackathonData?: {
      WINS: {
        count: number;
        packs: Record<string, boolean>;
      };
      HACKER: {
        count: number;
        packs: Record<string, boolean>;
      };
      totalWins: number;
      totalHacker: number;
    };
  }

  const [userData, setUserData] = useState<GitHubUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isCopied, setIsCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedGithubYear, setSelectedGithubYear] = useState<number | null>(null);
  const [selectedOnchainYear, setSelectedOnchainYear] = useState<number | null>(null);
  
  // Get current URL for sharing
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://klyro.io/user/${username}`;
  };
  
  // Copy URL to clipboard
  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(getShareUrl()).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };
  
  // Generate Twitter share URL
  const getTwitterShareUrl = () => {
    if (!userData) return '';
    const githubScore = userData.score?.metrics?.web2?.total || 0;
    const onchainScore = userData.score?.metrics?.web3?.total || 0;
    const overallScore = Math.round((githubScore + onchainScore) / 2);
    
    const shareText = `Check out my Klyro developer profile!\n\nKlyro Score: ${overallScore}/100\nOnchain Score: ${onchainScore}/100\nGitHub Score: ${githubScore}/100\n\n`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getShareUrl())}`;
  };
  
  // Generate Warpcast share URL
  const getWarpcastShareUrl = () => {
    if (!userData) return '';
    const githubScore = userData.score?.metrics?.web2?.total || 0;
    const onchainScore = userData.score?.metrics?.web3?.total || 0;
    const overallScore = Math.round((githubScore + onchainScore) / 2);
    
    const shareText = `Check out ${userData.userData.name || username}'s profile on Klyro!\n\nOnchain Score: ${onchainScore}/100\nOverall: ${overallScore}/100`;
    return `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getShareUrl())}`;
  };
  
  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/fbi/status/${username}`);
        
        if (!response.data?.data?.userData) {
          throw new Error("API response missing expected data structure");
        }
        
        setUserData(response.data.data);
        setError("");
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err instanceof Error ? err.message : "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

  // Transform GitHub activity data for the heatmap
  const getGithubActivityData = (selectedYear: number | null = null) => {
    if (!userData?.contributionData?.contributionCalendar) {
      return { 
        contributionsByDay: [],
        contributionMonths: [] as string[],
        totalContributions: 0,
        availableYears: []
      };
    }

    const calendar = userData.contributionData.contributionCalendar;
    
    // Extract all dates from the contribution data
    const allDates = calendar.weeks.flatMap(week => 
      week.contributionDays.map(day => new Date(day.date))
    );
    
    // Get all years with activity
    const years = [...new Set(allDates.map(date => date.getFullYear()))].sort();
    
    // If no year is selected, use the most recent
    const yearToUse = selectedYear || (years.length > 0 ? years[years.length - 1] : new Date().getFullYear());
    
    // Filter contribution days for the selected year
    const yearContributions = calendar.weeks.flatMap(week => 
      week.contributionDays.filter(day => {
        const date = new Date(day.date);
        return date.getFullYear() === yearToUse;
      })
    );
    
    if (yearContributions.length === 0) {
      return {
        contributionsByDay: [],
        contributionMonths: [] as string[],
        totalContributions: 0,
        availableYears: years
      };
    }
    
    // Create start and end dates for the full year
    const startDate = new Date(yearToUse, 0, 1);
    const endDate = new Date(yearToUse, 11, 31);
    
    // Generate daily counts (including zeros for days with no activity)
    const dailyCounts = [];
    const months = new Set<string>();
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Find contribution for this date
      const contribution = yearContributions.find(day => day.date.split('T')[0] === dateStr);
      const count = contribution ? contribution.contributionCount : 0;
      
      dailyCounts.push(count);
      
      // Track month names
      const monthName = currentDate.toLocaleString('default', { month: 'short' });
      months.add(monthName);
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      contributionsByDay: dailyCounts,
      contributionMonths: Array.from(months),
      totalContributions: yearContributions.reduce((sum, day) => sum + day.contributionCount, 0),
      availableYears: years
    };
  };

  // Get top repositories sorted by stars
  const getTopRepos = () => {
    if (!userData?.userRepoData?.detailedRepos) return [];
    
    return userData.userRepoData.detailedRepos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map(repo => ({
        name: repo.name,
        description: repo.description || "No description",
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
        languages: repo.languages || {}
      }));
  };

  // Get user's top languages across all repos
  const getTopLanguages = () => {
    if (!userData?.userRepoData?.detailedRepos) return [];
    
    const languageTotals: Record<string, number> = {};
    
    // Aggregate all languages across repos
    userData.userRepoData.detailedRepos.forEach(repo => {
      Object.entries(repo.languages || {}).forEach(([lang, bytes]) => {
        languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
      });
    });
    
    // Convert to array and sort
    return Object.entries(languageTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: 0 // Will calculate below
      }));
  };
console.log("userData",userData);
  // Update processOnchainData to explicitly return ChainData[]
  const processOnchainData = () => {
    if (!userData?.onchainHistory || Object.keys(userData.onchainHistory).length === 0) {
      return {
        totalTransactions: 0,
        chains: [] as ChainData[],
        chainCount: 0,
        topChain: '',
        uniqueUsers: 0
      };
    }
    
    // Add debugging log
    console.log("contractsDeployed data:", userData?.contractsDeployed);

    const transactions: any[] = [];
    const chainGroups: Record<string, {
      name: string;
      mainnet: {
        transactions: number;
        contracts: number;
        tvl: string;
        uniqueUsers: number;
      };
      testnet: {
        transactions: number;
        contracts: number;
        tvl: string;
        uniqueUsers: number;
      };
      score: number;
      firstActivity: string | null;
    }> = {};
    
    // Get all chain names
    const chainNames = Object.keys(userData.onchainHistory || {});
    
    // Process transactions from each chain
    chainNames.forEach(chainName => {
      const txs = userData.onchainHistory?.[chainName] || [];
      if (!Array.isArray(txs) || txs.length === 0) return;
      
      // Add transactions
      transactions.push(...txs);
      
      // Extract chain info from name
      const isMainnet = chainName.includes('mainnet');
      const networkName = chainName.startsWith('eth') ? 'Ethereum' : 'Base';
      
      // Create chain data
      const txCount = txs.length;
      const contractsData = userData.contractsDeployed?.[chainName] || [];
      const contractCount = contractsData.length;
      
      // Get first activity date
      const dates = txs.map(tx => new Date(tx.date)).sort((a, b) => a.getTime() - b.getTime());
      const firstActivity = dates.length > 0 ? dates[0].toISOString() : null;
      
      // Calculate TVL
      let tvl = 0;
      if (contractsData.length > 0) {
        tvl = contractsData.reduce((sum, contract) => sum + (parseFloat(contract.tvl || "0")), 0);
      }
      
      // Calculate unique users directly from contract data
      let uniqueUsers = 0;
      if (contractsData.length > 0) {
        uniqueUsers = contractsData.reduce((sum, contract) => {
          // Make sure we're handling undefined/null values properly
          const userCount = contract.uniqueUsers !== undefined && contract.uniqueUsers !== null 
            ? Number(contract.uniqueUsers) 
            : 0;
          return sum + userCount;
        }, 0);
      }
      
      // If network already exists, update values
      if (chainGroups[networkName]) {
        if (isMainnet) {
          chainGroups[networkName].mainnet.transactions += txCount;
          chainGroups[networkName].mainnet.contracts += contractCount;
          chainGroups[networkName].mainnet.uniqueUsers += uniqueUsers;
          chainGroups[networkName].mainnet.tvl = (parseFloat(chainGroups[networkName].mainnet.tvl) + tvl).toFixed(2);
        } else {
          chainGroups[networkName].testnet.transactions += txCount;
          chainGroups[networkName].testnet.contracts += contractCount;
          chainGroups[networkName].testnet.uniqueUsers += uniqueUsers;
          chainGroups[networkName].testnet.tvl = (parseFloat(chainGroups[networkName].testnet.tvl) + tvl).toFixed(2);
        }
        
        // Update first activity if this one is earlier
        if (firstActivity && (!chainGroups[networkName].firstActivity || 
            new Date(firstActivity) < new Date(chainGroups[networkName].firstActivity!))) {
          chainGroups[networkName].firstActivity = firstActivity;
        }
        
        // Recalculate score based on total transactions
        const totalTransactions = chainGroups[networkName].mainnet.transactions + chainGroups[networkName].testnet.transactions;
        chainGroups[networkName].score = Math.min(Math.round(totalTransactions * 2), 100);
      } else {
        // Create new network entry with separate mainnet and testnet data
        chainGroups[networkName] = {
          name: networkName,
          mainnet: {
            transactions: isMainnet ? txCount : 0,
            contracts: isMainnet ? contractCount : 0,
            tvl: isMainnet ? tvl.toFixed(2) : "0.00",
            uniqueUsers: isMainnet ? uniqueUsers : 0
          },
          testnet: {
            transactions: isMainnet ? 0 : txCount,
            contracts: isMainnet ? 0 : contractCount,
            tvl: isMainnet ? "0.00" : tvl.toFixed(2),
            uniqueUsers: isMainnet ? 0 : uniqueUsers
          },
          score: Math.min(Math.round(txCount * 2), 100),
          firstActivity
        };
      }
    });
    
    // Convert to ChainData format for compatibility
    const chains = Object.entries(chainGroups).map(([_, data]) => ({
      name: data.name,
      transactions: data.mainnet.transactions + data.testnet.transactions,
      contracts: data.mainnet.contracts + data.testnet.contracts,
      score: data.score,
      firstActivity: data.firstActivity,
      tvl: (parseFloat(data.mainnet.tvl) + parseFloat(data.testnet.tvl)).toFixed(2),
      uniqueUsers: data.mainnet.uniqueUsers + data.testnet.uniqueUsers,
      mainnet: data.mainnet,
      testnet: data.testnet
    })) as ChainData[];
    
    // Calculate total unique users directly from contractsDeployed
    // This ensures we handle empty arrays correctly
    let totalUniqueUsers = 0;
    if (userData.contractsDeployed) {
      Object.values(userData.contractsDeployed).forEach(contracts => {
        if (Array.isArray(contracts)) {
          contracts.forEach(contract => {
            if (contract.uniqueUsers !== undefined && contract.uniqueUsers !== null) {
              totalUniqueUsers += Number(contract.uniqueUsers);
            }
          });
        }
      });
    }
    
    // Find top chain by transaction count
    const topChain = chains.length > 0 
      ? chains.reduce((max, chain) => chain.transactions > max.transactions ? chain : max, chains[0]).name
      : '';
    
    return {
      totalTransactions: transactions.length,
      chains,
      chainCount: chains.length,
      topChain,
      uniqueUsers: totalUniqueUsers
    };
  };

  // Process onchain data for heatmap with year selection
  const getOnchainActivityData = (selectedYear: number | null = null) => {
    if (!userData?.onchainHistory || Object.keys(userData.onchainHistory).length === 0) {
      return {
        transactionsByDay: [],
        activityMonths: [] as string[],
        totalTransactions: 0,
        availableYears: []
      };
    }

    // Collect all transactions from all chains
    const allTransactions = Object.values(userData.onchainHistory).flat();
    
    // Get all years with activity
    const years = [...new Set(allTransactions.map(tx => new Date(tx.date).getFullYear()))].sort();
    
    // If no year is selected, use the most recent
    const yearToUse = selectedYear || (years.length > 0 ? years[years.length - 1] : new Date().getFullYear());
    
    // Filter transactions for the selected year
    const yearTransactions = allTransactions.filter(tx => new Date(tx.date).getFullYear() === yearToUse);
    
    if (yearTransactions.length === 0) {
      return {
        transactionsByDay: [],
        activityMonths: [] as string[],
        totalTransactions: 0,
        availableYears: years
      };
    }
    
    // Create start and end dates for the full year
    const startDate = new Date(yearToUse, 0, 1);
    const endDate = new Date(yearToUse, 11, 31);
    
    // Generate daily counts (including zeros for days with no activity)
    const dailyCounts = [];
    const months = new Set<string>();
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Count transactions on this date
      const count = yearTransactions.filter(tx => 
        tx.date.split('T')[0] === dateStr
      ).length;
      
      dailyCounts.push(count);
      
      // Track month names
      const monthName = currentDate.toLocaleString('default', { month: 'short' });
      months.add(monthName);
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      transactionsByDay: dailyCounts,
      activityMonths: Array.from(months),
      totalTransactions: yearTransactions.length,
      availableYears: years
    };
  };

  // Calculate scores
  const calculateScores = () => {
    if (!userData) return { github: 0, onchain: 0, web2: 0, overall: 0 };
    
    const onchainScore = userData.score?.metrics?.web3?.total 
      ? Math.round(userData.score.metrics.web3.total) 
      : 0;
    
    // Default a baseline web2 score if not available
    const web2Score = userData.score?.metrics?.web2?.total 
      ? Math.round(userData.score.metrics.web2.total) 
      : 70;
    
    // Calculate overall score
    const overall = Math.round((web2Score + onchainScore) / 2);
    
    return {
      onchain: onchainScore,
      web2: web2Score,
      overall
    };
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Group chains by network
  const groupChainsByNetwork = (chains: ChainData[]) => {
    return chains; // No longer need to group as we already organized by network
  };

  // Helper function to get network icon
  const getNetworkIcon = (networkName: string): string | undefined => {
    const lowerNetworkName = networkName.toLowerCase();
    if (lowerNetworkName.includes('eth')) {
      return '/ethereum.svg';
    } else if (lowerNetworkName.includes('base')) {
      return '/base.svg';
    }
    // Return undefined for networks without icons
    return undefined;
  };

  // Add this function before the return statement to get top contributed repos
  const getTopContributedRepos = () => {
    if (!userData?.contributionData?.repoContributions) return [];
    
    // Convert object to array and sort by contribution count
    return Object.entries(userData.contributionData.repoContributions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([repoName, count]) => ({
        name: repoName,
        contributions: count
      }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center p-6 bg-zinc-900 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-4">Error Loading Profile</h2>
          <p className="text-zinc-400 mb-6">{error || "User data not available"}</p>
          <Link href="/user">
            <Button variant="outline">Back to Users</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get transformed data
  const githubActivity = getGithubActivityData(selectedGithubYear);
  const onchainActivity = getOnchainActivityData(selectedOnchainYear);
  const topRepos = getTopRepos();
  const topLanguages = getTopLanguages();
  const scores = calculateScores();
  const onchainData = processOnchainData();

  // Calculate total bytes for languages to get percentages
  const totalLanguageBytes = topLanguages.reduce((sum, lang) => sum + lang.bytes, 0);
  topLanguages.forEach(lang => {
    lang.percentage = Math.round((lang.bytes / totalLanguageBytes) * 100);
  });

  // Create user object from API data
  const user = {
    name: userData.userData.name || userData.userData.login,
    username: userData.userData.login,
    avatar: userData.userData.avatar_url,
    bio: userData.userData.bio || "",
    location: userData.userData.location || "Unknown",
    joinedDate: formatDate(userData.userData.created_at),
    twitter: userData.userData.twitter_username,
    email: userData.userData.email,
    blogUrl: userData.userData.blog,
    verified: true,
    githubUrl: userData.userData.html_url,
    skills: topLanguages.map(lang => lang.name),
    scores,
    worth: {
      total: userData.developerWorth?.totalWorth || 0,
      web2: userData.developerWorth?.breakdown?.web2Worth || 0,
      web3: userData.developerWorth?.breakdown?.web3Worth || 0
    },
    chains: onchainData.chains as ChainData[],
    githubActivity: {
      contributionsByDay: githubActivity.contributionsByDay,
      contributionMonths: githubActivity.contributionMonths as string[],
      totalContributions: githubActivity.totalContributions,
      topRepos,
      followers: userData.userData.followers,
      repos: userData.userData.public_repos,
      stars: userData.userRepoData.totalStars || 0,
      forks: userData.userRepoData.totalForks || 0,
      contributions: githubActivity.totalContributions,
      prs: userData.contributionData?.totalPRs || 0,
      issues: userData.contributionData?.totalIssues || 0
    },
    onchainActivity: {
      totalTransactions: onchainData.totalTransactions,
      chains: onchainData.chains as ChainData[],
      chainCount: onchainData.chainCount,
      topChain: onchainData.topChain,
      uniqueUsers: onchainData.uniqueUsers,
      transactionsByDay: onchainActivity.transactionsByDay,
      activityMonths: onchainActivity.activityMonths as string[]
    }
  };

  return (
    <main className="bg-black min-h-screen text-white">
      <div className="pt-8 pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Profile Image and Badge Section */}
              <div className="relative">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-black">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-lg font-semibold rounded-full w-10 h-10 flex items-center justify-center border-4 border-black">
                  {user.scores.overall}
                </div>
              </div>
              
              {/* User Info Section */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h1 className="text-3xl font-bold flex items-center mb-1">
                      {user.name}
                    </h1>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-zinc-800 text-zinc-200">@{user.username}</Badge>
                    </div>
                  </div>
                  
                  {/* Social Media Icons */}
                  <div className="flex items-center gap-2">
                    <Link href={`https://github.com/${user.username}`} target="_blank">
                      <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-700 h-10 w-10 rounded-full">
                        <Github className="h-5 w-5" />
                      </Button>
                    </Link>
                    {user.twitter && (
                      <Link href={`https://twitter.com/${user.twitter}`} target="_blank">
                        <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-700 h-10 w-10 rounded-full">
                          <svg width="18" height="16" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.99 0H20.298L13.071 8.26004L21.573 19.5H14.916L9.70202 12.683L3.73597 19.5H0.426L8.15602 10.665L0 0H6.82602L11.539 6.23104L16.99 0ZM15.829 17.52H17.662L5.83002 1.876H3.86297L15.829 17.52Z" fill="#ffffff"></path>
                          </svg>
                        </Button>
                      </Link>
                    )}
                    {user.blogUrl && (
                      <Link href={user.blogUrl} target="_blank">
                        <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-700 h-10 w-10 rounded-full">
                          <Globe className="h-5 w-5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                
                <p className="text-zinc-300 mb-3">{user.bio}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {user.skills.slice(0, 4).map(skill => (
                    <Badge key={skill} className="bg-zinc-800 text-zinc-200">
                      {skill}
                    </Badge>
                  ))}
                  {user.skills.length > 4 && (
                    <Badge className="bg-zinc-800 text-zinc-200">
                      +{user.skills.length - 4}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                  {user.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {user.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {user.joinedDate}
                  </div>
                  {user.blogUrl && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      <a href={user.blogUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 truncate">
                        {user.blogUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Worth and Score Section */}
              <div className="flex flex-col gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 min-w-[180px]">
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-1">Overall Score</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold">{user.scores.overall}</span>
                    <span className="text-sm text-zinc-500 mb-1">/100</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-1">Overall Worth</h3>
                  <div className="text-2xl font-bold">${formatNumber(user.worth.total)}</div>
                </div>
                <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full mt-2 bg-zinc-900 border-zinc-700">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold mb-2">Share this profile</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Share {user.name}'s developer profile with your network
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col space-y-4 mt-4">
                      <a 
                        href={getTwitterShareUrl()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a94e1] text-white py-2 px-4 rounded-lg font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-8 transition-all md:size-8" width="35" height="35" viewBox="0 0 35 35" fill="none">
  <g clipPath="url(#clip0_8588_28065)">
    <mask id="mask0_8588_28065" mask-type="luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="35" height="35">
      <path d="M34.2721 0.729736H0.725311V34.2765H34.2721V0.729736Z" fill="white" />
    </mask>
    <g mask="url(#mask0_8588_28065)">
      <path d="M24.0418 7.28345H27.5097L19.9334 15.9427L28.8463 27.726H21.8675L16.4015 20.5795L10.1471 27.726H6.67718L14.7808 18.4639L6.23059 7.28345H13.3865L18.3273 13.8156L24.0418 7.28345ZM22.8247 25.6503H24.7463L12.3424 9.25013H10.2803L22.8247 25.6503Z" className="fill-black group-hover:fill-joule_orange transition-colors" />
    </g>
  </g>
  <defs>
    <clipPath id="clip0_8588_28065">
      <rect width="33.5467" height="33.5467" fill="white" transform="translate(0.720398 0.723633)" />
    </clipPath>
  </defs>
            </svg>
                        Share on Twitter
                      </a>
                      <a 
                        href={getWarpcastShareUrl()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium"
                      >
                        <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.28994 0H20.4142V25H18.0473V13.5484H18.0241C17.7625 10.3834 15.323 7.90323 12.3521 7.90323C9.38119 7.90323 6.94161 10.3834 6.68002 13.5484H6.65681V25H4.28994V0Z" fill="white"/>
<path d="M0 3.54839L0.961538 7.09677H1.77515V21.4516C1.36665 21.4516 1.0355 21.8127 1.0355 22.2581V23.2258H0.887574C0.479079 23.2258 0.147929 23.5869 0.147929 24.0323V25H8.43195V24.0323C8.43195 23.5869 8.1008 23.2258 7.69231 23.2258H7.54438V22.2581C7.54438 21.8127 7.21323 21.4516 6.80473 21.4516H5.91716V3.54839H0Z" fill="white"/>
<path d="M18.1953 21.4516C17.7868 21.4516 17.4556 21.8127 17.4556 22.2581V23.2258H17.3077C16.8992 23.2258 16.568 23.5869 16.568 24.0323V25H24.8521V24.0323C24.8521 23.5869 24.5209 23.2258 24.1124 23.2258H23.9645V22.2581C23.9645 21.8127 23.6333 21.4516 23.2249 21.4516V7.09677H24.0385L25 3.54839H19.0828V21.4516H18.1953Z" fill="white"/>
</svg>

                        Share on Warpcast
                      </a>
                      <button 
                        className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg font-medium"
                        onClick={copyToClipboard}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-5 w-5 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-5 w-5" />
                            Copy Link
                          </>
                        )}
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content section */}
      <section className="relative pb-6">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 to-black z-0"></div>
        
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Left Column - Score Overview */}
            <div className="w-full md:w-80 space-y-5">
              {/* Score Overview Card */}
              <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-5">Score Overview</h2>
                
                <div className="space-y-5">
                  {/* Overall Score */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-zinc-400">Overall Score</span>
                      <span className="font-medium">{user.scores.overall}/100</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800/60 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                        style={{ width: `${user.scores.overall}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Onchain Score */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-zinc-400">Onchain Score</span>
                      <span className="font-medium">{user.scores.onchain}/100</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800/60 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${user.scores.onchain}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Web2 Score */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-zinc-400">Web2 Score</span>
                      <span className="font-medium">{user.scores.web2}/100</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800/60 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${user.scores.web2}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Worth Overview Card */}
              <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-5">Worth Overview</h2>
                
                <div className="space-y-5">
                  {/* Overall Score */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-zinc-400">Overall Worth</span>
                      <span className="font-medium">${formatNumber(user.worth.total)}</span>
                    </div>
                  </div>
                  
                  {/* Onchain Score */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-zinc-400">Web2 Worth</span>
                      <span className="font-medium">${formatNumber(user.worth.web2)}</span>
                    </div>
                  </div>
                  
                  {/* Web2 Score */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-zinc-400">Web3 Worth</span>
                      <span className="font-medium">${formatNumber(user.worth.web3)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Main content area */}
            <div className="w-full md:w-2/3 lg:w-3/4 space-y-6">
              {/* Tabs navigation */}
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-full p-1 inline-flex overflow-x-auto">
                <Button 
                  variant={activeTab === "overview" ? "default" : "ghost"} 
                  onClick={() => setActiveTab("overview")}
                  className={`rounded-full px-6 ${activeTab === "overview" ? "bg-indigo-600 hover:bg-indigo-700" : "hover:bg-zinc-800/70 text-zinc-300"}`}
                >
                  Overview
                </Button>
                <Button 
                  variant={activeTab === "github" ? "default" : "ghost"} 
                  onClick={() => setActiveTab("github")}
                  className={`rounded-full px-6 ${activeTab === "github" ? "bg-indigo-600 hover:bg-indigo-700" : "hover:bg-zinc-800/70 text-zinc-300"}`}
                >
                  GitHub
                </Button>
                <Button 
                  variant={activeTab === "chains" ? "default" : "ghost"} 
                  onClick={() => setActiveTab("chains")}
                  className={`rounded-full px-6 ${activeTab === "chains" ? "bg-indigo-600 hover:bg-indigo-700" : "hover:bg-zinc-800/70 text-zinc-300"}`}
                >
                  Chains
                </Button>
                <Button 
                  variant={activeTab === "hackathon" ? "default" : "ghost"} 
                  onClick={() => setActiveTab("hackathon")}
                  className={`rounded-full px-6 ${activeTab === "hackathon" ? "bg-indigo-600 hover:bg-indigo-700" : "hover:bg-zinc-800/70 text-zinc-300"}`}
                >
                  Hackathon
                </Button>
                <Button 
                  variant={activeTab === "skills" ? "default" : "ghost"} 
                  onClick={() => setActiveTab("skills")}
                  className={`rounded-full px-6 ${activeTab === "skills" ? "bg-indigo-600 hover:bg-indigo-700" : "hover:bg-zinc-800/70 text-zinc-300"}`}
                >
                  Skills
                </Button>
              </div>
              
              {/* Tab content */}
              {activeTab === "overview" && (
                <>
                  {/* GitHub stats card */}
                  <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center">
                        <Github className="h-5 w-5 mr-2 text-blue-400" />
                        <h2 className="text-lg font-bold">GitHub Activity</h2>
                      </div>
                      <Badge className="bg-blue-900/70 text-blue-300 border-blue-700">
                        Score: {user.scores.web2}/100
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-5">
                      <div className="bg-zinc-900/70 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.githubActivity.repos}</div>
                        <div className="text-xs text-zinc-400">Repositories</div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.githubActivity.followers}</div>
                        <div className="text-xs text-zinc-400">Followers</div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.githubActivity.stars}</div>
                        <div className="text-xs text-zinc-400">Stars</div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.githubActivity.forks}</div>
                        <div className="text-xs text-zinc-400">Forks</div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.githubActivity.prs}</div>
                        <div className="text-xs text-zinc-400">Pull Requests</div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.githubActivity.contributions}</div>
                        <div className="text-xs text-zinc-400">Contributions</div>
                      </div>
                    </div>
                    
                    {/* GitHub heatmap */}
                    <div className="w-full pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium">GitHub Contributions</h3>
                        {githubActivity.availableYears.length > 0 && (
                          <div className="flex space-x-2">
                            {githubActivity.availableYears.map(year => (
                              <button
                                key={year}
                                onClick={() => setSelectedGithubYear(year)}
                                className={`px-2 py-1 text-xs rounded-md ${
                                  selectedGithubYear === year 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <ActivityHeatmap
                        data={user.githubActivity.contributionsByDay}
                        months={user.githubActivity.contributionMonths}
                        colorScheme="github"
                        title=""
                        totalCount={user.githubActivity.totalContributions}
                      />
                    </div>
                  </div>
                  
                  {/* Blockchain activity card */}
                  <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center">
                        <BarChart4 className="h-5 w-5 mr-2 text-indigo-400" />
                        <h2 className="text-lg font-bold">Blockchain Activity</h2>
                      </div>
                      <Badge className="bg-indigo-900/70 text-indigo-300 border-indigo-700 hover:bg-indigo-900/80">
                        Score: {user.scores.onchain}/100
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                      <div className="bg-zinc-900/70 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.onchainActivity.chainCount}</div>
                        <div className="text-xs text-zinc-400">Chains</div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.onchainActivity.totalTransactions}</div>
                        <div className="text-xs text-zinc-400">Transactions</div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">
                          {user.chains.reduce((sum, chain) => sum + chain.contracts, 0)}
                        </div>
                        <div className="text-xs text-zinc-400">Contracts</div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">
                          {formatTVL(user.chains.reduce((sum, chain) => sum + parseFloat(chain.tvl || "0"), 0))}
                        </div>
                        <div className="text-xs text-zinc-400">Total TVL</div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.onchainActivity.uniqueUsers}</div>
                        <div className="text-xs text-zinc-400">Unique Users</div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.onchainActivity.topChain}</div>
                        <div className="text-xs text-zinc-400">Top Chain</div>
                      </div>
                    </div>
                    
                    {user.onchainActivity.transactionsByDay.length > 0 && (
                      <div className="w-full mb-5">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">On-chain Transactions</h3>
                          {onchainActivity.availableYears.length > 0 && (
                            <div className="flex space-x-2">
                              {onchainActivity.availableYears.map(year => (
                                <button
                                  key={year}
                                  onClick={() => setSelectedOnchainYear(year)}
                                  className={`px-2 py-1 text-xs rounded-md ${
                                    selectedOnchainYear === year 
                                      ? 'bg-indigo-600 text-white' 
                                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                  }`}
                                >
                                  {year}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <ActivityHeatmap
                          data={user.onchainActivity.transactionsByDay}
                          months={user.onchainActivity.activityMonths}
                          colorScheme="onchain"
                          title=""
                          totalCount={user.onchainActivity.totalTransactions}
                          contributions="onchain"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === "github" && (
                <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">GitHub Activity</h2>
                    <Badge className="bg-blue-900/70 text-blue-300 border-blue-700">
                      Web2 Score: {user.scores.web2}/100
                    </Badge>
                  </div>
                  
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">Contributions</h3>
                      {githubActivity.availableYears.length > 0 && (
                        <div className="flex space-x-2">
                          {githubActivity.availableYears.map(year => (
                            <button
                              key={year}
                              onClick={() => setSelectedGithubYear(year)}
                              className={`px-2 py-1 text-xs rounded-md ${
                                selectedGithubYear === year 
                                  ? 'bg-indigo-600 text-white' 
                                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                              }`}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <ActivityHeatmap
                      data={user.githubActivity.contributionsByDay}
                      months={user.githubActivity.contributionMonths}
                      colorScheme="github"
                      title=""
                      totalCount={user.githubActivity.totalContributions}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-zinc-300 mb-3">GitHub Stats</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <div className="bg-zinc-900/70 rounded-lg p-3">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <GitFork className="h-4 w-4 mr-2 text-zinc-400" />
                            <span className="text-sm">Forks</span>
                          </div>
                          <span className="text-indigo-400 font-medium mt-1">{user.githubActivity.forks}</span>
                        </div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-2 text-zinc-400" />
                            <span className="text-sm">Stars</span>
                          </div>
                          <span className="text-indigo-400 font-medium mt-1">{user.githubActivity.stars}</span>
                        </div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <GitPullRequest className="h-4 w-4 mr-2 text-zinc-400" />
                            <span className="text-sm">PRs</span>
                          </div>
                          <span className="text-indigo-400 font-medium mt-1">{user.githubActivity.prs}</span>
                        </div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <GitCommit className="h-4 w-4 mr-2 text-zinc-400" />
                            <span className="text-sm">Issues</span>
                          </div>
                          <span className="text-indigo-400 font-medium mt-1">{user.githubActivity.issues}</span>
                        </div>
                      </div>
                      <div className="bg-zinc-900/70 rounded-lg p-3">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-zinc-400" />
                            <span className="text-sm">Followers</span>
                          </div>
                          <span className="text-indigo-400 font-medium mt-1">{user.githubActivity.followers}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Organizations */}
                  
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <h3 className="text-sm font-medium text-zinc-300 mb-3">Top Repositories by Contributions</h3>
                      <div className="space-y-3">
                        {getTopContributedRepos().map((repo, index) => (
                          <div key={index} className="bg-zinc-900/70 rounded-lg p-3">
                            <div className="font-medium mb-1 truncate">{repo.name}</div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center text-xs text-yellow-500">
                                  <GitCommit className="h-3 w-3 mr-1" />
                                  {repo.contributions}
                                </div>
                              </div>
                              <a 
                                href={`https://github.com/${repo.name}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-400 hover:underline flex items-center"
                              >
                                View
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-zinc-300 mb-3">Top Repositories by Stars</h3>
                      <div className="space-y-3">
                        {user.githubActivity.topRepos.slice(0, 3).map((repo, index) => (
                          <div key={index} className="bg-zinc-900/70 rounded-lg p-3">
                            <div className="font-medium mb-1 truncate">{repo.name}</div>
                            <p className="text-xs text-zinc-400 mb-2 line-clamp-2">{repo.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center text-xs text-yellow-500">
                                  <Star className="h-3 w-3 mr-1" />
                                  {repo.stars}
                                </div>
                                <div className="flex items-center text-xs text-purple-500">
                                  <GitFork className="h-3 w-3 mr-1" />
                                  {repo.forks}
                                </div>
                              </div>
                              <a 
                                href={repo.url} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-400 hover:underline flex items-center"
                              >
                                View
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {userData?.organizations && userData.organizations.length > 0 && (
                    <div className="mt-6 mb-6">
                      <h3 className="text-sm font-medium text-zinc-300 mb-3">Organizations</h3>
                      <div className="flex flex-wrap gap-3">
                        {userData.organizations.map(org => (
                          <a 
                            key={org.id}
                            href={`https://github.com/${org.login}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-zinc-900/70 rounded-lg p-2 hover:bg-zinc-800 transition-colors"
                          >
                            <Image
                              src={org.avatar_url}
                              alt={org.login}
                              width={32}
                              height={32}
                              className="rounded-md h-8 w-8"
                            />
                            <div>
                              <div className="font-medium text-sm">{org.login}</div>
                              {org.description && (
                                <div className="text-xs text-zinc-400 max-w-[150px] truncate">{org.description}</div>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "chains" && (
                <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Blockchain Activity</h2>
                    <Badge className="bg-indigo-900/70 text-indigo-300 border-indigo-700">
                      Web3 Score: {user.scores.onchain}/100
                    </Badge>
                  </div>
                  
                  {user.onchainActivity.totalTransactions > 0 ? (
                    <>
                      {user.onchainActivity.transactionsByDay.length > 0 && (
                        <div className="w-full mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium">On-chain Transactions</h3>
                            {onchainActivity.availableYears.length > 0 && (
                              <div className="flex space-x-2">
                                {onchainActivity.availableYears.map(year => (
                                  <button
                                    key={year}
                                    onClick={() => setSelectedOnchainYear(year)}
                                    className={`px-2 py-1 text-xs rounded-md ${
                                      selectedOnchainYear === year 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                    }`}
                                  >
                                    {year}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <ActivityHeatmap
                            data={user.onchainActivity.transactionsByDay}
                            months={user.onchainActivity.activityMonths}
                            colorScheme="onchain"
                            title=""
                            totalCount={user.onchainActivity.totalTransactions}
                            contributions="onchain"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-6">
                        {user.chains.map((chain) => (
                          <div key={chain.name} className="bg-zinc-900/70 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-zinc-800">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-md font-medium mr-3">
                                  {getNetworkIcon(chain.name) ? (
                                    <Image
                                      src={getNetworkIcon(chain.name) as string}
                                      alt={chain.name}
                                      width={24}
                                      height={24}
                                      className="h-5 w-5 object-contain"
                                    />
                                  ) : (
                                    chain.name.charAt(0)
                                  )}
                                </div>
                                <span className="text-lg font-medium">{chain.name}</span>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              {/* Network Types (Mainnet/Testnet) */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-zinc-800/50 rounded-lg p-3">
                                  <div className="font-medium text-indigo-200 mb-2">Mainnet</div>
                                  <div className="grid grid-cols-4 gap-2 text-center">
                                    <div>
                                      <div className="text-lg font-semibold text-indigo-400">{chain.mainnet.transactions}</div>
                                      <div className="text-xs text-zinc-400">Txns</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-semibold text-indigo-400">{chain.mainnet.contracts || 0}</div>
                                      <div className="text-xs text-zinc-400">Contracts</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-semibold text-indigo-400">{formatTVL(chain.mainnet.tvl)}</div>
                                      <div className="text-xs text-zinc-400">TVL</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-semibold text-indigo-400">{chain.mainnet.uniqueUsers || 0}</div>
                                      <div className="text-xs text-zinc-400">Users</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-zinc-800/50 rounded-lg p-3">
                                  <div className="font-medium text-indigo-200 mb-2">Testnet</div>
                                  <div className="grid grid-cols-4 gap-2 text-center">
                                    <div>
                                      <div className="text-lg font-semibold text-indigo-400">{chain.testnet.transactions}</div>
                                      <div className="text-xs text-zinc-400">Txns</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-semibold text-indigo-400">{chain.testnet.contracts || 0}</div>
                                      <div className="text-xs text-zinc-400">Contracts</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-semibold text-indigo-400">{formatTVL(chain.testnet.tvl)}</div>
                                      <div className="text-xs text-zinc-400">TVL</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-semibold text-indigo-400">{chain.testnet.uniqueUsers || 0}</div>
                                      <div className="text-xs text-zinc-400">Users</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-zinc-500">
                      <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No blockchain activity data available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "hackathon" && (
                <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Hackathon Achievements</h2>
                    {userData?.hackathonData && (userData.hackathonData.totalWins > 0 || userData.hackathonData.totalHacker > 0) && (
                      <Badge className="bg-purple-900/70 text-purple-300 border-purple-700">
                        Hacker Experience
                      </Badge>
                    )}
                  </div>
                  
                  {userData?.hackathonData ? (
                    <div className="space-y-6">
                      {/* Packs Section */}
                      <div>
                        <h3 className="text-md font-medium text-zinc-200 mb-4">ETHGlobal Packs</h3>
                        {userData.hackathonData.HACKER.count > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Hacker Pack */}
                            {userData.hackathonData.HACKER.packs["Hacker Pack"] && (
                              <a 
                                href="https://ethglobal.com/packs/hacker" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-zinc-900/70 rounded-xl p-4 border border-zinc-800/50 hover:border-purple-800/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-purple-400" />
                                  </div>
                                  <h4 className="text-lg font-medium">Hacker Pack</h4>
                                </div>
                                <p className="text-sm text-zinc-400 mb-3">
                                  A pack exclusive for ETHGlobal hackers with access to Faucets and developer perks
                                </p>
                                <div className="flex items-center text-xs text-purple-400">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View on ETHGlobal
                                </div>
                              </a>
                            )}
                            
                            {/* Builder Pack */}
                            {userData.hackathonData.HACKER.packs["Builder Pack"] && (
                              <a 
                                href="https://ethglobal.com/packs/builder" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-zinc-900/70 rounded-xl p-4 border border-zinc-800/50 hover:border-purple-800/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-purple-400" />
                                  </div>
                                  <h4 className="text-lg font-medium">Builder Pack</h4>
                                </div>
                                <p className="text-sm text-zinc-400 mb-3">
                                  A pack exclusive for seasoned ETHGlobal hackers with access to more onchain perks
                                </p>
                                <div className="flex items-center text-xs text-purple-400">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View on ETHGlobal
                                </div>
                              </a>
                            )}
                            
                            {/* Pioneer Pack */}
                            {userData.hackathonData.HACKER.packs["Pioneer Pack"] && (
                              <a 
                                href="https://ethglobal.com/packs/pioneer" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-zinc-900/70 rounded-xl p-4 border border-zinc-800/50 hover:border-purple-800/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-purple-400" />
                                  </div>
                                  <h4 className="text-lg font-medium">Pioneer Pack</h4>
                                </div>
                                <p className="text-sm text-zinc-400 mb-3">
                                  A Pack for highly experienced ETHGlobal hackers with tons of perks and rewards
                                </p>
                                <div className="flex items-center text-xs text-purple-400">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View on ETHGlobal
                                </div>
                              </a>
                            )}
                            
                            {/* Supporter Pack */}
                            {userData.hackathonData.HACKER.packs["Supporter Pack"] && (
                              <a 
                                href="https://ethglobal.com/packs/supporter" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-zinc-900/70 rounded-xl p-4 border border-zinc-800/50 hover:border-purple-800/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-purple-400" />
                                  </div>
                                  <h4 className="text-lg font-medium">Supporter Pack</h4>
                                </div>
                                <p className="text-sm text-zinc-400 mb-3">
                                  A Pack for supporters of ETHGlobal events, especially mentors and volunteers
                                </p>
                                <div className="flex items-center text-xs text-purple-400">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View on ETHGlobal
                                </div>
                              </a>
                            )}
                            
                            {/* Partner Pack */}
                            {userData.hackathonData.HACKER.packs["Partner Pack"] && (
                              <a 
                                href="https://ethglobal.com/packs/partner" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-zinc-900/70 rounded-xl p-4 border border-zinc-800/50 hover:border-purple-800/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-purple-400" />
                                  </div>
                                  <h4 className="text-lg font-medium">Partner Pack</h4>
                                </div>
                                <p className="text-sm text-zinc-400 mb-3">
                                  A Pack for partners of ETHGlobal events who attend on behalf of supporting companies
                                </p>
                                <div className="flex items-center text-xs text-purple-400">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View on ETHGlobal
                                </div>
                              </a>
                            )}
                            
                            {/* OG Pack */}
                            {userData.hackathonData.HACKER.packs["OG Pack"] && (
                              <a 
                                href="https://ethglobal.com/packs/og" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-zinc-900/70 rounded-xl p-4 border border-zinc-800/50 hover:border-purple-800/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-purple-400" />
                                  </div>
                                  <h4 className="text-lg font-medium">OG Pack</h4>
                                </div>
                                <p className="text-sm text-zinc-400 mb-3">
                                  A Pack for OG members of the ETHGlobal community, especially judges and speakers
                                </p>
                                <div className="flex items-center text-xs text-purple-400">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View on ETHGlobal
                                </div>
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="bg-zinc-900/50 rounded-xl p-6 text-center">
                            <Trophy className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
                            <p className="text-zinc-500">No packs found. Try with a different address.</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Wins Section */}
                      <div>
                        <h3 className="text-md font-medium text-zinc-200 mb-4">Hackathon Wins</h3>
                        {userData.hackathonData.WINS.count > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.keys(userData.hackathonData.WINS.packs).map((hackathon) => (
                              <div 
                                key={hackathon}
                                className="bg-zinc-900/70 rounded-lg p-3 border border-zinc-800/50"
                              >
                                <div className="flex items-center gap-2">
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                  <span className="font-medium text-sm">{hackathon}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-zinc-900/50 rounded-xl p-6 text-center">
                            <Trophy className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
                            <p className="text-zinc-500">No hackathon wins yet. Keep building!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-900/50 rounded-xl p-8 text-center">
                      <Trophy className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
                      <h3 className="text-xl font-medium text-zinc-400 mb-2">No Hackathon Data</h3>
                      <p className="text-zinc-500 max-w-md mx-auto">
                        No hackathon data found for this user. Try connecting your ETHGlobal wallet to display your achievements.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "skills" && (
                <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                      <Code2 className="h-5 w-5 mr-2 text-purple-400" />
                      <h2 className="text-lg font-bold">Skills & Expertise</h2>
                    </div>
                  </div>
                  
                  <div className="mb-5">
                    <h3 className="text-sm font-medium mb-3">Programming Languages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topLanguages.slice(0, 6).map((lang, index) => (
                        <div key={lang.name} className="bg-zinc-900/70 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span>{lang.name}</span>
                            <span className="text-sm font-medium text-purple-400">{lang.percentage}%</span>
                          </div>
                          <div className="w-full bg-zinc-800/60 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-purple-500 h-full rounded-full" 
                              style={{ width: `${lang.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">GitHub Repositories by Language</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topRepos.slice(0, 4).map((repo, index) => (
                        <div key={repo.name} className="bg-zinc-900/70 rounded-lg p-4">
                          <div className="font-medium mb-1">{repo.name}</div>
                          <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{repo.description}</p>
                          
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(repo.languages).slice(0, 3).map(lang => (
                              <Badge key={lang} className="bg-zinc-900 text-zinc-300 font-normal text-xs">
                                {lang}
                              </Badge>
                            ))}
                            {Object.keys(repo.languages).length > 3 && (
                              <Badge className="bg-zinc-900 text-zinc-300 font-normal text-xs">
                                +{Object.keys(repo.languages).length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}