// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Github } from "lucide-react";
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
          <p className="font-serif italic text-2xl">FBI</p>
        </Link>
        
        
        {/* Right side elements */}
        <div className="flex flex-row items-center justify-end gap-1.5 flex-1">
        
          
          {/* Theme Toggle */}
          <button 
            className="inline-flex items-center rounded-full border p-1 max-lg:hidden" 
            aria-label="Toggle Theme" 
            data-theme-toggle=""
            onClick={toggleDarkMode}
          >
            {theme === "dark" ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="lucide size-6.5 rounded-full p-1.5 bg-fd-accent text-fd-accent-foreground"
              >
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="lucide size-6.5 rounded-full p-1.5 text-fd-muted-foreground"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            )}
          </button>
        </div>
        
        {/* GitHub and Mobile Menu */}
        <ul className="flex flex-row items-center gap-2">
          <li className="list-none">
            <a 
              href="https://github.com/" 
              rel="noreferrer noopener" 
              target="_blank" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground p-1.5 [&_svg]:size-5 -me-1.5 max-lg:hidden" 
              aria-label="GitHub" 
              data-active="false"
            >
              <Github className="h-5 w-5" />
            </a>
          </li>
          <li className="list-none">
            <a 
              href="https://github.com/" 
              rel="noreferrer noopener" 
              target="_blank" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-fd-accent hover:text-fd-accent-foreground p-1.5 [&_svg]:size-5 -me-1.5 max-lg:hidden" 
              aria-label="GitHub" 
              data-active="false"
            >
              <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.99 0H20.298L13.071 8.26004L21.573 19.5H14.916L9.70202 12.683L3.73597 19.5H0.426L8.15602 10.665L0 0H6.82602L11.539 6.23104L16.99 0ZM15.829 17.52H17.662L5.83002 1.876H3.86297L15.829 17.52Z" fill="#ffffff"></path></svg>
            </a>
          </li>
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
          className="lg:hidden absolute w-full bg-fd-background border-t border-fd-border py-2 px-4 z-50"
        >
          <ul className="space-y-2">
            <li>
              <Link 
                href="https://x.com/" 
                className="block p-2 text-sm text-fd-muted-foreground hover:text-fd-accent-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Twitter
              </Link>
            </li>
            <li>
              <a 
                href="https://github.com/"
                rel="noreferrer noopener"
                target="_blank"
                className="block p-2 text-sm text-fd-muted-foreground hover:text-fd-accent-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
    </div>
  );
}