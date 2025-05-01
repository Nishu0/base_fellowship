"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import profileData from "@/data/sample-profile.json";
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
  Radio, 
  Trophy, 
  ArrowUpRight, 
  BookOpen, 
  Share2 
} from "lucide-react";

// Import this component from the Heatmap component we created earlier
import DeveloperHeatmap from "@/components/DeveloperHeatmap";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  
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
                    src="https://avatars.githubusercontent.com/u/583231?v=4" 
                    alt={profileData.name}
                    width={208}
                    height={208}
                    className="rounded-xl object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-emerald-900 text-white font-bold text-lg w-12 h-12 rounded-lg flex items-center justify-center">
                    {profileData.overallScore}
                  </div>
                </div>
                
                <div className="text-center">
                  <h1 className="text-xl font-bold mt-4">{profileData.name}</h1>
                  <p className="text-zinc-400">@{profileData.username}</p>
                </div>
                
                <div className="flex justify-center space-x-3">
                  <a 
                    href={`https://github.com/${profileData.github.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a 
                    href={`https://twitter.com/${profileData.social.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a 
                    href={profileData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full transition-colors"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                </div>
                
                <div className="pt-4 space-y-3 border-t border-zinc-800">
                  <div className="flex items-center text-zinc-400">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{profileData.location}</span>
                  </div>
                  <div className="flex items-center text-zinc-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Joined {new Date(profileData.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-zinc-300">{profileData.bio}</p>
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
                    Top 5% Builder
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(profileData.scoreBreakdown).map(([key, value]) => {
                    const title = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase());
                    
                    return (
                      <div key={key} className="bg-zinc-800/50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-zinc-400">{title}</span>
                          <span className="text-sm font-medium text-emerald-400">{value} / 100</span>
                        </div>
                        <div className="w-full bg-zinc-700/50 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full" 
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 pt-6 flex justify-between items-center border-t border-zinc-800">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-900/20 border border-emerald-800/50 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-600/50 flex items-center justify-center text-xl font-bold text-emerald-300">
                          {profileData.overallScore}
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
                    Score: {profileData.github.score}/100
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{profileData.github.repos}</div>
                    <div className="text-sm text-zinc-400">Repositories</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{profileData.github.followers}</div>
                    <div className="text-sm text-zinc-400">Followers</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{profileData.github.stars}</div>
                    <div className="text-sm text-zinc-400">Stars</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{profileData.github.contributions}</div>
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
                  {profileData.chains.map((chain) => (
                    <div key={chain.name} className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center mr-3">
                            {/* We'll just use the first letter instead of an actual logo for simplicity */}
                            <span>{chain.name.charAt(0)}</span>
                          </div>
                          <h3 className="font-medium">{chain.name}</h3>
                        </div>
                        <Badge className="bg-emerald-900/70 text-emerald-300 border-emerald-700">
                          Score: {chain.score}/100
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-emerald-400">{chain.transactions}</div>
                          <div className="text-xs text-zinc-400">Transactions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-emerald-400">{chain.contracts}</div>
                          <div className="text-xs text-zinc-400">Contracts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-emerald-400">
                            {new Date(chain.firstActivity).toLocaleDateString('en-US', {year: 'numeric', month: 'short'})}
                          </div>
                          <div className="text-xs text-zinc-400">First Activity</div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  {profileData.skills.map((skill) => (
                    <div key={skill.name} className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span>{skill.name}</span>
                        <span className="text-sm font-medium text-purple-400">{skill.score}/100</span>
                      </div>
                      <div className="w-full bg-zinc-700/50 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-purple-500 h-full rounded-full" 
                          style={{ width: `${skill.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Project contributions */}
              <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <BookOpen className="h-6 w-6 mr-2 text-amber-400" />
                    <h2 className="text-xl font-bold">Project Contributions</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {profileData.projectContributions.map((project) => (
                    <div key={project.name} className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                        <h3 className="font-medium text-lg">{project.name}</h3>
                        <Badge className="bg-amber-900/70 text-amber-300 border-amber-700 mt-2 md:mt-0">
                          {project.role}
                        </Badge>
                      </div>
                      <p className="text-zinc-400 mb-3">{project.description}</p>
                      <div className="flex justify-between items-center">
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline text-sm flex items-center"
                        >
                          View on GitHub
                          <ArrowUpRight className="ml-1 h-3 w-3" />
                        </a>
                        <div className="text-sm font-medium text-amber-400">Score: {project.score}/100</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Hackathon wins */}
              <div className="bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Trophy className="h-6 w-6 mr-2 text-yellow-400" />
                    <h2 className="text-xl font-bold">Hackathon Achievements</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {profileData.hackathonWins.map((hackathon) => (
                    <div key={hackathon.name} className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <h3 className="font-medium">{hackathon.name} ({hackathon.year})</h3>
                          <p className="text-zinc-400 text-sm">{hackathon.project}</p>
                        </div>
                        <Badge className="bg-yellow-900/70 text-yellow-300 border-yellow-700 mt-2 md:mt-0">
                          {hackathon.position}
                        </Badge>
                      </div>
                    </div>
                  ))}
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