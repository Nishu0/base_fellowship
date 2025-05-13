"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";

export default function OrganizerOnboarding() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    website: "",
    contact: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Normally would save to backend here
      console.log("Organization created:", formData);
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center py-12">
        <div className="max-w-2xl mx-auto px-4 w-full">
          <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-8 backdrop-blur-sm text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-4">Application Submitted</h1>
            <p className="text-zinc-300 mb-3">
              Thank you for submitting your organization information.
            </p>
            <p className="text-zinc-400 mb-6">
              Your application is now pending background verification. Our team will review your information and contact you at {formData.contact} with next steps.
            </p>
            <div className="bg-zinc-900/50 rounded-lg p-4 text-left mb-6 border border-zinc-800">
              <h3 className="font-medium mb-2 text-zinc-300">What happens next?</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>• Our team will review your organization details</li>
                <li>• We may request additional verification documents</li>
                <li>• Once approved, you'll receive full access to the organizer dashboard</li>
                <li>• This process typically takes 1-3 business days</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.location.href = "/"}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-4 w-full">
        <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Create Your Organization</h1>
            <p className="text-zinc-400">
              Set up your organization profile to start creating forms and selecting builders.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="FBI (Fellowship Builder Initiative)"
                required
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A program to identify and support talented blockchain developers"
                required
                className="bg-zinc-900 border-zinc-800 min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                placeholder="https://yourwebsite.com/logo.png"
                className="bg-zinc-900 border-zinc-800"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Provide a direct link to your logo image (e.g., https://example.com/logo.png)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://fbi.fellowship.xyz"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Email</Label>
              <Input
                id="contact"
                name="contact"
                type="email"
                value={formData.contact}
                onChange={handleChange}
                placeholder="admin@fellowship.xyz"
                required
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 