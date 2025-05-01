"use client";

import { Award, Badge, Layers, Search, Zap } from "lucide-react";

export default function How() {
    return (
        <section id="how-it-works" className="border-b border-zinc-800 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-[800px] text-center">
            <Badge className="mb-4 rounded-full border-zinc-800 bg-zinc-900 px-4 py-1 text-white">How It Works</Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Discover Top Blockchain Talent</h2>
            <p className="mb-12 text-zinc-400">
              Our platform makes it easy to find and evaluate the best builders, designers, and content creators in the
              blockchain space.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                <Search className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Search</h3>
              <p className="text-zinc-400">Find talent based on skills, experience, and onchain credentials</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                <Layers className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Analyze</h3>
              <p className="text-zinc-400">Review comprehensive profiles with aggregated data from multiple sources</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                <Award className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Select</h3>
              <p className="text-zinc-400">Choose the best candidates for your hackathon based on verifiable metrics</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                <Zap className="h-8 w-8 text-rose-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Connect</h3>
              <p className="text-zinc-400">Engage with selected talent and bring them into your hackathon ecosystem</p>
            </div>
          </div>
        </div>
      </section>
    )
}