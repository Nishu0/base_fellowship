"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Github,
  Link2,
  Award,
  Check,
  X,
  ArrowDownAZ,
  ArrowUpZA,
  Star,
  Trophy,
  ArrowUpRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import the sample user data
import sampleUsers from "@/data/sample-users.json";

// Define types
type User = typeof sampleUsers[0];
type SortKey = "overall_score" | "github_score" | "onchain_score" | "web2_score" | "name";
type SortOrder = "asc" | "desc";
type ViewMode = "grid" | "list";

export default function OrganizerPage() {
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [minOverallScore, setMinOverallScore] = useState(70);
  const [minGithubScore, setMinGithubScore] = useState(70);
  const [minOnchainScore, setMinOnchainScore] = useState(70);
  const [minWeb2Score, setMinWeb2Score] = useState(70);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasHackathonWins, setHasHackathonWins] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("overall_score");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(sampleUsers);

  // All available chains
  const allChains = Array.from(
    new Set(
      sampleUsers.flatMap((user) => user.chains).filter(Boolean)
    )
  ).sort();

  // Apply filters
  useEffect(() => {
    let result = [...sampleUsers];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          user.bio.toLowerCase().includes(query) ||
          user.location.toLowerCase().includes(query)
      );
    }

    // Apply chain filter
    if (selectedChains.length > 0) {
      result = result.filter((user) =>
        selectedChains.some((chain) => user.chains.includes(chain))
      );
    }

    // Apply score filters
    result = result.filter(
      (user) =>
        user.overall_score >= minOverallScore &&
        user.github_score >= minGithubScore &&
        user.onchain_score >= minOnchainScore &&
        user.web2_score >= minWeb2Score
    );

    // Apply verified filter
    if (verifiedOnly) {
      result = result.filter((user) => user.verified);
    }

    // Apply hackathon wins filter
    if (hasHackathonWins) {
      result = result.filter((user) => user.hackathon_wins > 0);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortKey === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === "asc"
          ? a[sortKey] - b[sortKey]
          : b[sortKey] - a[sortKey];
      }
    });

    setFilteredUsers(result);
  }, [
    searchQuery,
    selectedChains,
    minOverallScore,
    minGithubScore,
    minOnchainScore,
    minWeb2Score,
    verifiedOnly,
    hasHackathonWins,
    sortKey,
    sortOrder,
  ]);

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

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 80) return "text-blue-400";
    if (score >= 70) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <main className="flex min-h-screen bg-black">
      {/* Left sidebar for filters */}
      <aside
        className={`border-r border-zinc-800 bg-zinc-950 transition-all ${
          showFilters ? "w-80" : "w-0 overflow-hidden"
        }`}
      >
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
                <Label htmlFor="verified-toggle" className="cursor-pointer">
                  Verified Builders Only
                </Label>
                <Switch
                  id="verified-toggle"
                  checked={verifiedOnly}
                  onCheckedChange={setVerifiedOnly}
                />
              </div>

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

      {/* Main content area */}
      <div className="flex-1">
        {/* Header and search bar */}
        <header className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-zinc-800 z-10 p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-zinc-400 hover:text-white"
                >
                  <Filter className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold hidden md:block">
                  Browse Builders
                </h1>
              </div>

              <div className="flex items-center space-x-2 flex-1 max-w-xl mx-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search builders by name, username, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Select
                  value={sortKey}
                  onValueChange={(value: SortKey) => setSortKey(value)}
                >
                  <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall_score">Overall Score</SelectItem>
                    <SelectItem value="github_score">GitHub Score</SelectItem>
                    <SelectItem value="onchain_score">Onchain Score</SelectItem>
                    <SelectItem value="web2_score">Web2 Score</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSortOrder}
                  className="text-zinc-400 hover:text-white"
                >
                  {sortOrder === "desc" ? (
                    <ArrowUpZA className="h-5 w-5" />
                  ) : (
                    <ArrowDownAZ className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="text-zinc-400 hover:text-white"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Results count */}
        <div className="container mx-auto px-4 py-3 text-zinc-400 text-sm">
          Showing {filteredUsers.length} of {sampleUsers.length} builders
        </div>

        {/* Builders grid/list */}
        <div className="container mx-auto p-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-zinc-900/60 flex flex-col backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all"
                >
                  <div className="relative p-5">
                    <div className="absolute top-4 right-4">
                      {user.verified && (
                        <Badge className="bg-emerald-900/70 text-emerald-300 border-emerald-700">
                          <Check className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <div className="relative">
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={100}
                          height={100}
                          className="rounded-xl object-cover"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-emerald-900 text-white font-bold text-md w-10 h-10 rounded-lg flex items-center justify-center">
                          {user.overall_score}
                        </div>
                      </div>

                      <h3 className="mt-4 font-semibold text-lg">{user.name}</h3>
                      <p className="text-zinc-400 text-sm">@{user.username}</p>
                      <p className="text-zinc-400 text-xs mt-1">{user.location}</p>

                      <p className="mt-3 text-sm line-clamp-2 text-zinc-300">{user.bio}</p>

                      <div className="mt-4 flex flex-wrap gap-1 justify-center">
                        {user.skills.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {user.skills.length > 3 && (
                          <Badge className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                            +{user.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className={`text-lg font-semibold ${getScoreColor(user.github_score)}`}>
                          {user.github_score}
                        </p>
                        <p className="text-xs text-zinc-400">GitHub</p>
                      </div>
                      <div>
                        <p className={`text-lg font-semibold ${getScoreColor(user.onchain_score)}`}>
                          {user.onchain_score}
                        </p>
                        <p className="text-xs text-zinc-400">Onchain</p>
                      </div>
                      <div>
                        <p className={`text-lg font-semibold ${getScoreColor(user.web2_score)}`}>
                          {user.web2_score}
                        </p>
                        <p className="text-xs text-zinc-400">Web2</p>
                      </div>
                    </div>

                    <Separator className="my-4 bg-zinc-800" />

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        {user.chains.slice(0, 3).map((chain) => (
                          <Badge
                            key={chain}
                            variant="outline"
                            className="border-zinc-700 text-xs"
                          >
                            {chain}
                          </Badge>
                        ))}
                        {user.chains.length > 3 && (
                          <Badge
                            variant="outline"
                            className="border-zinc-700 text-xs"
                          >
                            +{user.chains.length - 3}
                          </Badge>
                        )}
                      </div>
                      {user.hackathon_wins > 0 && (
                        <Badge className="bg-amber-900/50 text-amber-300 border-amber-700">
                          <Trophy className="mr-1 h-3 w-3" />
                          {user.hackathon_wins}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-800/50 flex justify-center mt-auto">
                    <Link href={`/profile/sample`}>
                      <Button
                        variant="ghost"
                        className="text-sm text-zinc-300 hover:text-white"
                      >
                        View Profile
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-900 text-white font-bold text-sm w-8 h-8 rounded-lg flex items-center justify-center">
                        {user.overall_score}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-semibold">{user.name}</h3>
                        {user.verified && (
                          <Badge className="ml-2 bg-emerald-900/70 text-emerald-300 border-emerald-700">
                            <Check className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        {user.hackathon_wins > 0 && (
                          <Badge className="ml-2 bg-amber-900/50 text-amber-300 border-amber-700">
                            <Trophy className="mr-1 h-3 w-3" />
                            {user.hackathon_wins}
                          </Badge>
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm">@{user.username} • {user.location}</p>
                      <p className="text-zinc-300 text-sm mt-1 line-clamp-1">{user.bio}</p>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                      <div className="text-center">
                        <p className={`text-lg font-semibold ${getScoreColor(user.github_score)}`}>
                          {user.github_score}
                        </p>
                        <p className="text-xs text-zinc-400">GitHub</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-semibold ${getScoreColor(user.onchain_score)}`}>
                          {user.onchain_score}
                        </p>
                        <p className="text-xs text-zinc-400">Onchain</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-semibold ${getScoreColor(user.web2_score)}`}>
                          {user.web2_score}
                        </p>
                        <p className="text-xs text-zinc-400">Web2</p>
                      </div>
                      <div className="text-center">
                        <p className="text-zinc-300 text-sm">{user.top_chain}</p>
                        <p className="text-xs text-zinc-400">Top Chain</p>
                      </div>
                    </div>

                    <Link href={`/profile/sample`} className="mt-auto">
                      <Button className="bg-emerald-900 hover:bg-emerald-800 text-white ">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 