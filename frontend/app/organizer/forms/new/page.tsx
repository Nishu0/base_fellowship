"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash, Copy, Save, FileText, ArrowUpRight } from "lucide-react";

type QuestionType = "text" | "email" | "textarea" | "select" | "checkbox";

interface Question {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  options?: string[]; // For select/checkbox questions
}

export default function CreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formUrl, setFormUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    questions: [
      {
        id: "q1",
        label: "Full Name",
        type: "text" as QuestionType,
        required: true
      },
      {
        id: "q2",
        label: "Email Address",
        type: "email" as QuestionType,
        required: true
      },
      {
        id: "q3",
        label: "Contact",
        type: "text" as QuestionType,
        required: true
      },
      {
        id: "q4",
        label: "GitHub",
        type: "text" as QuestionType,
        required: true
      },
      {
        id: "q5",
        label: "Socials (Twitter, Warpcast)",
        type: "text" as QuestionType,
        required: false
      },
      {
        id: "q6",
        label: "Wallet Address",
        type: "text" as QuestionType,
        required: true
      }
    ] as Question[]
  });

  // Add a new question
  const addQuestion = () => {
    const newId = `q${formData.questions.length + 1}`;
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: newId,
          label: "New Question",
          type: "text",
          required: false
        }
      ]
    }));
  };

  // Update question
  const updateQuestion = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    }));
  };

  // Remove question
  const removeQuestion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Here you would normally save to backend
      console.log("Form created:", formData);
      setLoading(false);
      
      // Generate a random URL for demo purposes
      const randomId = Math.random().toString(36).substring(2, 8);
      setFormUrl(`fellowship.xyz/apply/${randomId}`);
    }, 1000);
  };

  // Copy form URL to clipboard
  const copyFormUrl = () => {
    if (formUrl) {
      navigator.clipboard.writeText(`https://${formUrl}`);
      alert("Form URL copied to clipboard!");
    }
  };

  // Preview form in new tab
  const previewForm = () => {
    if (formUrl) {
      window.open(`https://${formUrl}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/organizer">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Create New Form</h1>
          </div>
          
          <div className="flex space-x-2">
            {!formUrl && (
              <Button 
                onClick={handleSubmit}
                disabled={loading || formData.questions.length === 0 || !formData.name}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Publishing..." : "Publish Form"}
              </Button>
            )}
          </div>
        </div>

        {/* Form Published Success Card */}
        {formUrl && (
          <Card className="mb-8 bg-gradient-to-r from-emerald-950 to-indigo-950 border-emerald-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-emerald-400 mb-2">
                    Form Published Successfully!
                  </h3>
                  <p className="text-zinc-300 mb-4">
                    Your form is now live and ready to share. Use the link below:
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="bg-black/50 rounded px-3 py-2 text-emerald-300">
                      https://{formUrl}
                    </code>
                    <Button variant="outline" size="icon" onClick={copyFormUrl} className="h-9 w-9">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" className="border-emerald-700 text-emerald-400" onClick={previewForm}>
                    <FileText className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Link href="/organizer/dashboard">
                    <Button className="bg-emerald-700 hover:bg-emerald-800">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Details at the top */}
        <Card className="mb-6 bg-zinc-950 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle>Form Details</CardTitle>
            <CardDescription className="text-zinc-400">
              Set up the basic information about your form.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Form Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ethereum Developer Program Application"
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Apply to join our 12-week Ethereum developer program..."
                  className="bg-zinc-900 border-zinc-800 h-[38px] min-h-0 py-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Builder - more compact layout */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Form Questions</h2>
            <Button 
              onClick={addQuestion}
              className="bg-indigo-600 hover:bg-indigo-700"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>

          {formData.questions.map((question, index) => (
            <Card key={question.id} className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-4">
                  {/* Question header with number and delete button */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="mr-2 px-2 py-1 bg-zinc-900 rounded-md text-zinc-400 text-sm">Q{index + 1}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeQuestion(question.id)}
                      className="h-8 w-8 text-zinc-400 hover:text-red-400"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Question fields in a single row */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-5">
                      <Label htmlFor={`${question.id}-label`} className="text-xs text-zinc-500 mb-1 block">Question Label</Label>
                      <Input
                        id={`${question.id}-label`}
                        value={question.label}
                        onChange={(e) => updateQuestion(question.id, "label", e.target.value)}
                        placeholder="Enter your question"
                        className="bg-zinc-900 border-zinc-800"
                      />
                    </div>

                    <div className="col-span-4">
                      <Label htmlFor={`${question.id}-type`} className="text-xs text-zinc-500 mb-1 block">Input Type</Label>
                      <select
                        id={`${question.id}-type`}
                        value={question.type}
                        onChange={(e) => updateQuestion(
                          question.id, 
                          "type", 
                          e.target.value as QuestionType
                        )}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm h-10"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="textarea">Text Area</option>
                        <option value="select">Select</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                    </div>

                    <div className="col-span-3 flex items-end h-full pb-2">
                      <label className="flex items-center space-x-2 text-sm text-zinc-400">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(
                            question.id, 
                            "required", 
                            e.target.checked
                          )}
                          className="rounded border-zinc-700 bg-zinc-800"
                        />
                        <span>Required Field</span>
                      </label>
                    </div>
                  </div>

                  {/* Options for select/checkbox types */}
                  {(question.type === "select" || question.type === "checkbox") && (
                    <div className="pt-2">
                      <Label className="text-xs text-zinc-500 mb-1 block">Options (one per line)</Label>
                      <Textarea
                        value={question.options?.join("\n") || ""}
                        onChange={(e) => updateQuestion(
                          question.id, 
                          "options", 
                          e.target.value.split("\n").filter(Boolean)
                        )}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                        className="bg-zinc-900 border-zinc-800 min-h-[80px]"
                      />
                    </div>
                  )}

                  {/* Compact Preview */}
                  <div className="mt-1 bg-zinc-900/50 p-3 rounded-md">
                    <div className="text-xs text-zinc-500 mb-1">Preview:</div>
                    <div className="flex items-center">
                      <Label 
                        htmlFor={`preview-${question.id}`}
                        className={`text-sm mr-3 min-w-[120px] ${question.required ? 'after:content-["*"] after:ml-0.5 after:text-red-400' : ''}`}
                      >
                        {question.label}
                      </Label>
                      
                      <div className="flex-1">
                        {question.type === "text" && (
                          <Input
                            id={`preview-${question.id}`}
                            placeholder={`Enter ${question.label.toLowerCase()}`}
                            className="bg-zinc-800 border-zinc-700 h-8 text-sm"
                            disabled
                          />
                        )}
                        
                        {question.type === "email" && (
                          <Input
                            id={`preview-${question.id}`}
                            type="email"
                            placeholder="example@example.com"
                            className="bg-zinc-800 border-zinc-700 h-8 text-sm"
                            disabled
                          />
                        )}
                        
                        {question.type === "textarea" && (
                          <Textarea
                            id={`preview-${question.id}`}
                            placeholder={`Enter ${question.label.toLowerCase()}`}
                            className="bg-zinc-800 border-zinc-700 min-h-[60px] text-sm"
                            disabled
                          />
                        )}
                        
                        {question.type === "select" && (
                          <select
                            id={`preview-${question.id}`}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-1 text-sm h-8"
                            disabled
                          >
                            <option value="">Select an option</option>
                            {question.options?.map((option, i) => (
                              <option key={i} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                        
                        {question.type === "checkbox" && (
                          <div className="flex flex-wrap gap-3">
                            {question.options?.map((option, i) => (
                              <label key={i} className="flex items-center space-x-2 text-sm">
                                <input
                                  type="checkbox"
                                  className="rounded border-zinc-700 bg-zinc-800"
                                  disabled
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Question Button */}
          <Button 
            onClick={addQuestion}
            className="w-full border-2 border-dashed border-zinc-800 bg-transparent hover:border-zinc-700 hover:bg-zinc-900/30 text-zinc-400 hover:text-zinc-300 py-3"
          >
            <Plus className="mr-2 h-5 w-5" /> Add New Question
          </Button>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={loading || formData.questions.length === 0 || !formData.name}
              className="bg-indigo-600 hover:bg-indigo-700 px-8"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Publishing..." : "Publish Form"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 