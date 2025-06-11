"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, X, Plus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/dashboard-layout"
import { ProjectsAPI } from "@/lib/api/projects"
import { useToast } from "@/components/ui/use-toast"

interface ProjectFormData {
  title: string
  description: string
  longDescription: string
  status: "planning" | "active" | "completed" | "on-hold"
  category: string
  startDate: string
  endDate: string
  technologies: string[]
  links: {
    github: string
    demo: string
    documentation: string
  }
}

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newTech, setNewTech] = useState("")
  const { toast } = useToast()
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    longDescription: "",
    status: "planning",
    category: "",
    startDate: "",
    endDate: "",
    technologies: [],
    links: {
      github: "",
      demo: "",
      documentation: "",
    },
  })

  const canEdit = user?.position === "head-coordinator"

  const loadProject = async () => {
    setLoading(true);
    try {
      // Load project details
      const projectResponse = await ProjectsAPI.getProject(Number(params.id));
      console.log(projectResponse.data)
      if (projectResponse.success && projectResponse.data) {
        setFormData({
          title: projectResponse.data.title,
          description: projectResponse.data.description,
          longDescription: projectResponse.data.longDescription,
          status: projectResponse.data.status,
          category: projectResponse.data.category,
          startDate: projectResponse.data.startDate,
          endDate: projectResponse.data.endDate,
          technologies: projectResponse.data.technologies,
          links: {
            github: projectResponse.data.githubUrl,
            demo: projectResponse.data.demoUrl,
            documentation: projectResponse.data.documentationUrl,
          },
        });
      } else {
        toast({
          title: "Error",
          description: projectResponse.error || "Failed to load project",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading project:", error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canEdit) {
      router.push("/dashboard/projects");
      return;
    }

    // Load project data via simulated API call
    loadProject();
  }, [canEdit, router, params.id]);

  const handleAddTechnology = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, newTech.trim()],
      })
      setNewTech("")
    }
  }

  const handleRemoveTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((t) => t !== tech),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      router.push(`/dashboard/projects/${params.id}`)
    }, 2000)
  }

  if (!canEdit) {
    return null
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/projects/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Project</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="longDescription">Detailed Description</Label>
                    <Textarea
                      id="longDescription"
                      value={formData.longDescription || ""}
                      onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technologies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add technology..."
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTechnology())}
                    />
                    <Button type="button" onClick={handleAddTechnology}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTechnology(tech)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="github">GitHub Repository</Label>
                    <Input
                      id="github"
                      type="url"
                      placeholder="https://github.com/..."
                      value={formData.links.github}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          links: { ...formData.links, github: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="demo">Live Demo</Label>
                    <Input
                      id="demo"
                      type="url"
                      placeholder="https://demo.example.com"
                      value={formData.links.demo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          links: { ...formData.links, demo: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="documentation">Documentation</Label>
                    <Input
                      id="documentation"
                      type="url"
                      placeholder="https://docs.example.com"
                      value={formData.links.documentation || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          links: { ...formData.links, documentation: e.target.value },
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                        <SelectItem value="AI/ML">AI/ML</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="DevOps">DevOps</SelectItem>
                        <SelectItem value="Research">Research</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">Expected End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate || ""}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link href={`/dashboard/projects/${params.id}`}>Cancel</Link>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
