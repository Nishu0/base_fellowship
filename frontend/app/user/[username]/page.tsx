"use client";

import { useState } from "react";
import Image from "next/image";
import { sampleUserProfile } from "@/data/user-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import Link from "next/link";
import { Github, Twitter, Globe, ExternalLink, Star, ChevronDown } from "lucide-react";

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  
  // In a real app, you would fetch the user data based on the username param
  // For now, we'll use the sample data
  const user = sampleUserProfile;
  
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 