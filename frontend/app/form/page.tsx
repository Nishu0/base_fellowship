"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, X, Github, Wallet, Twitter } from "lucide-react";
import Link from "next/link";

export default function UserDataForm() {
  const [wallets, setWallets] = useState([{ id: 1, address: "" }]);
  const [githubUsername, setGithubUsername] = useState("");
  const [twitterUsername, setTwitterUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addWallet = () => {
    if (wallets.length < 3) {
      setWallets([...wallets, { id: Date.now(), address: "" }]);
    }
  };

  const removeWallet = (id: number) => {
    if (wallets.length > 1) {
      setWallets(wallets.filter(wallet => wallet.id !== id));
    }
  };

  const updateWallet = (id: number, address: string) => {
    setWallets(wallets.map(wallet => 
      wallet.id === id ? { ...wallet, address } : wallet
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with delay
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Form submitted:", {
        githubUsername,
        wallets: wallets.map(w => w.address),
        twitterUsername
      });
      
      // Redirect to profile page with the username
      window.location.href = `/user/${githubUsername}`;
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="w-full max-w-2xl mx-auto p-6 md:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Connect Your Accounts</h1>
          <p className="text-zinc-400">
            Link your accounts to generate your on-chain builder profile
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* GitHub Username */}
            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github size={16} className="text-zinc-400" />
                GitHub Username <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="github"
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="Enter your GitHub username"
                  className="bg-zinc-900/70 border-zinc-800 h-11 pl-3 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Wallet Addresses */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Wallet size={16} className="text-zinc-400" />
                Wallet Addresses <span className="text-red-500">*</span>
              </Label>
              
              {wallets.map((wallet, index) => (
                <div key={wallet.id} className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={wallet.address}
                    onChange={(e) => updateWallet(wallet.id, e.target.value)}
                    placeholder={`Wallet address ${index + 1}`}
                    className="bg-zinc-900/70 border-zinc-800 h-11 pl-3 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {wallets.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeWallet(wallet.id)}
                      className="h-10 w-10 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
              
              {wallets.length < 3 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addWallet}
                  className="text-blue-400 hover:text-blue-300 hover:bg-zinc-900 mt-2"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Add Another Wallet Address
                </Button>
              )}
            </div>

            {/* Twitter Username */}
            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.99 0H20.298L13.071 8.26004L21.573 19.5H14.916L9.70202 12.683L3.73597 19.5H0.426L8.15602 10.665L0 0H6.82602L11.539 6.23104L16.99 0ZM15.829 17.52H17.662L5.83002 1.876H3.86297L15.829 17.52Z" fill="#ffffff"></path></svg>
                Twitter Username
              </Label>
              <div className="relative">
                <Input
                  id="twitter"
                  type="text"
                  value={twitterUsername}
                  onChange={(e) => setTwitterUsername(e.target.value)}
                  placeholder="Enter your Twitter username"
                  className="bg-zinc-900/70 border-zinc-800 h-11 pl-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Your Profile..." : "Generate My Builder Profile"}
              </Button>
            </div>

            <div className="text-center text-sm text-zinc-500 pt-2">
              By connecting your accounts, you agree to our{" "}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                Terms of Service
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
