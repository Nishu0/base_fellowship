"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { toPng } from "html-to-image";

export default function MediaKitPage() {
  const logoTextRef = useRef<HTMLDivElement>(null);
  const [primaryColor, setPrimaryColor] = useState("#FFFFFF");
  const [secondaryColor, setPrimaryColorDark] = useState("#6366F1");
  
  const downloadLogoText = async () => {
    if (logoTextRef.current) {
      try {
        const dataUrl = await toPng(logoTextRef.current, { 
          backgroundColor: 'transparent',
          quality: 1,
          pixelRatio: 3
        });
        
        const link = document.createElement('a');
        link.download = 'klyro-logo-text.png';
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error generating image', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800/80 rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6">Media Kit</h1>
          
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Klyro Logo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-zinc-900 p-6 rounded-lg flex flex-col items-center">
                  <div className="w-52 h-52 relative mb-4">
                    <Image 
                      src="/Logo.png"
                      alt="Klyro Logo"
                      width={208}
                      height={208}
                      className="object-contain"
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/Logo.png';
                      link.download = 'klyro-logo.png';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="mt-2 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Logo
                  </Button>
                </div>
                
                <div className="bg-zinc-900 p-6 rounded-lg flex flex-col items-center">
                  <div 
                    ref={logoTextRef} 
                    className="w-52 h-52 flex items-center justify-center"
                  >
                    <span className="font-serif text-6xl font-bold italic tracking-tight md:text-7xl lg:text-8xl text-white">
                    Klyro
                    </span>
                  </div>
                  <Button 
                    onClick={downloadLogoText} 
                    className="mt-2 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Text Logo
                  </Button>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Brand Guidelines</h2>
              <div className="bg-zinc-900 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Logo Usage</h3>
                <ul className="list-disc pl-5 space-y-2 text-zinc-300">
                  <li>Keep a minimum clear space around the logo equal to the height of the 'k' in the wordmark</li>
                  <li>Do not stretch, distort, or alter the proportions of the logo</li>
                  <li>Do not change the colors of the logo without approval</li>
                  <li>Do not add effects to the logo (shadows, glows, etc.)</li>
                  <li>Always ensure the logo is clearly visible against its background</li>
                </ul>
                
                <h3 className="font-semibold text-lg mt-6 mb-3">Typography</h3>
                <p className="text-zinc-300 mb-3">Klyro uses the Inter font family for all communications.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="bg-zinc-950 p-4 rounded-md">
                    <p className="font-bold mb-1">Serif Bold</p>
                    <p className="text-zinc-400 text-sm">For headings and emphasis</p>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded-md">
                    <p className="font-normal mb-1">Serif Regular</p>
                    <p className="text-zinc-400 text-sm">For body text and general content</p>
                  </div>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4 text-white">Contact Information</h2>
              <p className="text-zinc-300">
                For media inquiries or additional brand assets, please contact us at <span className="text-indigo-400">0xklyro@gmail.com</span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 