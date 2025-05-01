"use client";

import { Github, Twitter, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Separator } from "./ui/separator";

export default function Footer() {
  return (
    <footer className="bg-black">
      <Separator />
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and description */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <h2 className="font-serif italic text-2xl text-white">FBI</h2>
            </Link>
            <p className="mt-4 text-zinc-400 max-w-md">
              Find Builders Intelligently - The ultimate onchain platform for
              evaluating blockchain talent based on verifiable credentials and contributions.
            </p>
            <div className="flex items-center mt-6 space-x-4">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-900 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Github className="h-6 w-6 text-white" />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-900 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.99 0H20.298L13.071 8.26004L21.573 19.5H14.916L9.70202 12.683L3.73597 19.5H0.426L8.15602 10.665L0 0H6.82602L11.539 6.23104L16.99 0ZM15.829 17.52H17.662L5.83002 1.876H3.86297L15.829 17.52Z" fill="#ffffff"></path></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-medium mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center">
                  About Us
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center">
                  Features
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="#working" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center">
                  Working
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center">
                  Documentation
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-medium mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center">
                  Blog
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center">
                  Case Studies
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center">
                  Support
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/" className="text-zinc-400 hover:text-white transition-colors inline-flex items-center">
                  Contact
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} FBI - Find Builders Intelligently. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 
