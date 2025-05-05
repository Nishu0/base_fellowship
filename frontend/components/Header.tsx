import { Badge } from "./ui/badge"
import { AnimatedGridPattern } from "./grid";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link"


export default function Header() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
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
      <div className="container relative z-10 mx-auto flex flex-col items-center justify-center space-y-8 px-4 text-center max-w-4xl">
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
          <Link href="/profile/sample">
            <Button className="rounded-full bg-white text-black hover:bg-zinc-200 px-8 py-6 text-lg font-medium">
              Get Started
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button className="rounded-full bg-blue-600 text-white hover:bg-blue-700 px-8 py-6 text-lg font-medium">
              View Leaderboard
            </Button>
          </Link>
          <Link href="/organizer">
            <Button
              variant="outline"
              className="rounded-full border-zinc-800 bg-zinc-950/50 backdrop-blur-sm text-white hover:bg-zinc-900 hover:text-white px-8 py-6 text-lg font-medium"
            >
              Organizer View
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        <span className="text-zinc-500 text-sm mb-2">Scroll</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-500"
        >
          <path d="M12 5v14"></path>
          <path d="m19 12-7 7-7-7"></path>
        </svg>
      </div>
    </section>
  );
}
