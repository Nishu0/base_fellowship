"use client";

import { useRef } from "react";
import { Badge as LucideBadge } from "@/components/ui/badge";
import { Award, ChevronDown, Code, Layers, Search, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function How() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scrollToContent = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="how-it-works" className="min-h-screen bg-black relative overflow-hidden flex flex-col">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/80 to-black"></div>
      
      {/* Glowing orbs - decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-900/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-purple-900/20 rounded-full blur-[100px]"></div>
      
      {/* Main content container */}
      <div className="container mx-auto flex-1 flex flex-col justify-center items-center pt-20 pb-10 px-4 relative z-10">
        <div className="mx-auto max-w-[800px] text-center mb-16">
          <LucideBadge className="mb-4 rounded-full border-zinc-800 bg-zinc-900/70 backdrop-blur-sm px-4 py-1 text-white">
            How It Works
          </LucideBadge>
          <h2 className="mb-6 text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Discover Top Blockchain Talent
          </h2>
          <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
            Our platform makes it easy to find and evaluate the best builders, designers, and content creators in the
            blockchain space using a combination of onchain data and social signals.
          </p>
        </div>
        
        {/* Process cards with animations */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 w-full max-w-6xl">
          {[
            {
              icon: <Search className="h-8 w-8 text-emerald-500" />,
              title: "Search",
              description: "Find talent based on skills, experience, and onchain credentials with our powerful filtering system.",
              color: "bg-emerald-900/10",
              border: "border-emerald-800/30",
              delay: 0.1
            },
            {
              icon: <Layers className="h-8 w-8 text-purple-500" />,
              title: "Analyze",
              description: "Review comprehensive profiles with aggregated data from GitHub, blockchain networks, and social platforms.",
              color: "bg-purple-900/10",
              border: "border-purple-800/30",
              delay: 0.2
            },
            {
              icon: <Award className="h-8 w-8 text-amber-500" />,
              title: "Select",
              description: "Choose the best candidates for your hackathon based on verifiable metrics and proven track records.",
              color: "bg-amber-900/10",
              border: "border-amber-800/30",
              delay: 0.3
            },
            {
              icon: <Zap className="h-8 w-8 text-rose-500" />,
              title: "Connect",
              description: "Engage with selected talent and bring them into your hackathon ecosystem to build the next generation of web3 apps.",
              color: "bg-rose-900/10",
              border: "border-rose-800/30",
              delay: 0.4
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: item.delay }}
              viewport={{ once: true }}
              className={`flex flex-col h-full backdrop-blur-sm border ${item.border} rounded-xl p-6 ${item.color}`}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-900/80 backdrop-blur-sm">
                {item.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
              <p className="text-zinc-400 flex-grow">{item.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Additional value proposition */}
        <div className="mt-20 max-w-3xl text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-3">
              <Sparkles className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4">Built for Hackathon Organizers</h3>
          <p className="text-zinc-400">
            FBI helps you sift through thousands of applications to find the most talented and committed 
            builders for your hackathon. Save time and improve the quality of participants with 
            data-driven selection tools.
          </p>
          
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
              <div className="flex justify-center mb-2">
                <Code className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-sm text-zinc-300">Measure real onchain contributions</p>
            </div>
            <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
              <div className="flex justify-center mb-2">
                <Award className="h-5 w-5 text-amber-400" />
              </div>
              <p className="text-sm text-zinc-300">Track hackathon performance history</p>
            </div>
            <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
              <div className="flex justify-center mb-2">
                <Layers className="h-5 w-5 text-purple-400" />
              </div>
              <p className="text-sm text-zinc-300">Filter by chain-specific expertise</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}