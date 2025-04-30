import { AnimatedGridPattern } from "@/components/grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center relative overflow-hidden bg-black min-h-screen">
      {/* Multiple layered backgrounds for depth */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      {/* Animated grid pattern */}
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.15}
        duration={4}
        repeatDelay={0.5}
        className={cn(
          "absolute inset-0 z-0",
          "[mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
        )}
      />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-0 opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 z-0"></div>
      
      {/* Hero content */}
      <div className="container relative z-10 mx-auto flex flex-col items-center justify-center space-y-8 py-6 px-4 text-center max-w-4xl">
        <Badge className="rounded-full border-zinc-800 bg-zinc-900/70 backdrop-blur-sm px-4 py-1 text-white">
          Onchain Hackathon Selection Platform
        </Badge>
        
        <div className="space-y-4">
          <h1 className="font-serif text-6xl font-bold italic tracking-tight md:text-7xl lg:text-8xl text-white">FBI</h1>
          <p className="text-xl text-zinc-400 md:text-2xl">/ Find Builders Intelligently /</p>
        </div>
        
        <p className="max-w-[600px] text-zinc-400 text-lg">
          The ultimate platform for hackathon organizers to discover and evaluate top blockchain talent based on
          verifiable onchain credentials and contributions.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Link href="/get-started">
            <Button className="rounded-full bg-white text-black hover:bg-zinc-200 px-8 py-6 text-lg font-medium">
              Get Started
            </Button>
          </Link>
          <Link href="/learn-more">
            <Button
              variant="outline"
              className="rounded-full border-zinc-800 bg-zinc-950/50 backdrop-blur-sm text-white hover:bg-zinc-900 hover:text-white px-8 py-6 text-lg font-medium"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
