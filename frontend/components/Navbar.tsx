// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Github, User, PlusCircle } from "lucide-react";
import { PartnerWithUs } from "./PartnerWithUs";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="pt-2">
    <div className="sticky top-0 z-50 border shadow-md dark:shadow-zinc-900/20 shadow-zinc-300/30 bg-background/85 backdrop-blur-md rounded-xl mx-2">
      <nav data-orientation="horizontal" className="mx-auto flex h-16 flex-row items-center px-6 lg:px-8" dir="ltr">
        {/* Left side elements */}
        <Link href="/" className="inline-flex items-center gap-2.5 font-semibold">
          <p className="font-serif italic text-2xl">Klyro</p>
        </Link>
        
        
        {/* Right side elements */}
        <div className="flex flex-row items-center justify-end gap-4 flex-1">
          <PartnerWithUs 
            asLink={true} 
            variant="outline"
            size="sm"
            className="px-4 py-1.5 text-sm font-medium rounded-full border-indigo-600/70 text-indigo-400 hover:bg-indigo-950/30 hover:text-indigo-300 hover:border-indigo-500 transition-all duration-200 flex items-center gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Partner with us
          </PartnerWithUs>
        </div>
        
        {/* Mobile Menu */}
        <ul className="flex flex-row items-center gap-2">
          <li className="list-none lg:hidden">
            <button 
              id="mobile-menu-trigger" 
              data-state={isMenuOpen ? "open" : "closed"} 
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu-content"
              onClick={toggleMenu}
              className="data-[state=open]:bg-fd-accent/50 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground p-1.5 [&_svg]:size-5 group -me-2" 
              aria-label="Toggle Menu"
            >
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
                className="lucide size-3 transition-transform duration-300 group-data-[state=open]:rotate-180"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </button>
          </li>
        </ul>
        
      </nav>
      
      {/* Mobile Menu Content (shown when isMenuOpen is true) */}
      {isMenuOpen && (
        <div 
          id="mobile-menu-content"
          className="lg:hidden absolute w-full bg-background border-t border-zinc-200 dark:border-zinc-800 py-2 px-4 shadow-lg z-50"
        >
          <ul className="space-y-2">
            <li>
              <Link 
                href="/organizer/onboarding" 
                className="flex items-center gap-2 p-2 text-sm hover:text-indigo-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <PlusCircle className="h-4 w-4" />
                Partner as Community
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
    </div>
  );
}