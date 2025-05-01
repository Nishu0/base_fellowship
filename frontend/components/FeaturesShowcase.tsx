"use client";

import { Badge } from "@/components/ui/badge";
import { Github, Twitter, BarChart3, FileCode, BrainCircuit, Layers } from "lucide-react";

export default function FeaturesShowcase() {
  return (
    <section className="py-24 bg-black relative overflow-hidden" id="features">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      {/* Content container */}
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 rounded-full border-zinc-800 bg-zinc-900/70 backdrop-blur-sm px-4 py-1 text-white">
            Smart Builder Selection
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Comprehensive Builder Profiles</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Evaluate hackathon candidates with rich onchain and offchain data that provides a holistic view of their capabilities.
          </p>
        </div>
        
        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group">
            <div className="bg-zinc-800 rounded-lg w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-blue-950 transition-colors">
              <Github className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">GitHub Score</h3>
            <p className="text-zinc-400">Analyze GitHub contributions across onchain projects, focusing on Solidity, Move, and Solana ecosystems.</p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group">
            <div className="bg-zinc-800 rounded-lg w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-purple-950 transition-colors">
              <Twitter className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Social Profiles</h3>
            <p className="text-zinc-400">Connect Twitter and Farcaster profiles to establish credibility and community standing in the web3 ecosystem.</p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group">
            <div className="bg-zinc-800 rounded-lg w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-emerald-950 transition-colors">
              <BarChart3 className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Onchain Score</h3>
            <p className="text-zinc-400">Leverage the Talent Protocol API to generate comprehensive onchain activity scores across multiple blockchains.</p>
          </div>
          
          {/* Feature 4 */}
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group">
            <div className="bg-zinc-800 rounded-lg w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-amber-950 transition-colors">
              <FileCode className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Contract Deployments</h3>
            <p className="text-zinc-400">Track smart contracts deployed across mainnet and testnet environments for objective skill verification.</p>
          </div>
          
          {/* Feature 5 */}
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group">
            <div className="bg-zinc-800 rounded-lg w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-rose-950 transition-colors">
              <BrainCircuit className="h-6 w-6 text-rose-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Agentic Rating</h3>
            <p className="text-zinc-400">Premium AI-driven evaluation that dynamically rates candidates based on their specific achievements and contributions.</p>
          </div>
          
          {/* Feature 6 */}
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group">
            <div className="bg-zinc-800 rounded-lg w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-indigo-950 transition-colors">
              <Layers className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Detailed Reports</h3>
            <p className="text-zinc-400">Deep dive into comprehensive profiles with AI-generated insights that highlight strengths and potential.</p>
          </div>
        </div>
      </div>
    </section>
  );
} 