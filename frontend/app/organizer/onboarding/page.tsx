"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OrganizerOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
      router.push("/organizer/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create Your Organization</CardTitle>
            <CardDescription className="text-zinc-400">
              Set up your organization profile to start creating forms and selecting builders.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
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
                  placeholder="/images/fbi-logo.png"
                  className="bg-zinc-900 border-zinc-800"
                />
                {formData.logo && (
                  <div className="mt-2 border border-zinc-800 rounded-lg p-4 inline-block">
                    <Image 
                      src={formData.logo} 
                      alt="Organization Logo" 
                      width={100} 
                      height={100}
                      className="rounded-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-logo.png";
                      }}
                    />
                  </div>
                )}
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
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Organization"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 