"use client";

import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export default function DeveloperHeatmap() {
  // Months of the year abbreviated
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Days of the week abbreviated
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const [activeChain, setActiveChain] = useState<string>("all");
  const chains = [
    { id: "all", name: "All Chains" },
    { id: "ethereum", name: "Ethereum" },
    { id: "base", name: "Base" },
    { id: "arbitrum", name: "Arbitrum" },
    { id: "optimism", name: "Optimism" },
    { id: "solana", name: "Solana" }
  ];

  // Generate random heatmap data for demonstration
  const generateHeatmapData = () => {
    const data = [];
    for (let i = 0; i < 53; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        // Generate random activity level (0-4)
        const level = Math.floor(Math.random() * 5) as HeatmapLevel;
        week.push(level);
      }
      data.push(week);
    }
    return data;
  };

  const heatmapData = generateHeatmapData();
  
  // Color values for different contribution levels
  const getLevelColor = (level: HeatmapLevel) => {
    switch(level) {
      case 0: return 'bg-zinc-800';
      case 1: return 'bg-emerald-900';
      case 2: return 'bg-emerald-700';
      case 3: return 'bg-emerald-500';
      case 4: return 'bg-emerald-300';
    }
  };

  // Tooltip description for contribution level
  const getLevelDescription = (level: HeatmapLevel) => {
    switch(level) {
      case 0: return 'No contributions';
      case 1: return '1-2 contributions';
      case 2: return '3-5 contributions';
      case 3: return '6-10 contributions';
      case 4: return '10+ contributions';
    }
  };

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 rounded-full border-zinc-800 bg-zinc-900/70 backdrop-blur-sm px-4 py-1 text-white">
            Activity Visualization
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Onchain Contribution Heatmap</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Track a developer's onchain activity across multiple blockchains with a visual representation of their contributions.
          </p>
        </div>
        
        {/* Chain selection tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {chains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => setActiveChain(chain.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeChain === chain.id 
                  ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' 
                  : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800/50'
              }`}
            >
              {chain.name}
            </button>
          ))}
        </div>
        
        {/* Heatmap visualization */}
        <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 md:p-8 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Months labels */}
            <div className="flex text-sm text-zinc-500 mb-2">
              <div className="w-10"></div> {/* Empty space for alignment */}
              <div className="flex-1 grid grid-cols-12">
                {months.map((month, i) => (
                  <div key={i} className="text-center">{month}</div>
                ))}
              </div>
            </div>
            
            {/* Heatmap grid */}
            <div className="flex">
              {/* Days of week labels */}
              <div className="w-10 flex flex-col justify-between py-2">
                {days.map((day, i) => (
                  <div key={i} className="text-xs text-zinc-500 h-[14px]">{day}</div>
                ))}
              </div>
              
              {/* Contribution cells */}
              <div className="flex-1 grid grid-cols-53 gap-1">
                {heatmapData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((level, dayIndex) => (
                      <div 
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-3 h-3 rounded-sm ${getLevelColor(level as HeatmapLevel)} hover:ring-1 hover:ring-white transition-all cursor-pointer`}
                        title={`${getLevelDescription(level as HeatmapLevel)} on ${days[dayIndex]}`}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-end mt-4 text-xs text-zinc-500">
              <span className="mr-2">Less</span>
              {[0, 1, 2, 3, 4].map((level) => {
                // Explicitly cast the level to HeatmapLevel type
                const heatmapLevel = level as HeatmapLevel;
                return (
                  <div 
                    key={level} 
                    className={`w-3 h-3 rounded-sm mx-0.5 ${getLevelColor(heatmapLevel)}`}
                  ></div>
                );
              })}
              <span className="ml-2">More</span>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
            <div className="text-2xl font-bold mb-1 text-emerald-400">762</div>
            <div className="text-zinc-400 text-sm">Total transactions</div>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
            <div className="text-2xl font-bold mb-1 text-emerald-400">134</div>
            <div className="text-zinc-400 text-sm">Smart contracts deployed</div>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
            <div className="text-2xl font-bold mb-1 text-emerald-400">87%</div>
            <div className="text-zinc-400 text-sm">Successful transactions</div>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
            <div className="text-2xl font-bold mb-1 text-emerald-400">5</div>
            <div className="text-zinc-400 text-sm">Active chains</div>
          </div>
        </div>
      </div>
    </section>
  );
} 