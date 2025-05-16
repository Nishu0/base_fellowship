"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, X, Github, Wallet, Twitter, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/axiosClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define types for the API responses
type ProgressStatus = "PROCESSING" | "COMPLETED" | "FAILED";

interface ProgressData {
  githubData: ProgressStatus;
  contractsData: ProgressStatus;
  onchainData: ProgressStatus;
}

interface StatusResponse {
  success: boolean;
  data: {
    status: ProgressStatus;
    progress?: ProgressData;
    userData?: any;
  };
}

export default function UserDataForm() {
  const [wallets, setWallets] = useState([{ id: 1, address: "" }]);
  const [githubUsername, setGithubUsername] = useState("");
  const [twitterUsername, setTwitterUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

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

  const startPolling = (username: string) => {
    // Start polling
    const interval = setInterval(async () => {
      try {
        const response = await api.get<StatusResponse>(`/fbi/status/${username}`);
        setStatusData(response.data);
        
        // If completed or failed, stop polling
        if (response.data.data.status === "COMPLETED") {
          clearInterval(interval);
          // Wait 2 seconds before redirecting to give user time to see completion
          setTimeout(() => {
            window.location.href = `/${username}`;
          }, 2000);
        } else if (response.data.data.status === "FAILED") {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error polling status:", error);
        // Continue polling even on error
      }
    }, 3000); // Poll every 3 seconds
    
    setPollingInterval(interval);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare request payload
      const payload = {
        githubUsername,
        addresses: wallets.map(w => w.address).filter(a => a.trim() !== "")
      };
      
      // Make API request to analyze user
      await api.post("/fbi/analyze-user", payload);
      
      // Open modal and start polling
      setIsModalOpen(true);
      startPolling(githubUsername);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      //alert("An error occurred while analyzing your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render status icons
  const getStatusIcon = (status: ProgressStatus) => {
    switch (status) {
      case "PROCESSING":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "FAILED":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
  };

  // Calculate overall progress percentage
  const calculateProgress = () => {
    if (!statusData?.data?.progress) return 0;
    
    const progressItems = Object.values(statusData.data.progress);
    const completedItems = progressItems.filter(item => item === "COMPLETED").length;
    return Math.floor((completedItems / progressItems.length) * 100);
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="w-full max-w-2xl mx-auto p-6 md:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Create your Klyro Profile</h1>
          <p className="text-zinc-400">
          Link your data and get a shareable builder profile.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* GitHub Username */}
            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github size={16} className="text-zinc-400" />
                GitHub Username Only <span className="text-red-500">*</span>
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
                    required={index === 0} // Only first wallet is required
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : "Create My Profile"}
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

      {/* Progress Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Building your profile</DialogTitle>
            <DialogDescription className="text-zinc-400">
              We're analyzing your GitHub data and on-chain activity
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall progress</span>
                <span>{calculateProgress()}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
            
            {/* Tasks progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(statusData?.data?.progress?.githubData || "PROCESSING")}
                  <span>Loading GitHub Data</span>
                </div>
                <span className="text-xs text-zinc-500">
                  {statusData?.data?.progress?.githubData === "COMPLETED" ? "Done" : "In progress"}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(statusData?.data?.progress?.contractsData || "PROCESSING")}
                  <span>Analyzing Contract Deployments</span>
                </div>
                <span className="text-xs text-zinc-500">
                  {statusData?.data?.progress?.contractsData === "COMPLETED" ? "Done" : "In progress"}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(statusData?.data?.progress?.onchainData || "PROCESSING")}
                  <span>Analyzing On-chain Activity</span>
                </div>
                <span className="text-xs text-zinc-500">
                  {statusData?.data?.progress?.onchainData === "COMPLETED" ? "Done" : "In progress"}
                </span>
              </div>
            </div>
            
            {/* Status message */}
            {statusData?.data?.status === "FAILED" && (
              <div className="mt-4 p-3 bg-red-900/30 text-red-300 border border-red-900 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Analysis failed</span>
                </div>
                <p className="mt-1 text-sm">
                  There was an issue analyzing your profile. This could be due to API limits or server issues. Please try again later.
                </p>
              </div>
            )}
            
            {statusData?.data?.status === "COMPLETED" && (
              <div className="mt-4 p-3 bg-green-900/30 text-green-300 border border-green-900 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Analysis complete! Redirecting to your profile...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
