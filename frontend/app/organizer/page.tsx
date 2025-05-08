"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, FileText, MessageSquare, Users, Clock, Edit, Trash, ExternalLink, Download, Mail } from "lucide-react";

// Sample organization data
const organization = {
  name: "FBI (Farcaster Builders India)",
  description: "A collective of Indian founders, builders, and operators obsessed with building on top and accelerating the Superchain.",
  logo: "https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/1eafd763-e8a0-451e-8137-ef4f7d2be4ed/00711/w=256,quality=90,fit=scale-down"
};

// Sample forms data
const sampleForms = [
  {
    id: "1",
    name: "FBI Based Fellowship Application 2025",
    description: "(Online + IRL) program in Dharamshala to ship high value ecosystem public goods.",
    createdAt: "2025-07-10",
    submissions: 42,
    status: "active"
  },
  {
    id: "2",
    name: "FBI Based Fellowship Application 2024",
    description: "(Online + IRL) program in Dharamshala to ship high value ecosystem public goods.",
    createdAt: "2024-07-15",
    submissions: 87,
    status: "closed"
  },
  {
    id: "3",
    name: "Onchain AI Fellowship Application",
    description: "Online programs for 2 weeks to ship ai agents projects. And presenting at the ETHIndia 2025.",
    createdAt: "2024-06-28",
    submissions: 104,
    status: "closed"
  }
];

// Sample submissions data
const sampleSubmissions = [
  {
    id: "1",
    formId: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    github: "alexjdev",
    walletAddress: "0x1234...5678",
    submittedAt: "2024-07-18T14:32:00Z",
    status: "selected"
  },
  {
    id: "2",
    formId: "1",
    name: "Sophia Chen",
    email: "sophia@example.com",
    github: "sophiacode",
    walletAddress: "0x8765...4321", 
    submittedAt: "2024-07-17T09:15:00Z",
    status: "pending"
  },
  {
    id: "3",
    formId: "1",
    name: "Marcus Williams",
    email: "marcus@example.com",
    github: "marcusw",
    walletAddress: "0x4567...8901",
    submittedAt: "2024-07-16T16:45:00Z",
    status: "selected"
  },
  {
    id: "4",
    formId: "2",
    name: "Emma Taylor",
    email: "emma@example.com",
    github: "emmadev",
    walletAddress: "0x6789...0123",
    submittedAt: "2024-07-15T11:22:00Z",
    status: "pending"
  }
];

export default function OrganizerDashboard() {
  const [searchForms, setSearchForms] = useState("");
  const [searchSubmissions, setSearchSubmissions] = useState("");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);

  // Filter forms based on search
  const filteredForms = sampleForms.filter(form => 
    form.name.toLowerCase().includes(searchForms.toLowerCase()) || 
    form.description.toLowerCase().includes(searchForms.toLowerCase())
  );

  // Sort forms - active forms first, then by date (most recent first)
  const sortedForms = [...filteredForms].sort((a, b) => {
    // First prioritize by status (active before closed)
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    
    // Then sort by date (most recent first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Filter submissions based on search and selected form
  const filteredSubmissions = sampleSubmissions.filter(sub => 
    (selectedFormId ? sub.formId === selectedFormId : true) &&
    (searchSubmissions ? 
      sub.name.toLowerCase().includes(searchSubmissions.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchSubmissions.toLowerCase()) ||
      sub.github.toLowerCase().includes(searchSubmissions.toLowerCase())
      : true
    )
  );

  // Toggle submission selection
  const toggleSubmissionSelection = (id: string) => {
    setSelectedSubmissions(prev => 
      prev.includes(id) ? prev.filter(subId => subId !== id) : [...prev, id]
    );
  };

  // Select all submissions
  const selectAllSubmissions = () => {
    if (selectedSubmissions.length === filteredSubmissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(filteredSubmissions.map(sub => sub.id));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image 
              src={organization.logo}
              alt={organization.name}
              width={40}
              height={40}
              className="rounded-md"
            />
            <div>
              <h1 className="font-bold text-xl">{organization.name}</h1>
              <p className="text-zinc-400 text-sm">{organization.description}</p>
            </div>
          </div>
          <Link href="/organizer">
            <Button variant="outline" className="border-zinc-700">
              Edit Organization
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="forms" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-zinc-900">
              <TabsTrigger value="forms" className="data-[state=active]:bg-indigo-600">Forms</TabsTrigger>
              <TabsTrigger value="submissions" className="data-[state=active]:bg-indigo-600">Submissions</TabsTrigger>
            </TabsList>
            <div className="flex space-x-2">
              <Link href="/organizer/forms/new">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="mr-1 h-4 w-4" /> Create Form
                </Button>
              </Link>
            </div>
          </div>

          {/* Forms Tab */}
          <TabsContent value="forms" className="mt-6 space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search forms..."
                  value={searchForms}
                  onChange={(e) => setSearchForms(e.target.value)}
                  className="pl-10 bg-zinc-900 border-zinc-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedForms.map(form => (
                <Card key={form.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all flex flex-col h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold">{form.name}</CardTitle>
                      <div className={`px-2 py-1 rounded text-xs ${form.status === 'active' ? 'bg-green-900/40 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        {form.status === 'active' ? 'Active' : 'Closed'}
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">{form.description}</p>
                  </CardHeader>
                  <CardContent className="flex-grow"></CardContent>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-zinc-500" />
                          <span className="text-zinc-400">{form.submissions}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-zinc-500" />
                          <span className="text-zinc-400">{form.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Link href={`/organizer/form/${form.id}`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-red-400">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {sortedForms.length === 0 && (
              <div className="text-center py-10">
                <p className="text-zinc-500">No forms found. Create your first form!</p>
                <Link href="/organizer/forms/new" className="mt-4 inline-block">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" /> Create Form
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="mt-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search submissions..."
                  value={searchSubmissions}
                  onChange={(e) => setSearchSubmissions(e.target.value)}
                  className="pl-10 bg-zinc-900 border-zinc-800"
                />
              </div>
              <div className="flex space-x-2">
                <select
                  value={selectedFormId || ""}
                  onChange={(e) => setSelectedFormId(e.target.value || null)}
                  className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Forms</option>
                  {sampleForms.map(form => (
                    <option key={form.id} value={form.id}>{form.name}</option>
                  ))}
                </select>
                {selectedSubmissions.length > 0 && (
                  <>
                    <Button variant="outline" className="border-zinc-700">
                      <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Mail className="mr-2 h-4 w-4" /> Contact
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left p-4">
                        <input 
                          type="checkbox" 
                          onChange={selectAllSubmissions}
                          checked={selectedSubmissions.length === filteredSubmissions.length && filteredSubmissions.length > 0}
                          className="rounded border-zinc-700 bg-zinc-800"
                        />
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-400">Name</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-400">GitHub</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-400 hidden md:table-cell">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-400 hidden lg:table-cell">Wallet</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-400 hidden lg:table-cell">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-400">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-zinc-400"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map(submission => {
                      const isSelected = selectedSubmissions.includes(submission.id);
                      return (
                        <tr 
                          key={submission.id} 
                          className={`border-b border-zinc-800 hover:bg-zinc-800/50 ${isSelected ? 'bg-zinc-800/30' : ''}`}
                        >
                          <td className="p-4">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleSubmissionSelection(submission.id)}
                              className="rounded border-zinc-700 bg-zinc-800"
                            />
                          </td>
                          <td className="p-4 font-medium">{submission.name}</td>
                          <td className="p-4 text-zinc-300">{submission.github}</td>
                          <td className="p-4 text-zinc-300 hidden md:table-cell">{submission.email}</td>
                          <td className="p-4 text-zinc-300 hidden lg:table-cell">
                            {submission.walletAddress.substring(0, 6)}...
                            {submission.walletAddress.substring(submission.walletAddress.length - 4)}
                          </td>
                          <td className="p-4 text-zinc-300 hidden lg:table-cell">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              submission.status === 'selected' 
                                ? 'bg-green-900/40 text-green-400' 
                                : 'bg-yellow-900/40 text-yellow-400'
                            }`}>
                              {submission.status === 'selected' ? 'Selected' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-zinc-400 hover:text-white"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-10">
                <p className="text-zinc-500">No submissions found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 