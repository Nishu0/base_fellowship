"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, X } from "lucide-react";
import * as d3 from "d3";

// Dynamically import ForceGraph2D component (it requires window/document)
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => <div className="w-full h-[700px] flex items-center justify-center bg-zinc-900/50 rounded-xl">Loading graph visualization...</div>
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
  fx?: number; 
  fy?: number;
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
  const [filters, setFilters] = useState<FilterState>({
    skills: [],
    chains: [],
    minScore: 0
  });
  const [graphInitialized, setGraphInitialized] = useState(false);
  const [imageCache, setImageCache] = useState<{[key: string]: HTMLImageElement}>({});
  
  // Collect all available skills and chains for filters
  const allSkills = Array.from(new Set(users.flatMap(user => user.skills)));
  const allChains = Array.from(new Set(users.flatMap(user => user.chains)));

  // Preload avatar images
  useEffect(() => {
    if (!users || users.length === 0) return;
    
    const cache: {[key: string]: HTMLImageElement} = {};
    
    users.forEach(user => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = user.avatar || `https://avatar.vercel.sh/${user.username}`;
      cache[user.id] = img;
    });
    
    setImageCache(cache);
  }, [users]);

  // Generate graph data from users
  useEffect(() => {
    if (!users || users.length === 0) return;
    
    // Sort users by score to position higher scores in the center
    const sortedUsers = [...users].sort((a, b) => b.overall_score - a.overall_score);
    
    // Calculate spacing factors based on number of users
    const maxRadius = 450; // Further increased radius for better spacing
    const nodeSizeBase = 14; // Slightly smaller nodes
    
    // First pass - create nodes with initial positions based on score
    let tempNodes = sortedUsers.map((user, index) => {
      // Non-linear scoring function to create more space as score decreases
      const scorePercentage = user.overall_score / 100;
      // More aggressive curve to push nodes further apart
      const scoreRadius = maxRadius * Math.pow(1 - scorePercentage, 0.6);
      
      // Add significant variation to angle to avoid perfect alignment
      const totalUsers = sortedUsers.length;
      const angleStep = (2 * Math.PI) / totalUsers;
      // Add more randomization to the angle to break symmetry and prevent overlaps
      const randomizedIndex = index + (Math.random() * 0.6 - 0.3);
      const angle = randomizedIndex * angleStep;
      
      // Adjust size inversely to the number of users - more users means smaller nodes
      const sizeAdjustment = Math.max(0, 8 - Math.floor(sortedUsers.length / 10));
      const nodeSize = nodeSizeBase + Math.min(sizeAdjustment, Math.floor(user.overall_score / 15));
      
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        skills: user.skills,
        chains: user.chains,
        score: user.overall_score,
        size: nodeSize,
        color: getNodeColor(user),
        x: scoreRadius * Math.cos(angle),
        y: scoreRadius * Math.sin(angle),
        fx: scoreRadius * Math.cos(angle),
        fy: scoreRadius * Math.sin(angle),
        // Track original radius and angle for adjustments
        _radius: scoreRadius,
        _angle: angle,
        _nodeSize: nodeSize
      };
    });
    
    // Second pass - resolve collisions with spiral offset
    const resolveCollisions = (nodes: GraphNode[]) => {
      const collisionDistance = (node1: GraphNode, node2: GraphNode) => {
        // Calculate the minimum distance needed to avoid collision
        const minDist = node1._nodeSize + node2._nodeSize + 10; // Extra 10px buffer
        // Calculate actual distance between nodes
        const dx = (node2.x || 0) - (node1.x || 0);
        const dy = (node2.y || 0) - (node1.y || 0);
        const actualDist = Math.sqrt(dx * dx + dy * dy);
        return { 
          isColliding: actualDist < minDist,
          distance: actualDist,
          minDistance: minDist
        };
      };
      
      let hasCollisions = true;
      let iterations = 0;
      const maxIterations = 10;
      
      // Iteratively adjust positions to resolve collisions
      while (hasCollisions && iterations < maxIterations) {
        hasCollisions = false;
        iterations++;
        
        // Check each pair of nodes for collisions
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const collision = collisionDistance(nodes[i], nodes[j]);
            
            if (collision.isColliding) {
              hasCollisions = true;
              
              // Adjust nodes with lower scores (higher indices) more
              // High-score nodes stay closer to their original positions
              const nodeI = nodes[i];
              const nodeJ = nodes[j];
              
              // Weight adjustments inversely by score - lower scores move more
              const totalScore = nodeI.score + nodeJ.score;
              const weightI = 1 - (nodeI.score / totalScore) * 0.8; // 0.2-0.8 range
              const weightJ = 1 - (nodeJ.score / totalScore) * 0.8; // 0.2-0.8 range
              
              // Calculate adjustment needed
              const adjustment = (collision.minDistance - collision.distance) * 1.2;
              
              // Calculate adjustment direction
              const dx = (nodeJ.x || 0) - (nodeI.x || 0);
              const dy = (nodeJ.y || 0) - (nodeI.y || 0);
              const angle = Math.atan2(dy, dx);
              
              // Adjust nodes in opposite directions
              // Move node i away from j, and j away from i
              if (i === 0) {
                // Don't move the highest scoring node (center)
                nodeJ.x += Math.cos(angle) * adjustment;
                nodeJ.y += Math.sin(angle) * adjustment;
                
                // Update fixed positions
                nodeJ.fx = nodeJ.x;
                nodeJ.fy = nodeJ.y;
              } else {
                // Move both nodes in opposite directions by weighted amounts
                nodeI.x -= Math.cos(angle) * adjustment * weightI;
                nodeI.y -= Math.sin(angle) * adjustment * weightI;
                nodeJ.x += Math.cos(angle) * adjustment * weightJ;
                nodeJ.y += Math.sin(angle) * adjustment * weightJ;
                
                // Update fixed positions
                nodeI.fx = nodeI.x;
                nodeI.fy = nodeI.y;
                nodeJ.fx = nodeJ.x;
                nodeJ.fy = nodeJ.y;
              }
            }
          }
        }
      }
      
      return nodes;
    };
    
    // Apply collision resolution
    const finalNodes = resolveCollisions(tempNodes);
    
    // Generate links based on common skills or chains
    const links: GraphData["links"] = [];
    
    for (let i = 0; i < finalNodes.length; i++) {
      for (let j = i + 1; j < finalNodes.length; j++) {
        // Connect users who share skills
        const commonSkills = finalNodes[i].skills.filter((skill: string) => 
          finalNodes[j].skills.includes(skill)
        );
        
        if (commonSkills.length > 0) {
          links.push({
            source: finalNodes[i].id,
            target: finalNodes[j].id,
            value: commonSkills.length,
            type: 'skill'
          });
        }
        
        // Connect users who share chains
        const commonChains = finalNodes[i].chains.filter((chain: string) => 
          finalNodes[j].chains.includes(chain)
        );
        
        if (commonChains.length > 0) {
          links.push({
            source: finalNodes[i].id,
            target: finalNodes[j].id,
            value: commonChains.length,
            type: 'chain'
          });
        }
      }
    }
    
    setGraphData({ nodes: finalNodes, links });
  }, [users]);

  // Apply filters to graph data
  useEffect(() => {
    if (!users || users.length === 0) return;
    
    // Filter and sort users based on current filters
    const filteredAndSortedUsers = users
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
      .sort((a, b) => b.overall_score - a.overall_score); // Sort by score (highest first)
    
    // Calculate spacing factors based on number of users
    const maxRadius = 450; // Further increased radius for better spacing
    const nodeSizeBase = 14; // Slightly smaller nodes
    
    // First pass - create nodes with initial positions based on score
    let tempNodes = filteredAndSortedUsers.map((user, index) => {
      // Non-linear scoring function to create more space as score decreases
      const scorePercentage = user.overall_score / 100;
      // More aggressive curve to push nodes further apart
      const scoreRadius = maxRadius * Math.pow(1 - scorePercentage, 0.6);
      
      // Add significant variation to angle to avoid perfect alignment
      const totalUsers = filteredAndSortedUsers.length;
      const angleStep = (2 * Math.PI) / totalUsers;
      // Add more randomization to the angle to break symmetry and prevent overlaps
      const randomizedIndex = index + (Math.random() * 0.6 - 0.3);
      const angle = randomizedIndex * angleStep;
      
      // Adjust size inversely to the number of users - more users means smaller nodes
      const sizeAdjustment = Math.max(0, 8 - Math.floor(filteredAndSortedUsers.length / 10));
      const nodeSize = nodeSizeBase + Math.min(sizeAdjustment, Math.floor(user.overall_score / 15));
      
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        skills: user.skills,
        chains: user.chains,
        score: user.overall_score,
        size: nodeSize,
        color: getNodeColor(user),
        x: scoreRadius * Math.cos(angle),
        y: scoreRadius * Math.sin(angle),
        fx: scoreRadius * Math.cos(angle),
        fy: scoreRadius * Math.sin(angle),
        // Track original radius and angle for adjustments
        _radius: scoreRadius,
        _angle: angle,
        _nodeSize: nodeSize
      };
    });
    
    // Second pass - resolve collisions with spiral offset
    const resolveCollisions = (nodes: GraphNode[]) => {
      const collisionDistance = (node1: GraphNode, node2: GraphNode) => {
        // Calculate the minimum distance needed to avoid collision
        const minDist = node1._nodeSize + node2._nodeSize + 10; // Extra 10px buffer
        // Calculate actual distance between nodes
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const actualDist = Math.sqrt(dx * dx + dy * dy);
        return { 
          isColliding: actualDist < minDist,
          distance: actualDist,
          minDistance: minDist
        };
      };
      
      let hasCollisions = true;
      let iterations = 0;
      const maxIterations = 10;
      
      // Iteratively adjust positions to resolve collisions
      while (hasCollisions && iterations < maxIterations) {
        hasCollisions = false;
        iterations++;
        
        // Check each pair of nodes for collisions
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const collision = collisionDistance(nodes[i], nodes[j]);
            
            if (collision.isColliding) {
              hasCollisions = true;
              
              // Adjust nodes with lower scores (higher indices) more
              // High-score nodes stay closer to their original positions
              const nodeI = nodes[i];
              const nodeJ = nodes[j];
              
              // Weight adjustments inversely by score - lower scores move more
              const totalScore = nodeI.score + nodeJ.score;
              const weightI = 1 - (nodeI.score / totalScore) * 0.8; // 0.2-0.8 range
              const weightJ = 1 - (nodeJ.score / totalScore) * 0.8; // 0.2-0.8 range
              
              // Calculate adjustment needed
              const adjustment = (collision.minDistance - collision.distance) * 1.2;
              
              // Calculate adjustment direction
              const dx = (nodeJ.x || 0) - (nodeI.x || 0);
              const dy = (nodeJ.y || 0) - (nodeI.y || 0);
              const angle = Math.atan2(dy, dx);
              
              // Adjust nodes in opposite directions
              // Move node i away from j, and j away from i
              if (i === 0) {
                // Don't move the highest scoring node (center)
                nodeJ.x += Math.cos(angle) * adjustment;
                nodeJ.y += Math.sin(angle) * adjustment;
                
                // Update fixed positions
                nodeJ.fx = nodeJ.x;
                nodeJ.fy = nodeJ.y;
              } else {
                // Move both nodes in opposite directions by weighted amounts
                nodeI.x -= Math.cos(angle) * adjustment * weightI;
                nodeI.y -= Math.sin(angle) * adjustment * weightI;
                nodeJ.x += Math.cos(angle) * adjustment * weightJ;
                nodeJ.y += Math.sin(angle) * adjustment * weightJ;
                
                // Update fixed positions
                nodeI.fx = nodeI.x;
                nodeI.fy = nodeI.y;
                nodeJ.fx = nodeJ.x;
                nodeJ.fy = nodeJ.y;
              }
            }
          }
        }
      }
      
      return nodes;
    };
    
    // Apply collision resolution
    const finalNodes = resolveCollisions(tempNodes);
    
    // Generate links based on common skills or chains
    const filteredLinks = [];
    
    for (let i = 0; i < finalNodes.length; i++) {
      for (let j = i + 1; j < finalNodes.length; j++) {
        // Connect users who share skills
        const commonSkills = finalNodes[i].skills.filter((skill: string) => 
          finalNodes[j].skills.includes(skill)
        );
        
        if (commonSkills.length > 0) {
          filteredLinks.push({
            source: finalNodes[i].id,
            target: finalNodes[j].id,
            value: commonSkills.length,
            type: 'skill'
          });
        }
        
        // Connect users who share chains
        const commonChains = finalNodes[i].chains.filter((chain: string) => 
          finalNodes[j].chains.includes(chain)
        );
        
        if (commonChains.length > 0) {
          filteredLinks.push({
            source: finalNodes[i].id,
            target: finalNodes[j].id,
            value: commonChains.length,
            type: 'chain'
          });
        }
      }
    }
    
    setGraphData({ nodes: finalNodes, links: filteredLinks });
  }, [users, filters]);

  // Helper to get node color based on top chain or score
  const getNodeColor = (user: User) => {
    // Colors for different chains - made more vibrant
    const chainColors: {[key: string]: string} = {
      'Eth': '#6470FF',
      'Base': '#0066FF',
      'Solana': '#00FFD0',
      'Optimism': '#FF0D33',
      'Arbitrum': '#33B3FF',
      'Polygon': '#9B63FF',
      'zkSync': '#D0B3FF',
      'StarkNet': '#00FFE6',
      'Aptos': '#33FFD0',
      'Sui': '#66D9FF'
    };
    
    // Default color based on score - made more vibrant
    if (!user.top_chain) {
      const score = user.overall_score;
      if (score > 90) return '#00D68F'; // emerald - brighter
      if (score > 80) return '#3B82FF'; // blue - brighter
      if (score > 70) return '#9C66FF'; // violet - brighter
      if (score > 60) return '#FFAC26'; // amber - brighter
      return '#8596AD'; // gray - brighter
    }
    
    return chainColors[user.top_chain] || '#8596AD';
  };

  // Handle node hover/click
  const handleNodeHover = (node: any, prev: any) => {
    // Clear highlight state when no node is hovered
    if (!node) {
      // Only reset highlights if not in selected mode
      if (!selectedNode) {
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());
      }
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
    
    // If a node is already selected, don't override those highlights
    if (!selectedNode) {
      setHighlightNodes(connectedNodes);
      setHighlightLinks(connectedLinks);
    }
  };
  
  const handleNodeClick = (node: any, event: MouseEvent) => {
    // If same node clicked again, deselect it
    if (selectedNode && selectedNode.id === node.id) {
      setSelectedNode(null);
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }
    
    // Set of nodes connected to the clicked node
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
    
    setSelectedNode(node as GraphNode);
    setHighlightNodes(connectedNodes);
    setHighlightLinks(connectedLinks);
    
    // Center view on node without zooming, to maintain consistent view
    if (graphRef.current) {
      graphRef.current.centerAt(node.x || 0, node.y || 0, 500);
    }
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
      {/* Filters section - Improved styling */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Filter Developers</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setFilters({ skills: [], chains: [], minScore: 0 })}
          >
            Reset Filters
          </Button>
        </div>
          
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skills filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">Skills</h4>
            <select
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value=""
              onChange={(e) => {
                if (e.target.value && !filters.skills.includes(e.target.value)) {
                  setFilters(prev => ({
                    ...prev,
                    skills: [...prev.skills, e.target.value]
                  }));
                }
              }}
            >
              <option value="">Select a skill...</option>
              {allSkills
                .filter(skill => !filters.skills.includes(skill))
                .map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))
              }
            </select>
            
            {/* Selected skills */}
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.skills.map(skill => (
                <Badge 
                  key={skill}
                  variant="default"
                  className="cursor-pointer"
                >
                  {skill}
                  <X 
                    size={14} 
                    className="ml-1" 
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      skills: prev.skills.filter(s => s !== skill)
                    }))}
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Chains filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">Blockchain Experience</h4>
            <select
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value=""
              onChange={(e) => {
                if (e.target.value && !filters.chains.includes(e.target.value)) {
                  setFilters(prev => ({
                    ...prev,
                    chains: [...prev.chains, e.target.value]
                  }));
                }
              }}
            >
              <option value="">Select a blockchain...</option>
              {allChains
                .filter(chain => !filters.chains.includes(chain))
                .map(chain => (
                  <option key={chain} value={chain}>{chain}</option>
                ))
              }
            </select>
            
            {/* Selected chains */}
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.chains.map(chain => (
                <Badge 
                  key={chain}
                  variant="default"
                  className="cursor-pointer"
                >
                  {chain}
                  <X 
                    size={14} 
                    className="ml-1" 
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      chains: prev.chains.filter(c => c !== chain)
                    }))}
                  />
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
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main graph - Increased size, 3 columns instead of 2 */}
        <div className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="h-[700px] w-full">
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              nodeLabel={(node: any) => `${(node as GraphNode).name} (${(node as GraphNode).username})`}
              nodeColor={(node: any) => {
                const isSelected = selectedNode !== null;
                const isHighlighted = highlightNodes.has(node.id);
                
                if (isSelected) {
                  // When a node is selected, connected nodes are highlighted, others are faded
                  return isHighlighted 
                    ? (node.id === selectedNode?.id ? '#FF3B30' : (node as GraphNode).color || '#8596AD')  // Selected node is red, connected nodes normal color
                    : 'rgba(100, 100, 100, 0.2)'; // Unconnected nodes are faded gray
                }
                
                // When hovering (but no selection), connected nodes are highlighted, others slightly faded
                return highlightNodes.size === 0 || isHighlighted 
                  ? (node as GraphNode).color || '#8596AD'
                  : 'rgba(160, 160, 160, 0.3)';
              }}
              nodeRelSize={10}
              nodeVal={(node: any) => (node as GraphNode).size || 10}
              linkWidth={(link: any) => {
                const isSelected = selectedNode !== null;
                const isHighlighted = highlightLinks.has(link);
                
                if (isSelected || highlightLinks.size > 0) {
                  return isHighlighted ? 4 : 1;
                }
                
                return 2;
              }}
              linkColor={(link: any) => {
                const isSelected = selectedNode !== null;
                const isHighlighted = highlightLinks.has(link);
                
                if (isSelected || highlightLinks.size > 0) {
                  return isHighlighted 
                    ? 'rgba(0, 255, 191, 0.8)' 
                    : 'rgba(100, 100, 100, 0.1)';
                }
                
                return (link as GraphLink).type === 'skill' 
                  ? 'rgba(0, 255, 191, 0.5)'
                  : 'rgba(0, 210, 255, 0.5)';
              }}
              onNodeHover={handleNodeHover}
              onNodeClick={handleNodeClick}
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const typedNode = node as GraphNode;
                const size = typedNode.size || 16;
                
                const isSelected = selectedNode !== null;
                const isHighlighted = highlightNodes.has(typedNode.id);
                const isCurrentNode = selectedNode?.id === typedNode.id;
                
                // Calculate the appropriate opacity
                let opacity = 1;
                if (isSelected || highlightNodes.size > 0) {
                  opacity = isHighlighted ? 1 : 0.2;
                  if (isCurrentNode) opacity = 1;
                }
                
                const scaledSize = isCurrentNode ? size * 1.4 : size * (isHighlighted ? 1 : 0.9);
                
                // Create circular clip for avatar
                ctx.save();
                ctx.beginPath();
                ctx.arc(node.x || 0, node.y || 0, scaledSize, 0, 2 * Math.PI);
                ctx.clip();
                
                const img = imageCache[typedNode.id];
                
                // Draw the image if it's loaded
                if (img && img.complete && img.naturalHeight !== 0) {
                  try {
                    // Apply opacity to the canvas
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(
                      img,
                      (node.x || 0) - scaledSize,
                      (node.y || 0) - scaledSize,
                      scaledSize * 2,
                      scaledSize * 2
                    );
                  } catch (e) {
                    // Fallback if image fails to render
                    ctx.fillStyle = typedNode.color || '#8596AD';
                    ctx.fill();
                  }
                } else {
                  // Fallback for images not yet loaded
                  ctx.globalAlpha = opacity;
                  ctx.fillStyle = typedNode.color || '#8596AD';
                  ctx.fill();
                  
                  // Draw the first letter of the name as a placeholder
                  ctx.font = `${scaledSize}px Sans-Serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = 'white';
                  ctx.fillText(
                    typedNode.name.charAt(0).toUpperCase(),
                    node.x || 0,
                    node.y || 0
                  );
                }
                
                // Restore context to remove clipping mask but keep opacity for borders
                ctx.restore();
                ctx.globalAlpha = opacity;
                
                // Draw border for verified users
                const isVerified = users.find(u => u.id === typedNode.id)?.verified;
                if (isVerified) {
                  ctx.beginPath();
                  ctx.arc(node.x || 0, node.y || 0, scaledSize + 2, 0, 2 * Math.PI);
                  ctx.lineWidth = 2;
                  ctx.strokeStyle = '#10b981';
                  ctx.stroke();
                }
                
                // Score-based border thickness
                const scoreRing = (typedNode.score > 85);
                if (scoreRing) {
                  ctx.beginPath();
                  ctx.arc(node.x || 0, node.y || 0, scaledSize + 4, 0, 2 * Math.PI);
                  ctx.lineWidth = 1.5;
                  ctx.strokeStyle = typedNode.score > 90 ? '#FFD700' : '#C0C0C0'; // Gold for >90, Silver for >85
                  ctx.stroke();
                }
                
                // Special glow for selected node
                if (isCurrentNode) {
                  ctx.beginPath();
                  ctx.arc(node.x || 0, node.y || 0, scaledSize + 8, 0, 2 * Math.PI);
                  ctx.lineWidth = 3;
                  ctx.strokeStyle = 'rgba(255, 59, 48, 0.7)'; // Red glow for selected node
                  ctx.stroke();
                }
                
                // Reset alpha for the text
                ctx.globalAlpha = isHighlighted || (!isSelected && highlightNodes.size === 0) ? 1 : 0.4;
                
                // Draw node labels with larger font
                const label = typedNode.name;
                ctx.font = `${14 / globalScale}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'white';
                ctx.fillText(label, node.x || 0, (node.y || 0) + scaledSize + (18 / globalScale));

                // Reset alpha
                ctx.globalAlpha = 1;
              }}
              cooldownTicks={0} // Disable physics simulation to keep nodes static
              enableNodeDrag={false} // Disable node dragging
              enableZoomInteraction={true} // Allow zooming for exploration
              onEngineStop={() => {
                if (!graphInitialized) {
                  // When the engine stops initially, fix all node positions
                  const nodes = graphData.nodes.map(node => ({
                    ...node,
                    fx: node.x, // Fix X position
                    fy: node.y  // Fix Y position
                  }));
                  setGraphData({ ...graphData, nodes });
                  setGraphInitialized(true);
                }
              }}
            />
          </div>
        </div>
        
        {/* Selected node details */}
        <div className="h-[700px] overflow-hidden">
          {selectedNode ? (
            <Card className="p-4 bg-zinc-950 border-zinc-800 h-full overflow-hidden flex flex-col">
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
              
              <div className="flex flex-col flex-1 overflow-hidden">
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
                <div className="flex-1 overflow-y-auto">
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