"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Github, 
  Twitter, 
  Globe, 
  MapPin, 
  Calendar, 
  BarChart4, 
  Code2, 
  ArrowUpRight, 
  Share2 
} from "lucide-react";

type GithubProfile = {
  success: boolean;
  data: {
    status: string;
    userData: {
      id: number;
      bio: string;
      url: string;
      blog: string;
      name: string;
      type: string;
      email: string;
      login: string;
      company: string | null;
      node_id: string;
      hireable: boolean | null;
      html_url: string;
      location: string;
      followers: number;
      following: number;
      gists_url: string;
      repos_url: string;
      avatar_url: string;
      created_at: string;
      events_url: string;
      site_admin: boolean;
      updated_at: string;
      gravatar_id: string;
      starred_url: string;
      public_gists: number;
      public_repos: number;
      followers_url: string;
      following_url: string;
      user_view_type: string;
      twitter_username: string | null;
      organizations_url: string;
      subscriptions_url: string;
      received_events_url: string;
    };
    userRepoData: {
      totalForks: number;
      totalStars: number;
      detailedRepos: Array<any>;
      totalLanguageLinesOfCode: Record<string, number>;
    };
    organizations: Array<any>;
    contributionData: {
      totalPRs: number;
      totalIssues: number;
      repoContributions: Record<string, number>;
      totalContributions: number;
      contributionCalendar: {
        weeks: Array<any>;
        totalContributions: number;
      };
    };
    contractsDeployed: Record<string, Array<any>>;
    onchainHistory: Record<string, Array<any>>;
    contractStats: Record<string, any>;
    transactionStats: Record<string, any>;
    score: {
      id: string;
      userId: string;
      totalScore: number;
      metrics: {
        web2: Record<string, any>;
        web3: Record<string, any>;
      };
      createdAt: string;
      updatedAt: string;
    };
  };
};

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState<GithubProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In a real application, you would fetch this data from an API endpoint
  // For demonstration purposes, we're using the data provided by the user
  useEffect(() => {
    // Simulate API fetch
    try {
      // This would be replaced with a real API call
      // fetch(`/api/profile/${params.username}`)
      //   .then(res => res.json())
      //   .then(data => setData(data));
      
      // For this demo, we'll simulate having data
      const mockData = {
        success: true,
        data: {
          // Use the data from the user query here
          status: "COMPLETED",
          userData: {
            id: 43911437,
            bio: "Full Stack Web3 Engineer | GSoC'21 @ SCoReLab | SOB21 | Certified Ethereum Developer | Ethereum India Fellow | SIH2020 Finalist | 50+ Hackathons Winner",
            url: "https://api.github.com/users/mbcse",
            blog: "https://mohit.theblockchainchief.com",
            name: "Mohit Bhat",
            type: "User",
            email: "mbcse50@gmail.com",
            login: "mbcse",
            company: null,
            node_id: "MDQ6VXNlcjQzOTExNDM3",
            hireable: null,
            html_url: "https://github.com/mbcse",
            location: "New Delhi",
            followers: 164,
            following: 33,
            gists_url: "https://api.github.com/users/mbcse/gists{/gist_id}",
            repos_url: "https://api.github.com/users/mbcse/repos",
            avatar_url: "https://avatars.githubusercontent.com/u/43911437?v=4",
            created_at: "2018-10-06T15:27:22Z",
            events_url: "https://api.github.com/users/mbcse/events{/privacy}",
            site_admin: false,
            updated_at: "2025-04-28T11:58:53Z",
            gravatar_id: "",
            starred_url: "https://api.github.com/users/mbcse/starred{/owner}{/repo}",
            public_gists: 4,
            public_repos: 152,
            followers_url: "https://api.github.com/users/mbcse/followers",
            following_url: "https://api.github.com/users/mbcse/following{/other_user}",
            user_view_type: "public",
            twitter_username: "mbcse50",
            organizations_url: "https://api.github.com/users/mbcse/orgs",
            subscriptions_url: "https://api.github.com/users/mbcse/subscriptions",
            received_events_url: "https://api.github.com/users/mbcse/received_events"
          },
          userRepoData: {
            totalForks: 240,
            totalStars: 287,
            detailedRepos: [], // Abbreviated for brevity
            totalLanguageLinesOfCode: {
              "JavaScript": 19479854,
              "TypeScript": 18736161,
              "Solidity": 1285732,
              // Other languages
            }
          },
          organizations: [], // Abbreviated for brevity
          contributionData: {
            totalPRs: 11,
            totalIssues: 1,
            repoContributions: {},
            totalContributions: 521,
            contributionCalendar: {
              weeks: [],
              totalContributions: 521
            }
          },
          contractsDeployed: {},
          onchainHistory: {},
          contractStats: {},
          transactionStats: {
            total: {
              mainnet: {
                nft: 0,
                erc20: 0,
                total: 91,
                external: 0
              },
              testnet: {
                nft: 0,
                erc20: 0,
                total: 0,
                external: 0
              }
            }
          },
          score: {
            id: "8b5b45f1-0a2d-4276-982d-8b4044749c7a",
            userId: "3f369741-eefa-4c2d-b792-f165cfa8cae4",
            totalScore: 45.52,
            metrics: {
              web2: {
                prs: {
                  score: 5.5,
                  value: 11,
                  weight: 10,
                  threshold: 20
                },
                forks: {
                  score: 10,
                  value: 240,
                  weight: 10,
                  threshold: 50
                },
                stars: {
                  score: 10,
                  value: 287,
                  weight: 10,
                  threshold: 100
                },
                total: 71.04,
                issues: {
                  score: 0.33,
                  value: 1,
                  weight: 10,
                  threshold: 30
                },
                followers: {
                  score: 10,
                  value: 164,
                  weight: 10,
                  threshold: 100
                },
                accountAge: {
                  score: 10,
                  value: 2405,
                  weight: 10,
                  threshold: 365
                },
                contributions: {
                  score: 5.21,
                  value: 521,
                  weight: 10,
                  threshold: 1000
                },
                totalLinesOfCode: {
                  score: 20,
                  value: 63053041,
                  weight: 20,
                  threshold: 50000
                }
              },
              web3: {
                total: 20,
                web3Languages: {
                  score: 20,
                  value: 1697744,
                  weight: 20,
                  breakdown: {
                    "Rust": 370662,
                    "Cadence": 41350,
                    "Solidity": 1285732
                  },
                  threshold: 10000
                }
              }
            },
            createdAt: "2025-05-08T10:37:09.703Z",
            updatedAt: "2025-05-08T10:37:09.703Z"
          }
        }
      };
      
      setData(mockData as any);
      setLoading(false);
    } catch (err) {
      setError("Failed to load profile data");
      setLoading(false);
    }
  }, [params.username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error || !data || !data.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Error: {error || "Could not load profile"}</div>
      </div>
    );
  }

  const { userData, score, userRepoData, contributionData, transactionStats } = data.data;
  
  return (
    <main className="bg-black min-h-screen">
      {/* Hero section - Profile overview */}
      <section className="relative pt-8 pb-12">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 to-black z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile image and basic info */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="relative h-52 w-52 mx-auto">
                  <Image 
                    src={userData.avatar_url} 
                    alt={userData.name}
                    width={208}
                    height={208}
                    className="rounded-xl object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-emerald-900 text-white font-bold text-lg w-12 h-12 rounded-lg flex items-center justify-center">
                    {score.totalScore.toFixed(0)}
                  </div>
                </div>
                
                <div className="text-center">
                  <h1 className="text-xl font-bold mt-4">{userData.name}</h1>
                  <p className="text-zinc-400">@{userData.login}</p>
                </div>
                
                <div className="flex justify-center space-x-3">
                  <a 
                    href={userData.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  {userData.twitter_username && (
                    <a 
                      href={`https://twitter.com/${userData.twitter_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {userData.blog && (
                    <a 
                      href={userData.blog}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                </div>
                
                <div className="pt-4 space-y-3 border-t border-zinc-800">
                  {userData.location && (
                    <div className="flex items-center text-zinc-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{userData.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-zinc-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Joined {new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-zinc-300">{userData.bio}</p>
                </div>
                
                <Button className="w-full">Contact Builder</Button>
              </div>
            </div>
            
            {/* Main profile content */}
            <div className="w-full md:w-2/3 lg:w-3/4 space-y-6">
              {/* Score overview card */}
              <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Builder Score</h2>
                  <Badge className="bg-emerald-900/70 text-emerald-300 border-emerald-700">
                    Developer Score: {score.totalScore.toFixed(2)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Web2 Score */}
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-zinc-400">Web2 Score</span>
                      <span className="text-sm font-medium text-emerald-400">
                        {score.metrics.web2.total.toFixed(2)} / 100
                      </span>
                    </div>
                    <div className="w-full bg-zinc-700/50 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        style={{ width: `${score.metrics.web2.total}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Web3 Score */}
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-zinc-400">Web3 Score</span>
                      <span className="text-sm font-medium text-emerald-400">
                        {score.metrics.web3.total.toFixed(2)} / 100
                      </span>
                    </div>
                    <div className="w-full bg-zinc-700/50 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        style={{ width: `${score.metrics.web3.total}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 flex justify-between items-center border-t border-zinc-800">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-900/20 border border-emerald-800/50 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-600/50 flex items-center justify-center text-xl font-bold text-emerald-300">
                          {score.totalScore.toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold">Overall Score</h3>
                      <p className="text-zinc-400 text-sm">Based on all activity metrics</p>
                    </div>
                  </div>
                  <Button className="bg-emerald-900 hover:bg-emerald-800 text-white">
                    View Detailed Report
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Tabs navigation */}
              <div className="flex overflow-x-auto space-x-2 pb-2">
                <Button 
                  variant={activeTab === "overview" ? "default" : "outline"} 
                  onClick={() => setActiveTab("overview")}
                  className={`rounded-full px-6 ${activeTab === "overview" ? "bg-emerald-900 text-white hover:bg-emerald-800" : "hover:text-white"}`}
                >
                  Overview
                </Button>
                <Button 
                  variant={activeTab === "github" ? "default" : "outline"} 
                  onClick={() => setActiveTab("github")}
                  className={`rounded-full px-6 ${activeTab === "github" ? "bg-emerald-900 text-white hover:bg-emerald-800" : "hover:text-white"}`}
                >
                  GitHub
                </Button>
                <Button 
                  variant={activeTab === "chains" ? "default" : "outline"} 
                  onClick={() => setActiveTab("chains")}
                  className={`rounded-full px-6 ${activeTab === "chains" ? "bg-emerald-900 text-white hover:bg-emerald-800" : "hover:text-white"}`}
                >
                  Chains
                </Button>
                <Button 
                  variant={activeTab === "projects" ? "default" : "outline"} 
                  onClick={() => setActiveTab("projects")}
                  className={`rounded-full px-6 ${activeTab === "projects" ? "bg-emerald-900 text-white hover:bg-emerald-800" : "hover:text-white"}`}
                >
                  Projects
                </Button>
                <Button 
                  variant={activeTab === "skills" ? "default" : "outline"} 
                  onClick={() => setActiveTab("skills")}
                  className={`rounded-full px-6 ${activeTab === "skills" ? "bg-emerald-900 text-white hover:bg-emerald-800" : "hover:text-white"}`}
                >
                  Skills
                </Button>
              </div>
              
              {/* GitHub stats card */}
              <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Github className="h-6 w-6 mr-2 text-blue-400" />
                    <h2 className="text-xl font-bold">GitHub Activity</h2>
                  </div>
                  <Badge className="bg-blue-900/70 text-blue-300 border-blue-700">
                    Contributions: {contributionData.totalContributions}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{userData.public_repos}</div>
                    <div className="text-sm text-zinc-400">Repositories</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{userData.followers}</div>
                    <div className="text-sm text-zinc-400">Followers</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{userRepoData.totalStars}</div>
                    <div className="text-sm text-zinc-400">Stars</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{contributionData.totalContributions}</div>
                    <div className="text-sm text-zinc-400">Contributions</div>
                  </div>
                </div>
              </div>
              
              {/* Blockchain activity card */}
              <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <BarChart4 className="h-6 w-6 mr-2 text-emerald-400" />
                    <h2 className="text-xl font-bold">Blockchain Activity</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Ethereum Mainnet */}
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center mr-3">
                          <span>E</span>
                        </div>
                        <h3 className="font-medium">Ethereum Mainnet</h3>
                      </div>
                      <Badge className="bg-emerald-900/70 text-emerald-300 border-emerald-700">
                        {transactionStats.total.mainnet.total} Transactions
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Skills card */}
              <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Code2 className="h-6 w-6 mr-2 text-purple-400" />
                    <h2 className="text-xl font-bold">Skills & Expertise</h2>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Display top languages */}
                  {Object.entries(userRepoData.totalLanguageLinesOfCode)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 6)
                    .map(([language, lines]) => {
                      const maxLines = Math.max(...Object.values(userRepoData.totalLanguageLinesOfCode));
                      const percentage = (lines / maxLines) * 100;
                      
                      return (
                        <div key={language} className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span>{language}</span>
                            <span className="text-sm font-medium text-purple-400">{lines.toLocaleString()} lines</span>
                          </div>
                          <div className="w-full bg-zinc-700/50 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-purple-500 h-full rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Actions footer */}
      <section className="py-8 border-t border-zinc-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold">Interested in this builder?</h3>
              <p className="text-zinc-400">Add them to your shortlist or contact directly</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                <Share2 className="mr-2 h-4 w-4" />
                Share Profile
              </Button>
              <Button className="bg-emerald-900 hover:bg-emerald-800 text-white">
                Contact Builder
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 