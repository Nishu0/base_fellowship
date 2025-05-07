"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import Link from "next/link";
import { Github, Twitter, Globe, ExternalLink, Star, ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "@/lib/axiosClient";

// Type definitions for the API response
interface GitHubUserData {
  status: string;
  userData: {
    avatar_url: string;
    name: string;
    login: string;
    bio: string;
    location: string;
    created_at: string;
    html_url: string;
    twitter_username: string;
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
      languages: Record<string, number>;
    }>;
  };
  contributionData?: {
    totalContributions: number;
    totalPRs: number;
    totalIssues: number;
    contributionCalendar: {
      totalContributions: number;
      weeks: Array<{
        contributionDays: Array<{
          date: string;
          contributionCount: number;
        }>;
      }>;
    };
  };
  onchainHistory?: any[];
  contractsDeployed?: Array<{
    address: string;
    blockNumber: number;
  }>;
}

// Types for activity heatmap
interface ContributionDay {
  date: string;
  count: number;
}

// Types for protocol data
interface Protocol {
  name: string;
  category: string;
  txCount: number;
}

export default function UserProfilePage() {
  const { username } = useParams();
  const [userData, setUserData] = useState<GitHubUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  
  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/fbi/status/${username}`);
        console.log("response", response.data);
        
        // Make sure the data has the expected structure
        if (!response.data?.data?.userData) {
          throw new Error("API response missing expected data structure");
        }
        
        // Store the nested data object, not the wrapper
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

  // Process onchain transaction data
  const processOnchainData = () => {
    console.log("ud", userData);
    if (!userData?.onchainHistory || !Array.isArray(userData.onchainHistory)) {
      return {
        transactionsByDay: [] as number[],
        transactionMonths: [] as string[],
        totalTransactions: 0,
        wallets: [] as string[],
        protocols: [] as Protocol[]
      };
    }
    console.log("userData.onchainHistory",userData.onchainHistory);

    // Count transactions by wallet address
    const transactions = userData.onchainHistory;
    const totalTransactions = transactions.length;
    
    // Get unique wallet addresses
    const uniqueWallets = new Set<string>();
    transactions.forEach(tx => {
      if (tx.from) uniqueWallets.add(tx.from);
      if (tx.to) uniqueWallets.add(tx.to);
    });
    const wallets = Array.from(uniqueWallets).filter(Boolean);
    
    // Group transactions by date
    const txByDate = transactions.reduce((acc, tx) => {
      // Convert block number to approximate date
      // This is a simplification - ideally you'd have timestamps
      const blockNum = parseInt(tx.blockNum || '0', 16);
      // Create a pseudo-date - this is just for demo purposes
      const pseudoDate = new Date();
      pseudoDate.setDate(pseudoDate.getDate() - (Math.floor(Math.random() * 60))); // Random date in last 60 days
      
      const dateKey = pseudoDate.toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey]++;
      return acc;
    }, {} as Record<string, number>);
    
    // Sort dates and get last 52 weeks (364 days)
    const sortedDates = Object.keys(txByDate).sort();
    
    // Generate array of zeros for the last 364 days
    const today = new Date();
    const transactionsByDay: number[] = [];
    const dateSet = new Set<string>();
    
    for (let i = 0; i < 364; i++) {
      const date = new Date();
      date.setDate(today.getDate() - (364 - i - 1));
      const dateStr = date.toISOString().split('T')[0];
      dateSet.add(date.toLocaleString('default', { month: 'short' }));
      transactionsByDay.push(txByDate[dateStr] || 0);
    }
    
    // Get protocol info (for this example, we'll create some mock data based on real addresses)
    const protocolMap: Record<string, { name: string, category: string, count: number }> = {
      "0x9f042060df098ad0c853964679175a7dd3792250": { name: "Smart Contract 1", category: "DeFi", count: 0 },
      "0x1421db7aa92b81e1c194d6dfc38cc7cd31f7df73": { name: "Smart Contract 2", category: "NFT", count: 0 },
      "0x70e9bddfd10ac5ecaf6cfb3f34a2681985e4b668": { name: "Smart Contract 3", category: "Exchange", count: 0 },
    };
    
    // Count transactions to known protocol addresses
    transactions.forEach(tx => {
      if (tx.to && protocolMap[tx.to]) {
        protocolMap[tx.to].count++;
      }
    });
    
    // Convert to array and filter out zero counts
    const protocols = Object.values(protocolMap)
      .filter(p => p.count > 0)
      .map(p => ({
        name: p.name,
        category: p.category,
        txCount: p.count
      }));
    
    return {
      transactionsByDay,
      transactionMonths: Array.from(dateSet),
      totalTransactions,
      wallets,
      protocols
    };
  };

  // Transform API data for the heatmap
  const getGithubActivityData = () => {
    if (!userData?.contributionData?.contributionCalendar) {
      return { 
        contributionsByDay: [],
        contributionMonths: [],
        totalContributions: 0
      };
    }

    const calendar = userData.contributionData.contributionCalendar;
    
    // Flatten contribution days from all weeks
    const contributionsByDay = calendar.weeks.flatMap(week => 
      week.contributionDays.map(day => day.contributionCount)
    );

    // Extract month names from dates
    const months = new Set<string>();
    calendar.weeks.flatMap(week => week.contributionDays).forEach(day => {
      const date = new Date(day.date);
      const monthName = date.toLocaleString('default', { month: 'short' });
      months.add(monthName);
    });

    return {
      contributionsByDay,
      contributionMonths: Array.from(months),
      totalContributions: calendar.totalContributions
    };
  };

  // Get top repositories sorted by stars
  const getTopRepos = () => {
    if (!userData?.userRepoData?.detailedRepos) return [];
    
    return userData.userRepoData.detailedRepos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 3)
      .map(repo => ({
        name: repo.name,
        description: repo.description || "No description",
        stars: repo.stargazers_count,
        url: repo.html_url
      }));
  };

  // Calculate GitHub score based on various metrics
  const calculateGithubScore = () => {
    if (!userData) return 0;
    
    // Use other metrics to calculate score
    const followers = userData.userData.followers || 0;
    const repos = userData.userData.public_repos || 0;
    const stars = userData.userRepoData.totalStars || 0;
    
    // Calculate score based on followers, repos, and stars - just a simple example formula
    const score = followers * 0.4 + repos * 0.3 + stars * 0.3;
    return Math.min(Math.round(score / 10), 100); // Cap at 100
  };

  // Calculate onchain score based on transaction activity
  const calculateOnchainScore = (totalTransactions: number) => {
    if (totalTransactions <= 0) return 0;
    
    // Simple scoring algorithm based on transaction count
    // Adjust these thresholds based on your expectations
    const score = Math.min(totalTransactions * 2, 100);
    return Math.round(score);
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
  const githubActivity = getGithubActivityData();
  const topRepos = getTopRepos();
  const githubScore = calculateGithubScore();

  // Process onchain data
  const onchainData = processOnchainData();
  const onchainScore = calculateOnchainScore(onchainData.totalTransactions);

  // Format date
  const formatJoinDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Create user object from API data
  const user = {
    name: userData.userData.name || userData.userData.login,
    username: userData.userData.login,
    avatar: userData.userData.avatar_url,
    bio: userData.userData.bio || "",
    location: userData.userData.location || "Unknown",
    joinedDate: formatJoinDate(userData.userData.created_at),
    twitter: userData.userData.twitter_username,
    verified: true,
    hackathonWins: 0, // Not available in API data
    skills: Object.keys(
      userData.userRepoData.detailedRepos.reduce((langs, repo) => {
        Object.keys(repo.languages || {}).forEach(lang => {
          langs[lang] = true;
        });
        return langs;
      }, {} as Record<string, boolean>)
    ).slice(0, 10),
    scores: {
      github: githubScore,
      onchain: onchainScore,
      web2: 0, // Not available in API data
      overall: Math.round((githubScore + onchainScore) / 2) // Average of GitHub and onchain scores
    },
    chains: [
      { name: "Ethereum", transactions: onchainData.totalTransactions, score: onchainScore, maxScore: 100 }
    ],
    wallets: onchainData.wallets,
    githubActivity: {
      contributionsByDay: githubActivity.contributionsByDay,
      contributionMonths: githubActivity.contributionMonths,
      totalContributions: githubActivity.totalContributions,
      topRepos
    },
    onchainActivity: {
      transactionsByDay: onchainData.transactionsByDay,
      transactionMonths: onchainData.transactionMonths,
      totalTransactions: onchainData.totalTransactions,
      topProtocols: onchainData.protocols
    }
  };

  // Filter chains based on selection
  const filteredChains = selectedChain 
    ? user.chains.filter(chain => chain.name === selectedChain)
    : user.chains;

  return (
    <div className="min-h-screen bg-black text-white pb-12">
      {/* Profile Header */}
      <div className="relative mb-4">
        {/* Cover background */}
        <div className="h-10"></div>
        
        {/* Profile info */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="flex flex-col md:flex-row items-start gap-4">
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
            
            <div className="flex-1 pt-2 md:pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold flex items-center">
                  {user.name}
                  {user.verified && (
                    <svg className="w-6 h-6 ml-2 text-blue-500" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                      <path fill="currentColor" d="m23 12-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69zm-12.91 4.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48z"></path>
                    </svg>
                  )}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-zinc-800 text-zinc-200">@{user.username}</Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
                    <Star className="mr-1 h-3 w-3" /> {user.hackathonWins} Wins
                  </Badge>
                </div>
              </div>
              
              <p className="text-zinc-300 mb-3">{user.bio}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {user.skills.map(skill => (
                  <Badge key={skill} className="bg-zinc-800 text-zinc-200">
                    {skill}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  {user.location}
                </div>
                <div>Joined {user.joinedDate}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4 md:mt-10">
              <div className="flex gap-2">
                {user.twitter && (
                  <Link href={`https://twitter.com/${user.twitter}`} target="_blank">
                    <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-700">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                  </Link>
                )}
                <Link href={`https://github.com/${user.username}`} target="_blank">
                  <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-700">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                </Link>
              </div>
              <Link href="/form">
                <Button variant="outline" size="sm" className="w-full bg-zinc-900 border-zinc-700">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Scores */}
          <div className="space-y-6">
            {/* Score Overview */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4">Score Overview</h2>
              
              <div className="space-y-5">
                {/* Overall Score */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-400">Overall Score</span>
                    <span className="font-medium">{user.scores.overall}/100</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                      style={{ width: `${user.scores.overall}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* GitHub Score */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-400">GitHub Score</span>
                    <span className="font-medium">{user.scores.github}/100</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${user.scores.github}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Onchain Score */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-400">Onchain Score</span>
                    <span className="font-medium">{user.scores.onchain}/100</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
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
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${user.scores.web2}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Blockchain Scores */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Chain Activity</h2>
                
                <div className="relative">
                  <select 
                    className="bg-zinc-900 border border-zinc-700 rounded-lg text-sm py-1 pl-3 pr-8 appearance-none"
                    value={selectedChain || ""}
                    onChange={(e) => setSelectedChain(e.target.value || null)}
                  >
                    <option value="">All Chains</option>
                    {user.chains.map(chain => (
                      <option key={chain.name} value={chain.name}>{chain.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-zinc-400" />
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredChains.map(chain => (
                  <div key={chain.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-zinc-300">{chain.name}</span>
                      <div className="text-sm text-zinc-400">{chain.transactions} tx</div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-zinc-500">Score: {chain.score}/{chain.maxScore}</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(chain.score / chain.maxScore) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallet Addresses */}
            {user.wallets.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                <h2 className="text-lg font-semibold mb-4">Wallet Addresses</h2>
                <div className="space-y-3">
                  {user.wallets.map((wallet, index) => (
                    <div key={index} className="bg-zinc-900 rounded-lg p-3 break-all text-sm text-zinc-300">
                      {wallet}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Activity */}
          <div className="md:col-span-2 space-y-6">
            {/* GitHub Activity */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 overflow-hidden">
              <h2 className="text-lg font-semibold mb-4">GitHub Activity</h2>
              
              <div className="w-full">
                <ActivityHeatmap
                  data={user.githubActivity.contributionsByDay}
                  months={user.githubActivity.contributionMonths}
                  colorScheme="github"
                  title="GitHub Contributions"
                  totalCount={user.githubActivity.totalContributions}
                />
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">Top Repositories</h3>
                <div className="space-y-3">
                  {user.githubActivity.topRepos.map((repo, index) => (
                    <div key={index} className="bg-zinc-900 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="font-medium">{repo.name}</div>
                        <div className="flex items-center text-sm text-yellow-500">
                          <Star className="h-4 w-4 mr-1" />
                          {repo.stars}
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 mt-1">{repo.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Onchain Activity */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 overflow-hidden">
              <h2 className="text-lg font-semibold mb-4">Onchain Activity</h2>
              
              {user.onchainActivity.totalTransactions > 0 ? (
                <>
                  <div className="w-full">
                    <ActivityHeatmap
                      data={user.onchainActivity.transactionsByDay}
                      months={user.onchainActivity.transactionMonths}
                      colorScheme="onchain"
                      title="Transaction Activity"
                      totalCount={user.onchainActivity.totalTransactions}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-zinc-300 mb-3">Top Protocols</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {user.onchainActivity.topProtocols.map((protocol, index) => (
                        <div key={index} className="bg-zinc-900 rounded-lg p-3">
                          <div className="font-medium">{protocol.name}</div>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm text-zinc-400">{protocol.category}</span>
                            <span className="text-sm text-zinc-300">{protocol.txCount} tx</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  <p>No onchain activity data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 