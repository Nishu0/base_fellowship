"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import sampleUsers from "@/data/sample-users.json";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Download, ChevronDown, ChevronUp, Check } from "lucide-react";

// Extract unique chains from all users
const getAllChains = () => {
  const chains = new Set<string>();
  sampleUsers.forEach(user => {
    user.chains.forEach(chain => chains.add(chain));
  });
  return Array.from(chains);
};

// Get all unique skills
const getAllSkills = () => {
  const skills = new Set<string>();
  sampleUsers.forEach(user => {
    user.skills.forEach(skill => skills.add(skill));
  });
  return Array.from(skills);
};

export default function LeaderboardPage() {
  const allChains = getAllChains();
  const allSkills = getAllSkills();
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'overall' | 'github' | 'onchain' | 'wins'>('overall');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([...sampleUsers]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<typeof sampleUsers[0] | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [hasUnlockedExport, setHasUnlockedExport] = useState(false);
  
  // Filter and sort users based on criteria
  useEffect(() => {
    let result = [...sampleUsers];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.username.toLowerCase().includes(query)
      );
    }
    
    // Apply chain filter if selected
    if (selectedChain) {
      result = result.filter(user => user.chains.includes(selectedChain));
    }
    
    // Apply skill filter if selected
    if (selectedSkill) {
      result = result.filter(user => user.skills.includes(selectedSkill));
    }
    
    // Apply sorting
    const multiplier = sortOrder === 'desc' ? -1 : 1;
    
    switch(sortBy) {
      case 'overall':
        result.sort((a, b) => multiplier * (a.overall_score - b.overall_score));
        break;
      case 'github':
        result.sort((a, b) => multiplier * (a.github_score - b.github_score));
        break;
      case 'onchain':
        result.sort((a, b) => multiplier * (a.onchain_score - b.onchain_score));
        break;
      case 'wins':
        result.sort((a, b) => multiplier * (a.hackathon_wins - b.hackathon_wins));
        break;
    }
    
    setFilteredUsers(result);
  }, [selectedChain, selectedSkill, sortBy, searchQuery, sortOrder]);

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedChain(null);
    setSelectedSkill(null);
    setSortBy('overall');
    setSortOrder('desc');
    setSearchQuery('');
  };

  // Open user details sheet
  const openUserDetails = (user: typeof sampleUsers[0]) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  // Simulate payment for export
  const simulatePayment = () => {
    // In a real app, this would connect to a wallet and process payment
    setHasUnlockedExport(true);
  };

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Sidebar - Filters */}
        <div className="w-full lg:w-64 p-4 border-r border-zinc-800 bg-zinc-950">
          <div className="mb-6">
            <h2 className="font-medium text-xl mb-4">Builder Leaderboard</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-500" />
              </div>
              <Input
                type="search"
                placeholder="Search builders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 h-10 w-full bg-zinc-900 border-zinc-800 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* Chain Filter */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Filter by Chain</h3>
              <Select
                value={selectedChain || "all"}
                onValueChange={(value) => setSelectedChain(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 h-10 text-sm">
                  <SelectValue placeholder="All Chains" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="all">All Chains</SelectItem>
                  {allChains.map(chain => (
                    <SelectItem key={chain} value={chain}>{chain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Skill Filter */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Filter by Skill</h3>
              <Select
                value={selectedSkill || "all"}
                onValueChange={(value) => setSelectedSkill(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 h-10 text-sm">
                  <SelectValue placeholder="All Skills" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Sort Options */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Sort By</h3>
              <div className="flex flex-col gap-2">
                <Select 
                  value={sortBy} 
                  onValueChange={(value) => setSortBy(value as any)}
                >
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="overall">Overall Score</SelectItem>
                    <SelectItem value="github">GitHub Score</SelectItem>
                    <SelectItem value="onchain">Onchain Score</SelectItem>
                    <SelectItem value="wins">Hackathon Wins</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  className="w-full bg-zinc-900 border-zinc-800 h-10 flex justify-between items-center"
                  onClick={toggleSortOrder}
                >
                  {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                  {sortOrder === 'desc' ? 
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronUp className="h-4 w-4" />
                  }
                </Button>
              </div>
            </div>

            {/* Reset & Export Buttons */}
            <div className="flex flex-col gap-2 pt-4">
              <Button 
                variant="outline" 
                className="w-full border-zinc-700 hover:bg-zinc-800 hover:text-white"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
              
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 w-full">
                    <Download className="mr-2 h-4 w-4" /> Export Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Export Builder Data</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Access comprehensive builder data for your team selection process.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Export Fee</span>
                      <span className="font-medium">0.001 ETH</span>
                    </div>
                    <div className="text-xs text-zinc-500">One-time payment for unlimited exports</div>
                  </div>
                  
                  {!hasUnlockedExport ? (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-medium rounded-lg"
                      onClick={simulatePayment}
                    >
                      Pay & Unlock Export
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-500 text-sm mb-2">
                        <Check className="h-4 w-4" />
                        <span>Export Access Unlocked</span>
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10">
                        Export as CSV
                      </Button>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10">
                        Export as JSON
                      </Button>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10">
                        Export as Excel
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <div className="pt-2 text-sm text-zinc-500">
              Showing <span className="font-medium text-white">{filteredUsers.length}</span> builders
            </div>
          </div>
        </div>

        {/* Main Content - Builder Cards */}
        <div className="flex-1 p-4 overflow-auto">
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id}
                  onClick={() => openUserDetails(user)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm p-5 hover:bg-zinc-900/30 transition-colors cursor-pointer"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* User Profile - Col 1-2 */}
                    <div className="col-span-12 md:col-span-2 flex items-center gap-3">
                      <div className="relative">
                        <div className="h-12 w-12 overflow-hidden rounded-full">
                          <Image
                            src={user.avatar}
                            alt={`${user.name}'s avatar`}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center border-2 border-zinc-950">
                          {user.overall_score}
                        </div>
                      </div>

                      <div className="overflow-hidden">
                        <div className="font-medium text-white flex items-center">
                          {user.username}
                          {user.verified && (
                            <svg className="w-4 h-4 ml-1 text-blue-500" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                              <path fill="currentColor" d="m23 12-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61-.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69zm-12.91 4.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48z"></path>
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400">{user.location}</p>
                      </div>
                    </div>

                    {/* Top Chain - Col 3 */}
                    <div className="col-span-12 md:col-span-2">
                      <div className="flex flex-col">
                        <div className="text-xs text-zinc-500 mb-1">Top Chain</div>
                        <div className="flex">
                          <Badge 
                            className="bg-zinc-900/70 border border-zinc-700 py-1 px-3 rounded-full text-white"
                          >
                            {user.top_chain}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* GitHub Score - Col 4-5 */}
                    <div className="col-span-12 md:col-span-2">
                      <div className="flex flex-col">
                        <div className="text-xs text-zinc-500 mb-1">GitHub Score</div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${user.github_score}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium w-7 text-right">{user.github_score}</span>
                        </div>
                      </div>
                    </div>

                    {/* Onchain Score - Col 6-7 */}
                    <div className="col-span-12 md:col-span-2">
                      <div className="flex flex-col">
                        <div className="text-xs text-zinc-500 mb-1">Onchain Score</div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${user.onchain_score}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium w-7 text-right">{user.onchain_score}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags - Col 8-10 */}
                    <div className="col-span-12 md:col-span-3">
                      <div className="flex flex-col">
                        <div className="text-xs text-zinc-500 mb-1">Skills</div>
                        <div className="flex flex-wrap gap-1">
                          {user.skills.slice(0, 2).map(skill => (
                            <Badge key={skill} className="bg-zinc-800 text-zinc-200 text-xs px-2 py-1 rounded-md">
                              {skill}
                            </Badge>
                          ))}
                          {user.skills.length > 2 && (
                            <Badge className="bg-zinc-800 text-zinc-200 text-xs px-2 py-1 rounded-md">
                              +{user.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Wins - Col 11-12 */}
                    <div className="col-span-12 md:col-span-1">
                      <div className="flex flex-col">
                        <div className="text-xs text-zinc-500 mb-1">Wins</div>
                        <div className="flex items-center">
                          <div className="flex items-center gap-1 bg-zinc-900 px-3 py-1 rounded-full">
                            <svg className="h-4 w-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                            <span className="font-medium text-sm">{user.hackathon_wins}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500">
              <p>No builders match your current filters</p>
              <Button 
                variant="ghost" 
                className="mt-4 text-blue-400 hover:text-blue-300" 
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-zinc-950 border-zinc-800 text-white p-0">
          {selectedUser && (
            <>
              <div className="flex flex-col gap-6 p-6">
                {/* Header with avatar and basic info */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 overflow-hidden rounded-full">
                      <Image
                        src={selectedUser.avatar}
                        alt={`${selectedUser.name}'s avatar`}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-2 -left-2 bg-indigo-600 text-white text-xs font-semibold rounded-full w-7 h-7 flex items-center justify-center border-2 border-zinc-950">
                      {selectedUser.overall_score}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-medium flex items-center">
                        {selectedUser.username}
                        {selectedUser.verified && (
                          <svg className="w-5 h-5 ml-1 text-blue-500" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                            <path fill="currentColor" d="m23 12-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69zm-12.91 4.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48z"></path>
                          </svg>
                        )}
                      </h2>
                      <Button
                        className="bg-white text-black hover:bg-zinc-200 text-sm h-8 px-4 rounded-full"
                        onClick={() => window.open(`/profile/${selectedUser.username}`, '_blank')}
                      >
                        View Profile
                      </Button>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">
                      {selectedUser.bio || "Blockchain developer with expertise in ZK proofs"}
                    </p>
                    <div className="flex items-center text-sm text-zinc-400 mt-2">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      {selectedUser.location}
                    </div>
                  </div>
                </div>

                {/* Top chains */}
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-2">Top Chains</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.chains.map(chain => (
                      <Badge 
                        key={chain} 
                        className={`py-1 px-3 rounded-full ${
                          chain === selectedUser.top_chain 
                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' 
                            : 'bg-zinc-800 border border-zinc-700'
                        }`}
                      >
                        {chain}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.skills.map(skill => (
                      <Badge 
                        key={skill} 
                        className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded-md"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Score cards */}
                <div className="space-y-4">
                  {/* GitHub */}
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">GitHub</div>
                        <div className="text-xs text-zinc-400">{selectedUser.github_score}/100 pts</div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${selectedUser.github_score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Top Chain */}
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">{selectedUser.top_chain}</div>
                        <div className="text-xs text-zinc-400">{selectedUser.onchain_score}/100 pts</div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${selectedUser.onchain_score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* ETHGlobal */}
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                          <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9M12 4.15L5 8.09v7.82l7 3.94 7-3.94V8.09l-7-3.94z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">ETHGlobal</div>
                        <div className="text-xs text-zinc-400">{Math.round(selectedUser.onchain_score * 0.5)}/100 pts</div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${selectedUser.onchain_score * 0.5}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Onchain Activity */}
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Onchain Activity</div>
                        <div className="text-xs text-zinc-400">{Math.round(selectedUser.onchain_score * 0.36)}/100 pts</div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${selectedUser.onchain_score * 0.36}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Hackathon Wins */}
                  <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-yellow-500">
                          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Hackathon Wins</div>
                          <div className="text-xs text-zinc-400">Total victories in competitions</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold">{selectedUser.hackathon_wins}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>

        {/* Background blur */}
        <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity ${isSheetOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
          onClick={() => setIsSheetOpen(false)}
        />
      </Sheet>
    </main>
  );
} 