"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Share2
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
      chains: onchainData.chains
    }
  };

  return (
    <main className="bg-black min-h-screen text-white">
      {/* Hero section with unified header */}
      <section className="relative pt-10 pb-6">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-black z-0"></div>
        
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Left Column - Profile image and stats */}
            <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
              <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-zinc-800">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={112}
                        height={112}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-lg font-semibold rounded-full w-10 h-10 flex items-center justify-center border-4 border-black">
                      {user.scores.overall}
                    </div>
                  </div>
                  
                  <h1 className="text-xl font-bold">{user.name}</h1>
                  <p className="text-sm text-zinc-400 mb-3">@{user.username}</p>
                  
                  <div className="flex gap-2 mb-4 w-full justify-center">
                    {user.twitter && (
                      <Link href={`https://twitter.com/${user.twitter}`} target="_blank">
                        <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700">
                          <Twitter className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Link href={`https://github.com/${user.username}`} target="_blank">
                      <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700">
                        <Github className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="w-full space-y-3">
                    {user.location && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-zinc-500" />
                        <span className="text-zinc-300">{user.location}</span>
                      </div>
                    )}
                    {user.joinedDate && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-zinc-500" />
                        <span className="text-zinc-300">Joined {user.joinedDate}</span>
                      </div>
                    )}
                    {user.blogUrl && (
                      <div className="flex items-center text-sm">
                        <Globe className="h-4 w-4 mr-2 text-zinc-500" />
                        <a href={user.blogUrl} target="_blank" rel="noopener noreferrer" 
                           className="text-zinc-300 hover:text-indigo-400 truncate">
                          {user.blogUrl.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Score Overview Card */}
              <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
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
              
              {/* Blockchain Scores Card */}
              <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Chain Activity</h2>
                </div>
                
                <div className="space-y-4">
                  {user.chains.map(chain => (
                    <div key={chain.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-300">{chain.name}</span>
                        <div className="text-sm text-zinc-400">{chain.transactions} tx</div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-zinc-500">Score: {chain.score}/100</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(chain.score / 100) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column - Main content area */}
            <div className="w-full md:w-2/3 lg:w-3/4 space-y-6">
              {/* Bio Section */}
              <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                <p className="text-zinc-300 mb-4">{user.bio}</p>
                
                <div className="flex flex-wrap gap-2">
                  {user.skills.map(skill => (
                    <Badge key={skill} className="bg-zinc-800 text-zinc-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Tabs navigation */}
              <div className="flex overflow-x-auto space-x-2 pb-2">
                <Button 
                  variant={activeTab === "overview" ? "default" : "outline"} 
                  onClick={() => setActiveTab("overview")}
                  className={`rounded-full px-6 ${activeTab === "overview" ? "bg-indigo-600 hover:bg-indigo-700" : "hover:text-white"}`}
                >
                  Overview
                </Button>
                <Button 
                  variant={activeTab === "github" ? "default" : "outline"} 
                  onClick={() => setActiveTab("github")}
                  className={`rounded-full px-6 ${activeTab === "github" ? "bg-indigo-600 hover:bg-indigo-700" : "hover:text-white"}`}
                >
                  GitHub
                </Button>
                <Button 
                  variant={activeTab === "chains" ? "default" : "outline"} 
                  onClick={() => setActiveTab("chains")}
                  className={`rounded-full px-6 ${activeTab === "chains" ? "bg-indigo-600 hover:bg-indigo-700" : "hover:text-white"}`}
                >
                  Chains
                </Button>
                <Button 
                  variant={activeTab === "skills" ? "default" : "outline"} 
                  onClick={() => setActiveTab("skills")}
                  className={`rounded-full px-6 ${activeTab === "skills" ? "bg-indigo-600 hover:bg-indigo-700" : "hover:text-white"}`}
                >
                  Skills
                </Button>
              </div>
              
              {/* Tab content */}
              {activeTab === "overview" && (
                <>
                  {/* GitHub stats card */}
                  <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
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
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.githubActivity.repos}</div>
                        <div className="text-xs text-zinc-400">Repositories</div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.githubActivity.followers}</div>
                        <div className="text-xs text-zinc-400">Followers</div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.githubActivity.stars}</div>
                        <div className="text-xs text-zinc-400">Stars</div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.githubActivity.forks}</div>
                        <div className="text-xs text-zinc-400">Forks</div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{user.githubActivity.prs}</div>
                        <div className="text-xs text-zinc-400">Pull Requests</div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
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
                  <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center">
                        <BarChart4 className="h-5 w-5 mr-2 text-indigo-400" />
                        <h2 className="text-lg font-bold">Blockchain Activity</h2>
                      </div>
                      <Badge className="bg-indigo-900/70 text-indigo-300 border-indigo-700">
                        Score: {user.scores.onchain}/100
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      {user.chains.length > 0 ? (
                        user.chains.map((chain) => (
                          <div key={chain.name} className="bg-zinc-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center mr-3">
                                  <span>{chain.name.charAt(0)}</span>
                                </div>
                                <h3 className="font-medium">{chain.name}</h3>
                              </div>
                              <Badge className="bg-indigo-900/70 text-indigo-300 border-indigo-700">
                                Score: {chain.score}/100
                              </Badge>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-indigo-400">{chain.transactions}</div>
                                  <div className="text-xs text-zinc-400">Transactions</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-indigo-400">{chain.contracts}</div>
                                  <div className="text-xs text-zinc-400">Contracts</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-indigo-400">
                                    {chain.firstActivity ? new Date(chain.firstActivity).toLocaleDateString('en-US', {year: 'numeric', month: 'short'}) : 'N/A'}
                                  </div>
                                  <div className="text-xs text-zinc-400">First Activity</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-zinc-500">
                          <p>No blockchain activity data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "github" && (
                <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 overflow-hidden">
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
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <GitFork className="h-4 w-4 mr-2 text-zinc-400" />
                              <span className="text-sm">Forks</span>
                            </div>
                            <span className="text-indigo-400 font-medium">{user.githubActivity.forks}</span>
                          </div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-2 text-zinc-400" />
                              <span className="text-sm">Stars</span>
                            </div>
                            <span className="text-indigo-400 font-medium">{user.githubActivity.stars}</span>
                          </div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <GitPullRequest className="h-4 w-4 mr-2 text-zinc-400" />
                              <span className="text-sm">Pull Requests</span>
                            </div>
                            <span className="text-indigo-400 font-medium">{user.githubActivity.prs}</span>
                          </div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <GitCommit className="h-4 w-4 mr-2 text-zinc-400" />
                              <span className="text-sm">Issues</span>
                            </div>
                            <span className="text-indigo-400 font-medium">{user.githubActivity.issues}</span>
                          </div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
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
                        {user.githubActivity.topRepos.map((repo, index) => (
                          <div key={index} className="bg-zinc-800/50 rounded-lg p-3">
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
                <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Blockchain Activity</h2>
                  
                  {user.onchainActivity.totalTransactions > 0 ? (
                    <>
                      <div className="space-y-5">
                        {user.chains.map((chain) => (
                          <div key={chain.name} className="bg-zinc-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center mr-3">
                                  <span>{chain.name.charAt(0)}</span>
                                </div>
                                <h3 className="font-medium">{chain.name}</h3>
                              </div>
                              <Badge className="bg-indigo-900/70 text-indigo-300 border-indigo-700">
                                Score: {chain.score}/100
                              </Badge>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-indigo-400">{chain.transactions}</div>
                                  <div className="text-xs text-zinc-400">Transactions</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-indigo-400">{chain.contracts}</div>
                                  <div className="text-xs text-zinc-400">Contracts</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-indigo-400">
                                    {chain.firstActivity ? new Date(chain.firstActivity).toLocaleDateString('en-US', {year: 'numeric', month: 'short'}) : 'N/A'}
                                  </div>
                                  <div className="text-xs text-zinc-400">First Activity</div>
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

              {activeTab === "skills" && (
                <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                      <Code2 className="h-5 w-5 mr-2 text-purple-400" />
                      <h2 className="text-lg font-bold">Skills & Expertise</h2>
                    </div>
                  </div>
                  
                  <div className="mb-5">
                    <h3 className="text-sm font-medium mb-3">Programming Languages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topLanguages.map((lang, index) => (
                        <div key={lang.name} className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span>{lang.name}</span>
                            <span className="text-sm font-medium text-purple-400">{lang.percentage}%</span>
                          </div>
                          <div className="w-full bg-zinc-700/50 h-2 rounded-full overflow-hidden">
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
                      {topRepos.map((repo, index) => (
                        <div key={repo.name} className="bg-zinc-800/50 rounded-lg p-4">
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
      
      {/* Actions footer */}
      <section className="py-5 border-t border-zinc-900">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold">Interested in this builder?</h3>
              <p className="text-zinc-400 text-sm">Contact directly or share their profile</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                <Share2 className="mr-2 h-4 w-4" />
                Share Profile
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Contact Builder
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}