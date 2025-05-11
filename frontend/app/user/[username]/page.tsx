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
    onchainHistory?: Record<string, any[]>;
    contractsDeployed?: Record<string, any[]>;
    score?: {
      totalScore: number;
      metrics: {
        web2: {
          total: number;
          [key: string]: any;
        };
        web3: {
          total: number;
          [key: string]: any;
        };
      };
    };
  }

  const [userData, setUserData] = useState<GitHubUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isCopied, setIsCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  // Get current URL for sharing
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://fellowship.io/user/${username}`;
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
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareUrl())}`;
  };
  
  // Generate Warpcast share URL
  const getWarpcastShareUrl = () => {
    if (!userData) return '';
    const githubScore = userData.score?.metrics?.web2?.total || 0;
    const onchainScore = userData.score?.metrics?.web3?.total || 0;
    const overallScore = Math.round((githubScore + onchainScore) / 2);
    
    const shareText = `Check out ${userData.userData.name || username}'s profile on Klyro!\n\nGitHub Score: ${githubScore}/100\nOnchain Score: ${onchainScore}/100\nOverall: ${overallScore}/100`;
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
    const months = new Set();
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

  // Process onchain data
  const processOnchainData = () => {
    if (!userData?.onchainHistory || Object.keys(userData.onchainHistory).length === 0) {
      return {
        totalTransactions: 0,
        chains: []
      };
    }

    const transactions = [];
    const chains: { name: string, transactions: number, contracts: number, score: number, firstActivity: string | null }[] = [];
    
    // Process transactions from each chain
    Object.entries(userData.onchainHistory).forEach(([chainName, txs]) => {
      if (!Array.isArray(txs) || txs.length === 0) return;
      
      // Add transactions
      transactions.push(...txs);
      
      // Create chain data
      const txCount = txs.length;
      const contractCount = userData.contractsDeployed?.[chainName]?.length || 0;
      
      // Get first activity date
      const dates = txs.map(tx => new Date(tx.date)).sort((a, b) => a.getTime() - b.getTime());
      const firstActivity = dates.length > 0 ? dates[0].toISOString() : null;
      
      chains.push({
        name: chainName.replace('-', ' ').replace(/^\w/, c => c.toUpperCase()),
        transactions: txCount,
        contracts: contractCount,
        score: Math.min(Math.round(txCount * 2), 100), // Simple scoring
        firstActivity
      });
    });
    
    return {
      totalTransactions: transactions.length,
      chains
    };
  };

  // Process onchain data for heatmap
  const getOnchainActivityData = () => {
    if (!userData?.onchainHistory || Object.keys(userData.onchainHistory).length === 0) {
      return {
        transactionsByDay: [],
        activityMonths: [],
        totalTransactions: 0
      };
    }

    // Collect all transactions from all chains
    const allTransactions = Object.values(userData.onchainHistory).flat();
    
    // Get earliest and latest transaction dates
    const dates = allTransactions.map(tx => new Date(tx.date));
    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Create a date range for the full period (similar to GitHub's full year view)
    const startDate = new Date(earliestDate);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from beginning of week
    
    const endDate = new Date(latestDate);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End at end of week
    
    // Generate daily counts (including zeros for days with no activity)
    const dailyCounts = [];
    const months = new Set();
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Count transactions on this date
      const count = allTransactions.filter(tx => 
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
      activityMonths: Array.from(months) as string[],
      totalTransactions: allTransactions.length
    };
  };

  // Calculate scores
  const calculateScores = () => {
    if (!userData) return { github: 0, onchain: 0, web2: 0, overall: 0 };
    
    const githubScore = userData.score?.metrics?.web2?.total 
      ? Math.round(userData.score.metrics.web2.total) 
      : 0;
    
    const onchainScore = userData.score?.metrics?.web3?.total 
      ? Math.round(userData.score.metrics.web3.total) 
      : 0;
    
    // Default a baseline web2 score if not available
    const web2Score = userData.score?.metrics?.web2?.total 
      ? Math.round(userData.score.metrics.web2.total) 
      : 70;
    
    // Calculate overall score
    const overall = Math.round((githubScore + onchainScore + web2Score) / 3);
    
    return {
      github: githubScore,
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
  const groupChainsByNetwork = (chains: { name: string, transactions: number, contracts: number, score: number, firstActivity: string | null }[]) => {
    const networks: Record<string, { name: string, networks: typeof chains, totalScore: number }> = {};

    chains.forEach(chain => {
      const network = chain.name.split(' ')[0];
      if (!networks[network]) {
        networks[network] = { name: network, networks: [], totalScore: 0 };
      }
      networks[network].networks.push(chain);
      networks[network].totalScore += chain.score;
    });

    return Object.entries(networks).map(([_, value]) => value);
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
  const onchainActivity = getOnchainActivityData();
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
    chains: onchainData.chains,
    githubActivity: {
      contributionsByDay: githubActivity.contributionsByDay,
      contributionMonths: githubActivity.contributionMonths,
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
      chains: onchainData.chains,
      transactionsByDay: onchainActivity.transactionsByDay,
      activityMonths: onchainActivity.activityMonths
    }
  };

  return (
    <main className="bg-black min-h-screen text-white">
      <div className="pt-8 pb-6">
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
              <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full bg-zinc-900 border-zinc-700">
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
                      <Twitter className="h-5 w-5" />
                      Share on Twitter
                    </a>
                    <a 
                      href={getWarpcastShareUrl()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      <svg width="20" height="20" viewBox="0 0 16 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.7143 0H2.28571C1.02335 0 0 1.02335 0 2.28571V9.14286C0 10.4052 1.02335 11.4286 2.28571 11.4286H13.7143C14.9767 11.4286 16 10.4052 16 9.14286V2.28571C16 1.02335 14.9767 0 13.7143 0ZM11.8412 4.2473L7.84121 8.2473C7.7555 8.33301 7.63952 8.38095 7.5 8.38095C7.36048 8.38095 7.2445 8.33301 7.15879 8.2473L4.15879 5.2473C3.97826 5.06677 3.97826 4.78061 4.15879 4.60008C4.33932 4.41955 4.62548 4.41955 4.80601 4.60008L7.5 7.29407L11.194 3.60008C11.3745 3.41955 11.6607 3.41955 11.8412 3.60008C12.0217 3.78061 12.0217 4.06677 11.8412 4.2473Z"/>
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

      <div className="border-t border-zinc-800 mt-2 mb-6"></div>

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
                  
                  {/* GitHub Score */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-zinc-400">GitHub Score</span>
                      <span className="font-medium">{user.scores.github}/100</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800/60 rounded-full overflow-hidden">
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
              
              {/* Chain Activity Card */}
              <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-semibold">Chain Activity</h2>
                  <ChevronDown className="h-5 w-5 text-zinc-500" />
                </div>
                
                <div className="space-y-3">
                  {groupChainsByNetwork(user.chains).map(network => (
                    <div key={network.name} className="bg-zinc-900/70 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium">
                            {getNetworkIcon(network.name) ? (
                              <Image
                                src={getNetworkIcon(network.name) as string}
                                alt={network.name}
                                width={20}
                                height={20}
                                className="h-4 w-4 object-contain"
                              />
                            ) : (
                              network.name.charAt(0)
                            )}
                          </div>
                          <span className="font-medium">{network.name}</span>
                        </div>
                        <Badge className="text-xs px-2 py-0 bg-indigo-900/70 text-indigo-300 border-indigo-700">
                          {Math.round(network.totalScore / network.networks.length)}/100
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-zinc-400 ml-9 mb-2">
                        {network.networks.map(chain => (
                          <div key={chain.name} className="flex justify-between">
                            <span>{chain.name.includes('mainnet') ? 'Mainnet' : 'Testnet'}</span>
                            <span>{chain.transactions} tx</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="h-1.5 w-full bg-zinc-800/60 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.round(network.totalScore / network.networks.length)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
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
                        Score: {user.scores.github}/100
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
                      <ActivityHeatmap
                        data={user.githubActivity.contributionsByDay}
                        months={user.githubActivity.contributionMonths as string[]}
                        colorScheme="github"
                        title="GitHub Contributions"
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
                    
                    {user.onchainActivity.transactionsByDay.length > 0 && (
                      <div className="w-full mb-5">
                        <ActivityHeatmap
                          data={user.onchainActivity.transactionsByDay}
                          months={user.onchainActivity.activityMonths}
                          colorScheme="onchain"
                          title="On-chain Transactions"
                          totalCount={user.onchainActivity.totalTransactions}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-6">
                      {groupChainsByNetwork(user.chains).map((networkGroup) => (
                        <div key={networkGroup.name} className="bg-zinc-900/70 rounded-xl overflow-hidden">
                          <div className="p-4 border-b border-zinc-800">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-md font-medium mr-3">
                                  {getNetworkIcon(networkGroup.name) ? (
                                    <Image
                                      src={getNetworkIcon(networkGroup.name) as string}
                                      alt={networkGroup.name}
                                      width={24}
                                      height={24}
                                      className="h-5 w-5 object-contain"
                                    />
                                  ) : (
                                    networkGroup.name.charAt(0)
                                  )}
                                </div>
                                <span className="text-lg font-medium">{networkGroup.name}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {networkGroup.networks.map(chain => (
                              <div key={chain.name} className="bg-zinc-800/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center">
                                    <span className="font-medium text-indigo-200">{chain.name.includes('mainnet') ? 'Mainnet' : 'Testnet'}</span>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 text-center mb-2">
                                  <div>
                                    <div className="text-lg font-semibold text-indigo-400">{chain.transactions}</div>
                                    <div className="text-xs text-zinc-400">Transactions</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-semibold text-indigo-400">{chain.contracts || 0}</div>
                                    <div className="text-xs text-zinc-400">Contracts</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-semibold text-indigo-400">
                                      {chain.firstActivity ? new Date(chain.firstActivity).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'N/A'}
                                    </div>
                                    <div className="text-xs text-zinc-400">First Active</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "github" && (
                <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6 overflow-hidden">
                  <h2 className="text-lg font-semibold mb-4">GitHub Activity</h2>
                  
                  <div className="w-full">
                    <ActivityHeatmap
                      data={user.githubActivity.contributionsByDay}
                      months={user.githubActivity.contributionMonths as string[]}
                      colorScheme="github"
                      title="GitHub Contributions"
                      totalCount={user.githubActivity.totalContributions}
                    />
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-300 mb-3">GitHub Stats</h3>
                      <div className="space-y-3">
                        <div className="bg-zinc-900/70 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <GitFork className="h-4 w-4 mr-2 text-zinc-400" />
                              <span className="text-sm">Forks</span>
                            </div>
                            <span className="text-indigo-400 font-medium">{user.githubActivity.forks}</span>
                          </div>
                        </div>
                        <div className="bg-zinc-900/70 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-2 text-zinc-400" />
                              <span className="text-sm">Stars</span>
                            </div>
                            <span className="text-indigo-400 font-medium">{user.githubActivity.stars}</span>
                          </div>
                        </div>
                        <div className="bg-zinc-900/70 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <GitPullRequest className="h-4 w-4 mr-2 text-zinc-400" />
                              <span className="text-sm">Pull Requests</span>
                            </div>
                            <span className="text-indigo-400 font-medium">{user.githubActivity.prs}</span>
                          </div>
                        </div>
                        <div className="bg-zinc-900/70 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <GitCommit className="h-4 w-4 mr-2 text-zinc-400" />
                              <span className="text-sm">Issues</span>
                            </div>
                            <span className="text-indigo-400 font-medium">{user.githubActivity.issues}</span>
                          </div>
                        </div>
                        <div className="bg-zinc-900/70 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-zinc-400" />
                              <span className="text-sm">Followers</span>
                            </div>
                            <span className="text-indigo-400 font-medium">{user.githubActivity.followers}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-zinc-300 mb-3">Top Repositories</h3>
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
                </div>
              )}

              {activeTab === "chains" && (
                <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Blockchain Activity</h2>
                  
                  {user.onchainActivity.totalTransactions > 0 ? (
                    <>
                      {user.onchainActivity.transactionsByDay.length > 0 && (
                        <div className="w-full mb-6">
                          <ActivityHeatmap
                            data={user.onchainActivity.transactionsByDay}
                            months={user.onchainActivity.activityMonths}
                            colorScheme="onchain"
                            title="On-chain Transactions"
                            totalCount={user.onchainActivity.totalTransactions}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-6">
                        {groupChainsByNetwork(user.chains).map((networkGroup) => (
                          <div key={networkGroup.name} className="bg-zinc-900/70 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-zinc-800">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-md font-medium mr-3">
                                    {getNetworkIcon(networkGroup.name) ? (
                                      <Image
                                        src={getNetworkIcon(networkGroup.name) as string}
                                        alt={networkGroup.name}
                                        width={24}
                                        height={24}
                                        className="h-5 w-5 object-contain"
                                      />
                                    ) : (
                                      networkGroup.name.charAt(0)
                                    )}
                                  </div>
                                  <span className="text-lg font-medium">{networkGroup.name}</span>
                                </div>
                                <Badge className="bg-indigo-900/70 text-indigo-300 border-indigo-700 px-2">
                                  Score: {networkGroup.totalScore}/100
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {networkGroup.networks.map(chain => (
                                <div key={chain.name} className="bg-zinc-800/50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <span className="font-medium text-indigo-200">{chain.name.includes('mainnet') ? 'Mainnet' : 'Testnet'}</span>
                                    </div>
                                    {/* <Badge className="text-xs bg-indigo-900/70 text-indigo-300">
                                      {chain.score}/100
                                    </Badge> */}
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-2 text-center mb-2">
                                    <div>
                                      <div className="text-lg font-semibold text-indigo-400">{chain.transactions}</div>
                                      <div className="text-xs text-zinc-400">Transactions</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-semibold text-indigo-400">{chain.contracts || 0}</div>
                                      <div className="text-xs text-zinc-400">Contracts</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-semibold text-indigo-400">
                                        {chain.firstActivity ? new Date(chain.firstActivity).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'N/A'}
                                      </div>
                                      <div className="text-xs text-zinc-400">First Active</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
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