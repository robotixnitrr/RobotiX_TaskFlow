"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/layout/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ProtectedRoute } from "@/components/ui/protected-route"
import { Github, ExternalLink, Search, Plus, Calendar, Users, Code } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useDebounce } from "@/hooks/use-debounce"
import { AuthService } from "@/lib/auth"
import { ROUTES } from "@/lib/constants"
import { generateInitials } from "@/lib/utils"
import type { ProjectWithTypedMembers } from "@/db/schema"
import Image from "next/image"
import Link from "next/link"

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectWithTypedMembers[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithTypedMembers[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const canManageProjects = AuthService.canManageProjects(user)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, debouncedSearchTerm, statusFilter, categoryFilter])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/projects")

      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }

      const data = await response.json()
      // console.log(data)
      setProjects(data.data.projects)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
      setError(error instanceof Error ? error.message : "Failed to load projects")
    } finally {
      setIsLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    if (debouncedSearchTerm) {
      const query = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.technologies?.some((tech) => tech.toLowerCase().includes(query)),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((project) => project.category === categoryFilter)
    }

    setFilteredProjects(filtered)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      planning: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "in-progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "on-hold": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      robotics: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "ai-ml": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      iot: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      automation: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      research: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      competition: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const formatStatus = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatCategory = (category: string) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("/")
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-destructive">Error Loading Projects</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchProjects} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />

        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent md:leading-normal">
                Our Projects
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Explore the innovative projects developed by our talented team members. From robotics to AI/ML, discover
                the cutting-edge solutions we're building.
              </p>
            </div>

            {user &&
              <Link href="/dashboard/create-project">
                <Button size="lg" className="mt-4 md:mt-0">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Project
                </Button>
              </Link>
            }
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoading}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="robotics">Robotics</SelectItem>
                <SelectItem value="ai-ml">AI/ML</SelectItem>
                <SelectItem value="iot">IoT</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="competition">Competition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{projects.length}</div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {projects?.filter((p) => p.status === "completed").length}
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {projects?.filter((p) => p.status === "in-progress").length}
                </div>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {projects.filter((p) => p.status === "planning").length}
                </div>
                <p className="text-sm text-muted-foreground">Planning</p>
              </CardContent>
            </Card>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Projects Grid */}
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Code className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "No projects available at the moment."}
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="group hover:shadow-xl transition-all duration-300 hover:border-primary/20 overflow-hidden"
                    >
                      {project.imageUrl && (
                        <div className="relative overflow-hidden">
                          <Image
                            src={project.imageUrl || "/placeholder.svg"}
                            alt={project.title}
                            width={400}
                            height={200}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge className={getStatusColor(project.status)}>{formatStatus(project.status)}</Badge>
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge className={getCategoryColor(project.category)}>
                              {formatCategory(project.category)}
                            </Badge>
                          </div>
                        </div>
                      )}

                      <CardHeader className={project.imageUrl ? "" : "pb-4"}>
                        {!project.imageUrl && (
                          <div className="flex gap-2 mb-4">
                            <Badge className={getStatusColor(project.status)}>{formatStatus(project.status)}</Badge>
                            <Badge className={getCategoryColor(project.category)}>
                              {formatCategory(project.category)}
                            </Badge>
                          </div>
                        )}
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">{project.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Team Lead */}
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {generateInitials(project.teamLeadName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            Led by <span className="font-medium text-foreground">{project.teamLeadName}</span>
                          </span>
                        </div>

                        {/* Team Members */}
                        {project.teamMembers.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {project.teamMembers.length} team member{project.teamMembers.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        )}

                        {/* Technologies */}
                        <div>
                          <div className="flex flex-wrap gap-1">
                            {project.technologies?.slice(0, 4).map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {project.technologies && project.technologies.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.technologies && project.technologies.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Started {new Date(project.startDate).toLocaleDateString()}
                            {project.endDate && ` • Ended ${new Date(project.endDate).toLocaleDateString()}`}
                          </span>
                        </div>

                        {/* Links */}
                        <div className="flex gap-2 pt-2">
                          {project.githubUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4 mr-2" />
                                Code
                              </a>
                            </Button>
                          )}
                          {project.demoUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Demo
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Join CTA */}
          <div className="text-center mt-16">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Have a Project Idea?</CardTitle>
                <CardDescription>
                  Join our club and bring your innovative ideas to life with our talented team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {user ? (
                    canManageProjects ? (
                      <Link href="/dashboard/create-project">
                        <Button size="lg">
                          Create New Project
                          <Plus className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href={ROUTES.dashboard}>
                        <Button size="lg">Go to Dashboard</Button>
                      </Link>
                    )
                  ) : (
                    <>
                      <Link href={ROUTES.register}>
                        <Button size="lg">
                          Join RobotiX Club
                          <Users className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/#contact">
                        <Button variant="outline" size="lg">
                          Contact Us
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
