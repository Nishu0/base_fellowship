"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Search,
  Download,
  Mail,
  Filter,
  UserPlus,
  X,
  Check,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Import sample users data
import sampleUsers from "@/data/sample-users.json";

// Sample form data
const formData = {
  id: "1",
  name: "FBI Based Fellowship Application 2025",
  description:
    "(Online + IRL) program in Dharamshala to ship high value ecosystem public goods.",
  createdAt: "2025-07-10",
  submissions: sampleUsers.length,
  status: "active",
};

export default function FormSubmissions() {
  const router = useRouter();
  const { id } = useParams();
  
  const [builders, setBuilders] = useState(sampleUsers);
  const [selected, setSelected] = useState<typeof sampleUsers>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  
  // Score filters
  const [minOverallScore, setMinOverallScore] = useState(70);
  const [minGithubScore, setMinGithubScore] = useState(70);
  const [minOnchainScore, setMinOnchainScore] = useState(70);
  const [minWeb2Score, setMinWeb2Score] = useState(70);
  
  // Additional filters
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasHackathonWins, setHasHackathonWins] = useState(false);

  // All available chains
  const allChains = Array.from(
    new Set(
      sampleUsers.flatMap((user) => user.chains).filter(Boolean)
    )
  ).sort();

  // Filter builders
  const filteredBuilders = builders.filter((builder) => {
    // Search filter
    const matchesSearch = 
      searchQuery === "" ||
      builder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      builder.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      builder.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      builder.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Score filters
    const matchesScores =
      builder.overall_score >= minOverallScore &&
      builder.github_score >= minGithubScore &&
      builder.onchain_score >= minOnchainScore &&
      builder.web2_score >= minWeb2Score;
    
    // Chain filter
    const matchesChains = 
      selectedChains.length === 0 ||
      selectedChains.some(chain => builder.chains.includes(chain));
    
    // Verified filter
    const matchesVerified = !verifiedOnly || builder.verified;
    
    // Hackathon wins filter
    const matchesHackathon = !hasHackathonWins || builder.hackathon_wins > 0;
    
    return matchesSearch && matchesScores && matchesChains && matchesVerified && matchesHackathon;
  });

  // Toggle chain selection
  const toggleChain = (chain: string) => {
    setSelectedChains((prev) =>
      prev.includes(chain)
        ? prev.filter((c) => c !== chain)
        : [...prev, chain]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedChains([]);
    setMinOverallScore(70);
    setMinGithubScore(70);
    setMinOnchainScore(70);
    setMinWeb2Score(70);
    setVerifiedOnly(false);
    setHasHackathonWins(false);
    setSearchQuery("");
  };

  // Select a builder
  const selectBuilder = (builder: typeof sampleUsers[0]) => {
    setSelected([...selected, builder]);
    setBuilders(builders.filter((b) => b.id !== builder.id));
  };

  // Remove a builder from selection
  const removeBuilder = (builder: typeof sampleUsers[0]) => {
    setBuilders([...builders, builder]);
    setSelected(selected.filter((b) => b.id !== builder.id));
  };

  // Select all filtered builders
  const selectAllFiltered = () => {
    setSelected([...selected, ...filteredBuilders]);
    setBuilders(
      builders.filter(
        (b) => !filteredBuilders.some((fb) => fb.id === b.id)
      )
    );
  };

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 80) return "text-blue-400";
    if (score >= 70) return "text-amber-400";
    return "text-red-400";
  };

  // State for active tab
  const [activeTab, setActiveTab] = useState("submissions");

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left sidebar for filters */}
      {showFilters && (
        <aside className="w-80 border-r border-zinc-800 bg-zinc-950">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-zinc-400 hover:text-white"
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Minimum Overall Score
                </Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[minOverallScore]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setMinOverallScore(value[0])}
                    className="flex-1"
                  />
                  <span
                    className={`font-medium ${getScoreColor(minOverallScore)}`}
                  >
                    {minOverallScore}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Minimum GitHub Score
                </Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[minGithubScore]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setMinGithubScore(value[0])}
                    className="flex-1"
                  />
                  <span
                    className={`font-medium ${getScoreColor(minGithubScore)}`}
                  >
                    {minGithubScore}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Minimum Onchain Score
                </Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[minOnchainScore]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setMinOnchainScore(value[0])}
                    className="flex-1"
                  />
                  <span
                    className={`font-medium ${getScoreColor(minOnchainScore)}`}
                  >
                    {minOnchainScore}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Minimum Web2 Score
                </Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[minWeb2Score]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setMinWeb2Score(value[0])}
                    className="flex-1"
                  />
                  <span className={`font-medium ${getScoreColor(minWeb2Score)}`}>
                    {minWeb2Score}
                  </span>
                </div>
              </div>

              <Separator className="my-4 bg-zinc-800" />

              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Blockchain Networks
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-2">
                  {allChains.map((chain) => (
                    <div
                      key={chain}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`chain-${chain}`}
                        checked={selectedChains.includes(chain)}
                        onCheckedChange={() => toggleChain(chain)}
                      />
                      <Label
                        htmlFor={`chain-${chain}`}
                        className="text-sm cursor-pointer"
                      >
                        {chain}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4 bg-zinc-800" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hackathon-toggle" className="cursor-pointer">
                    Has Hackathon Wins
                  </Label>
                  <Switch
                    id="hackathon-toggle"
                    checked={hasHackathonWins}
                    onCheckedChange={setHasHackathonWins}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main content area */}
      <div className="flex-1">
        {/* Header with form info */}
        <header className="border-b border-zinc-800 bg-zinc-950 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-4">
              <Link href="/organizer/dashboard">
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex justify-between w-full">
                <div>
                  <h1 className="font-bold text-xl">{formData.name}</h1>
                  <p className="text-zinc-400 text-sm">{formData.description}</p>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="bg-zinc-900 rounded-md">
                    <button
                      className={`px-4 py-2 text-sm rounded-md transition-colors ${
                        activeTab === "submissions" 
                          ? "bg-indigo-600 text-white" 
                          : "text-zinc-400 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("submissions")}
                    >
                      Submissions ({builders.length})
                    </button>
                    <button
                      className={`px-4 py-2 text-sm rounded-md transition-colors ${
                        activeTab === "selected" 
                          ? "bg-indigo-600 text-white" 
                          : "text-zinc-400 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("selected")}
                    >
                      Selected ({selected.length})
                    </button>
                  </div>
                  <Badge
                    className={`ml-auto ${
                      formData.status === "active"
                        ? "bg-green-900/40 text-green-400 hover:bg-green-900/60"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {formData.status === "active" ? "Active" : "Closed"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="border-b border-zinc-800 bg-zinc-900/50 py-3">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full">
                <div className="flex justify-between items-center">
                  {filteredBuilders.length > 0 && activeTab === "submissions" && (
                    <div className="flex justify-between items-center space-x-4">
                      <Button
                        className="bg-indigo-400 hover:bg-indigo-600"
                        onClick={selectAllFiltered}
                        disabled={filteredBuilders.length === 0}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Select All ({filteredBuilders.length})
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        placeholder="Search builders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-zinc-900 border-zinc-800 w-[220px]"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFilters(!showFilters)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <Filter className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Display selected builders */}
                {selected.length > 0 && (
                  <div className="mt-4 mb-6 bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <CheckCircle2 className="text-green-500 mr-2 h-5 w-5" />
                        <h3 className="font-semibold text-sm">Selected Builders ({selected.length})</h3>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-indigo-400 hover:bg-indigo-600 h-8">
                          <Download className="mr-1 h-3 w-3" />
                          Export
                        </Button>
                        <Button size="sm" className="bg-white hover:bg-white h-8">
                          <Mail className="mr-1 h-3 w-3" />
                          Contact
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {selected.map((builder) => (
                        <div 
                          key={builder.id}
                          className="flex items-center bg-zinc-800/80 hover:bg-zinc-700/80 rounded-full pl-1 pr-2 py-1 text-sm border border-zinc-700 transition-colors"
                        >
                          <div className="flex items-center">
                            <Image
                              src={builder.avatar}
                              alt={builder.name}
                              width={24}
                              height={24}
                              className="rounded-full mr-2"
                            />
                            <span className="font-medium">{builder.name}</span>
                            <span className="mx-1 text-zinc-400">•</span>
                            <Badge className={`px-1.5 py-0 text-xs bg-zinc-900/80 ${getScoreColor(builder.overall_score)}`}>
                              {builder.overall_score}
                            </Badge>
                            {builder.hackathon_wins > 0 && (
                              <Badge className="ml-1 px-1.5 py-0 text-xs bg-amber-900/30 text-amber-300 border-amber-800/30">
                                <Trophy className="mr-0.5 h-2.5 w-2.5" />
                                {builder.hackathon_wins}
                              </Badge>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 ml-1 text-zinc-400 hover:text-white hover:bg-zinc-600 rounded-full"
                            onClick={() => removeBuilder(builder)}
                            title="Remove"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main content based on active tab */}
                {activeTab === "submissions" ? (
                  <div className="space-y-3 mt-4">
                    {filteredBuilders.length > 0 ? (
                      filteredBuilders.map((builder) => (
                        <div
                          key={builder.id}
                          className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all p-4"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <Image
                                src={builder.avatar}
                                alt={builder.name}
                                width={60}
                                height={60}
                                className="rounded-lg object-cover"
                              />
                              <div className="absolute -bottom-1 -right-1 bg-emerald-900 text-white font-bold text-sm w-8 h-8 rounded-lg flex items-center justify-center">
                                {builder.overall_score}
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center">
                                <h3 className="font-semibold">{builder.name}</h3>
                                {builder.hackathon_wins > 0 && (
                                  <Badge className="ml-2 bg-amber-900/50 text-amber-300 border-amber-700">
                                    <Trophy className="mr-1 h-3 w-3" />
                                    {builder.hackathon_wins}
                                  </Badge>
                                )}
                                <a
                                  href={`https://github.com/${builder.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-zinc-400 hover:text-indigo-400"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <p className="text-zinc-400 text-sm">@{builder.username} • {builder.location}</p>
                              <p className="text-zinc-300 text-sm mt-1 line-clamp-1">{builder.bio}</p>
                              
                              <div className="mt-2 flex flex-wrap gap-1">
                                {builder.skills.slice(0, 3).map((skill) => (
                                  <Badge
                                    key={skill}
                                    className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                                {builder.skills.length > 3 && (
                                  <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                                    +{builder.skills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="hidden md:flex items-center space-x-4">
                              <div className="text-center">
                                <p className={`text-lg font-semibold ${getScoreColor(builder.github_score)}`}>
                                  {builder.github_score}
                                </p>
                                <p className="text-xs text-zinc-400">GitHub</p>
                              </div>
                              <div className="text-center">
                                <p className={`text-lg font-semibold ${getScoreColor(builder.onchain_score)}`}>
                                  {builder.onchain_score}
                                </p>
                                <p className="text-xs text-zinc-400">Onchain</p>
                              </div>
                              <div className="text-center">
                                <p className={`text-lg font-semibold ${getScoreColor(builder.web2_score)}`}>
                                  {builder.web2_score}
                                </p>
                                <p className="text-xs text-zinc-400">Web2</p>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                onClick={() => selectBuilder(builder)}
                                className="bg-indigo-400 hover:bg-indigo-600"
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Select
                              </Button>
                              <Link href="#" className="mt-auto">
                                <Button variant="outline" className="border-zinc-700">
                                  View Profile
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-zinc-500">
                          No builders match your search criteria.
                        </p>
                        {(searchQuery || minOverallScore > 70 || minGithubScore > 70 || 
                          minOnchainScore > 70 || minWeb2Score > 70 || 
                          selectedChains.length > 0 || verifiedOnly || hasHackathonWins) && (
                          <Button
                            variant="link"
                            onClick={clearFilters}
                            className="mt-2 text-indigo-400"
                          >
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Selected Tab Content */
                  <div className="mt-4">
                    {selected.length > 0 ? (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-lg font-semibold">
                            Selected Builders ({selected.length})
                          </h2>
                          <div className="flex space-x-2">
                            <Button className="bg-zinc-800 hover:bg-zinc-700">
                              <Download className="mr-2 h-4 w-4" />
                              Export CSV
                            </Button>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                              <Mail className="mr-2 h-4 w-4" />
                              Contact All
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {selected.map((builder) => (
                            <div
                              key={builder.id}
                              className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all p-4"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <Image
                                    src={builder.avatar}
                                    alt={builder.name}
                                    width={60}
                                    height={60}
                                    className="rounded-lg object-cover"
                                  />
                                  <div className="absolute -bottom-1 -right-1 bg-emerald-900 text-white font-bold text-sm w-8 h-8 rounded-lg flex items-center justify-center">
                                    {builder.overall_score}
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <h3 className="font-semibold">{builder.name}</h3>
                                    <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                                    {builder.hackathon_wins > 0 && (
                                      <Badge className="ml-2 bg-amber-900/50 text-amber-300 border-amber-700">
                                        <Trophy className="mr-1 h-3 w-3" />
                                        {builder.hackathon_wins}
                                      </Badge>
                                    )}
                                    <a
                                      href={`https://github.com/${builder.username}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-2 text-zinc-400 hover:text-indigo-400"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                  <p className="text-zinc-400 text-sm">@{builder.username} • {builder.location}</p>
                                  <p className="text-zinc-300 text-sm mt-1 line-clamp-1">{builder.bio}</p>
                                  
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {builder.skills.slice(0, 3).map((skill) => (
                                      <Badge
                                        key={skill}
                                        className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                    {builder.skills.length > 3 && (
                                      <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                                        +{builder.skills.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="hidden md:flex items-center space-x-4">
                                  <div className="text-center">
                                    <p className={`text-lg font-semibold ${getScoreColor(builder.github_score)}`}>
                                      {builder.github_score}
                                    </p>
                                    <p className="text-xs text-zinc-400">GitHub</p>
                                  </div>
                                  <div className="text-center">
                                    <p className={`text-lg font-semibold ${getScoreColor(builder.onchain_score)}`}>
                                      {builder.onchain_score}
                                    </p>
                                    <p className="text-xs text-zinc-400">Onchain</p>
                                  </div>
                                  <div className="text-center">
                                    <p className={`text-lg font-semibold ${getScoreColor(builder.web2_score)}`}>
                                      {builder.web2_score}
                                    </p>
                                    <p className="text-xs text-zinc-400">Web2</p>
                                  </div>
                                </div>

                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => removeBuilder(builder)}
                                    className="bg-indigo-400 hover:bg-indigo-600"
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Remove
                                  </Button>
                                  <Link href="#" className="mt-auto">
                                    <Button variant="outline" className="border-zinc-700">
                                      View Profile
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <h3 className="text-lg font-medium mb-2">
                          No builders selected yet
                        </h3>
                        <p className="text-zinc-500 mb-4">
                          Select builders from the Submissions tab to include in your program.
                        </p>
                        <Button
                          onClick={() => setActiveTab("submissions")}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          View Submissions
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 