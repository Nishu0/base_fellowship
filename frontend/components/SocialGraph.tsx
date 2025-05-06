"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, X } from "lucide-react";

// Dynamically import ForceGraph2D component (it requires window/document)
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] flex items-center justify-center bg-zinc-900/50 rounded-xl">Loading graph visualization...</div>
});

type User = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  skills: string[];
  chains: string[];
  overall_score: number;
  location?: string;
  top_chain?: string;
  verified?: boolean;
};

// Define node type that both matches our data structure and satisfies ForceGraph's requirements
type GraphNode = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  skills: string[];
  chains: string[];
  score: number;
  size?: number;
  color?: string;
  x?: number;
  y?: number;
  [key: string]: any; // Allow additional properties that ForceGraph might add
};

type GraphLink = {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
  type: string;
  [key: string]: any; // Allow additional properties that ForceGraph might add
};

type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

type FilterState = {
  skills: string[];
  chains: string[];
  minScore: number;
};

export default function SocialGraph({ users }: { users: User[] }) {
  const graphRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<any>());
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    skills: [],
    chains: [],
    minScore: 0
  });
  
  // Collect all available skills and chains for filters
  const allSkills = Array.from(new Set(users.flatMap(user => user.skills)));
  const allChains = Array.from(new Set(users.flatMap(user => user.chains)));

  // Generate graph data from users
  useEffect(() => {
    if (!users || users.length === 0) return;
    
    const nodes = users.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      skills: user.skills,
      chains: user.chains,
      score: user.overall_score,
      size: 5 + (user.overall_score / 20), // Size based on score
      color: getNodeColor(user)
    }));
    
    // Generate links based on common skills or chains
    const links: GraphData["links"] = [];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // Connect users who share skills
        const commonSkills = nodes[i].skills.filter(skill => 
          nodes[j].skills.includes(skill)
        );
        
        if (commonSkills.length > 0) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            value: commonSkills.length,
            type: 'skill'
          });
        }
        
        // Connect users who share chains
        const commonChains = nodes[i].chains.filter(chain => 
          nodes[j].chains.includes(chain)
        );
        
        if (commonChains.length > 0) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            value: commonChains.length,
            type: 'chain'
          });
        }
      }
    }
    
    setGraphData({ nodes, links });
  }, [users]);

  // Apply filters to graph data
  useEffect(() => {
    if (!users || users.length === 0) return;
    
    // Filter nodes based on current filters
    const filteredNodes = users
      .filter(user => {
        // Filter by minimum score
        if (user.overall_score < filters.minScore) return false;
        
        // Filter by skills (if any selected)
        if (filters.skills.length > 0 && 
            !filters.skills.some(skill => user.skills.includes(skill))) {
          return false;
        }
        
        // Filter by chains (if any selected)
        if (filters.chains.length > 0 && 
            !filters.chains.some(chain => user.chains.includes(chain))) {
          return false;
        }
        
        return true;
      })
      .map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        skills: user.skills,
        chains: user.chains,
        score: user.overall_score,
        size: 5 + (user.overall_score / 20), // Size based on score
        color: getNodeColor(user)
      }));
    
    // Only include links between filtered nodes
    const filteredNodeIds = filteredNodes.map(node => node.id);
    const filteredLinks = [];
    
    for (let i = 0; i < filteredNodes.length; i++) {
      for (let j = i + 1; j < filteredNodes.length; j++) {
        // Connect users who share skills
        const commonSkills = filteredNodes[i].skills.filter(skill => 
          filteredNodes[j].skills.includes(skill)
        );
        
        if (commonSkills.length > 0) {
          filteredLinks.push({
            source: filteredNodes[i].id,
            target: filteredNodes[j].id,
            value: commonSkills.length,
            type: 'skill'
          });
        }
        
        // Connect users who share chains
        const commonChains = filteredNodes[i].chains.filter(chain => 
          filteredNodes[j].chains.includes(chain)
        );
        
        if (commonChains.length > 0) {
          filteredLinks.push({
            source: filteredNodes[i].id,
            target: filteredNodes[j].id,
            value: commonChains.length,
            type: 'chain'
          });
        }
      }
    }
    
    setGraphData({ nodes: filteredNodes, links: filteredLinks });
  }, [users, filters]);

  // Helper to get node color based on top chain or score
  const getNodeColor = (user: User) => {
    // Colors for different chains
    const chainColors: {[key: string]: string} = {
      'Eth': '#5a67d8',
      'Base': '#0052ff',
      'Solana': '#00ffbd',
      'Optimism': '#ff0420',
      'Arbitrum': '#28a0f0',
      'Polygon': '#8247e5',
      'zkSync': '#cc9dfd',
      'StarkNet': '#00ffd0',
      'Aptos': '#2ed8a7',
      'Sui': '#6fbcf0'
    };
    
    // Default color based on score
    if (!user.top_chain) {
      const score = user.overall_score;
      if (score > 90) return '#10b981'; // emerald
      if (score > 80) return '#3b82f6'; // blue
      if (score > 70) return '#8b5cf6'; // violet
      if (score > 60) return '#f59e0b'; // amber
      return '#6b7280'; // gray
    }
    
    return chainColors[user.top_chain] || '#6b7280';
  };

  // Handle node hover/click
  const handleNodeHover = (node: any, prev: any) => {
    if (!node) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }
    
    // Set of nodes connected to the hovered node
    const connectedNodes = new Set<string>([node.id]);
    const connectedLinks = new Set();
    
    // Add connected nodes and links
    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (sourceId === node.id || targetId === node.id) {
        connectedNodes.add(sourceId);
        connectedNodes.add(targetId);
        connectedLinks.add(link);
      }
    });
    
    setHighlightNodes(connectedNodes);
    setHighlightLinks(connectedLinks);
  };
  
  const handleNodeClick = (node: any, event: MouseEvent) => {
    setSelectedNode(node as GraphNode);
    handleNodeHover(node, null);
    
    // Zoom to node
    if (graphRef.current) {
      graphRef.current.centerAt(node.x || 0, node.y || 0, 1000);
      graphRef.current.zoom(2, 1000);
    }
  };
  
  // Toggle filter for skills or chains
  const toggleFilter = (type: 'skills' | 'chains', value: string) => {
    setFilters(prev => {
      const current = [...prev[type]];
      const index = current.indexOf(value);
      
      if (index === -1) {
        current.push(value);
      } else {
        current.splice(index, 1);
      }
      
      return {
        ...prev,
        [type]: current
      };
    });
  };
  
  // Helper to find common elements between two arrays
  const findCommonElements = (arr1: string[], arr2: string[]) => {
    return arr1.filter(item => arr2.includes(item));
  };
  
  // Get connected users to the selected node
  const getConnectedUsers = () => {
    if (!selectedNode) return [];
    
    const connectedUserIds = new Set<string>();
    
    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (sourceId === selectedNode.id) {
        connectedUserIds.add(targetId);
      } else if (targetId === selectedNode.id) {
        connectedUserIds.add(sourceId);
      }
    });
    
    return graphData.nodes.filter(node => connectedUserIds.has(node.id));
  };
  
  return (
    <div className="w-full mt-6">
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        
        {/* Filter button */}
        <Button 
          onClick={() => setFiltersVisible(!filtersVisible)}
          variant="outline"
          className="flex items-center gap-2 self-start"
        >
          <Filter size={16} />
          Filters
          <ChevronDown size={16} className={`transition-transform ${filtersVisible ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      
      {/* Filters panel */}
      {filtersVisible && (
        <Card className="p-4 mb-4 bg-zinc-950 border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filter Developers</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setFilters({ skills: [], chains: [], minScore: 0 })}
              className="text-xs"
            >
              Reset
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Skills filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {allSkills.map(skill => (
                  <Badge 
                    key={skill}
                    variant={filters.skills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter('skills', skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Chains filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Blockchain Experience</h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {allChains.map(chain => (
                  <Badge 
                    key={chain}
                    variant={filters.chains.includes(chain) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter('chains', chain)}
                  >
                    {chain}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Score filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Minimum Score: {filters.minScore}</h4>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={e => setFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main graph */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="h-[600px] w-full">
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              nodeLabel={(node: any) => `${(node as GraphNode).name} (${(node as GraphNode).username})`}
              nodeColor={(node: any) => 
                highlightNodes.size === 0 || highlightNodes.has(node.id) 
                  ? (node as GraphNode).color || '#6b7280'
                  : 'rgba(160, 160, 160, 0.3)'
              }
              nodeRelSize={6}
              nodeVal={(node: any) => (node as GraphNode).size || 5}
              linkWidth={(link: any) => highlightLinks.has(link) ? 3 : 1}
              linkColor={(link: any) => {
                if (highlightLinks.size > 0 && !highlightLinks.has(link)) {
                  return 'rgba(160, 160, 160, 0.1)';
                }
                return (link as GraphLink).type === 'skill' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)';
              }}
              onNodeHover={handleNodeHover}
              onNodeClick={handleNodeClick}
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const typedNode = node as GraphNode;
                // Draw circular background for avatar
                const size = (typedNode.size || 5) * (highlightNodes.size === 0 || highlightNodes.has(typedNode.id) ? 1 : 0.8);
                ctx.beginPath();
                ctx.arc(node.x || 0, node.y || 0, size, 0, 2 * Math.PI);
                ctx.fillStyle = typedNode.color || '#6b7280';
                ctx.fill();
                
                // Draw border for verified users
                const isVerified = users.find(u => u.id === typedNode.id)?.verified;
                if (isVerified) {
                  ctx.beginPath();
                  ctx.arc(node.x || 0, node.y || 0, size + 1, 0, 2 * Math.PI);
                  ctx.lineWidth = 1.5;
                  ctx.strokeStyle = '#10b981';
                  ctx.stroke();
                }
                
                // Draw node labels for zoomed in nodes
                const label = typedNode.name;
                if (globalScale >= 1) {
                  ctx.font = `${10 / globalScale}px Sans-Serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = 'white';
                  ctx.fillText(label, node.x || 0, (node.y || 0) + size + (10 / globalScale));
                }
              }}
              cooldownTicks={100}
              cooldownTime={3000}
            />
          </div>
        </div>
        
        {/* Selected node details */}
        <div>
          {selectedNode ? (
            <Card className="p-4 bg-zinc-950 border-zinc-800">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                    <img 
                      src={selectedNode.avatar || `https://avatar.vercel.sh/${selectedNode.username}`}
                      alt={selectedNode.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{selectedNode.name}</h3>
                    <p className="text-zinc-400">@{selectedNode.username}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedNode(null)}
                >
                  <X size={16} />
                </Button>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedNode.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="bg-zinc-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <h4 className="text-sm font-medium mb-2">Blockchain Experience</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedNode.chains.map((chain: string) => (
                    <Badge key={chain} variant="secondary" className="bg-zinc-800">
                      {chain}
                    </Badge>
                  ))}
                </div>
                
                <h4 className="text-sm font-medium mb-2">Developer Circle</h4>
                <div className="max-h-64 overflow-y-auto">
                  {getConnectedUsers().length > 0 ? (
                    <div className="space-y-3">
                      {getConnectedUsers().map(user => {
                        const commonSkills = findCommonElements(selectedNode.skills, user.skills);
                        const commonChains = findCommonElements(selectedNode.chains, user.chains);
                        
                        return (
                          <div 
                            key={user.id} 
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900/50 cursor-pointer"
                            onClick={() => handleNodeClick(user as GraphNode, null as unknown as MouseEvent)}
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                              <img 
                                src={user.avatar || `https://avatar.vercel.sh/${user.username}`}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{user.name}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {commonSkills.slice(0, 2).map(skill => (
                                  <Badge key={skill} variant="outline" className="text-xs py-0 px-1">
                                    {skill}
                                  </Badge>
                                ))}
                                {commonChains.slice(0, 2).map(chain => (
                                  <Badge key={chain} variant="outline" className="text-xs py-0 px-1 bg-blue-950/30">
                                    {chain}
                                  </Badge>
                                ))}
                                {(commonSkills.length + commonChains.length) > 4 && (
                                  <span className="text-xs text-zinc-500">+{(commonSkills.length + commonChains.length) - 4} more</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm">No connected developers found</p>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4 bg-zinc-950 border-zinc-800 h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-zinc-400 mb-2">Select a developer to view details</p>
                <p className="text-zinc-500 text-sm">Click on any node in the graph to see their profile and connections</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 