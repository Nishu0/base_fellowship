"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CircleCheck, ArrowUpRightFromCircle, Github, Radio, Fingerprint } from "lucide-react";
import Link from "next/link";

export default function ScoreCalculation() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 "></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 rounded-full border-zinc-800 bg-zinc-900/70 backdrop-blur-sm px-4 py-1 text-white">
            Transparent Methodology
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Intelligent Score Calculation</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Our comprehensive scoring system combines multiple data sources to create a holistic view of a developer's skills and contributions.
          </p>
        </div>
        
        {/* Score calculation diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left column: Data sources */}
          <div className="space-y-6">
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all">
              <div className="flex items-start">
                <div className="bg-blue-950 rounded-lg w-10 h-10 flex items-center justify-center mr-4 shrink-0">
                  <Github className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    GitHub Contributions
                    <CircleCheck className="h-4 w-4 ml-2 text-emerald-500" />
                  </h3>
                  <p className="text-zinc-400 text-sm">Repository activity, code commits, PRs, and specific blockchain-focused projects</p>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all">
              <div className="flex items-start">
                <div className="bg-purple-950 rounded-lg w-10 h-10 flex items-center justify-center mr-4 shrink-0">
                  <Radio className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    Onchain Contributions
                    <CircleCheck className="h-4 w-4 ml-2 text-emerald-500" />
                  </h3>
                  <p className="text-zinc-400 text-sm">Onchain contributions, contract deployments, and protocol interactions across chains</p>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all">
              <div className="flex items-start">
                <div className="bg-amber-950 rounded-lg w-10 h-10 flex items-center justify-center mr-4 shrink-0">
                  <Fingerprint className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    Onchain Activity
                    <CircleCheck className="h-4 w-4 ml-2 text-emerald-500" />
                  </h3>
                  <p className="text-zinc-400 text-sm">Transaction history, contract deployments, and protocol interactions across chains</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Middle: Process arrows and flow */}
          <div className="hidden lg:block">
            <div className="relative h-full flex items-center justify-center">
              <div className="w-[320px] h-[320px] relative">
                {/* Connecting arrows */}
                <div className="absolute top-1/4 left-0 w-full">
                  <div className="h-px w-full bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-emerald-500/50"></div>
                  <ArrowRight className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                </div>
                
                <div className="absolute top-2/4 left-0 w-full">
                  <div className="h-px w-full bg-gradient-to-r from-purple-500/50 via-amber-500/50 to-emerald-500/50"></div>
                  <ArrowRight className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                </div>
                
                <div className="absolute top-3/4 left-0 w-full">
                  <div className="h-px w-full bg-gradient-to-r from-amber-500/50 via-rose-500/50 to-emerald-500/50"></div>
                  <ArrowRight className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                </div>
                
                {/* Central processing element */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-emerald-900/20 border border-emerald-800/50 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-900/60 border border-emerald-600/50 flex items-center justify-center text-2xl font-bold text-emerald-300">
                        FBI
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column: Results */}
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-8">
            <h3 className="text-xl font-bold mb-6 text-center">Builder Profile Score</h3>
            
            <div className="space-y-6">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-zinc-400">Technical Skills</span>
                  <span className="text-sm font-medium text-emerald-400">92 / 100</span>
                </div>
                <div className="w-full bg-zinc-700/50 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-zinc-400">Project Contributions</span>
                  <span className="text-sm font-medium text-emerald-400">87 / 100</span>
                </div>
                <div className="w-full bg-zinc-700/50 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-zinc-400">Onchain Activity</span>
                  <span className="text-sm font-medium text-emerald-400">78 / 100</span>
                </div>
                <div className="w-full bg-zinc-700/50 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-between items-center border-t border-zinc-700">
                <span className="font-semibold">Overall Score</span>
                <span className="text-2xl font-bold text-emerald-400">86</span>
              </div>
            </div>
            
            <div className="mt-8">
              <Link href="/profile/sample">
                <Button className="w-full bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg py-3">
                  View Sample Profile
                  <ArrowUpRightFromCircle className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 