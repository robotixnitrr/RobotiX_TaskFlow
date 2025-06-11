"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Github,
  Calendar,
  Users,
  Trash2,
  Edit,
  Eye,
  FileText,
  DollarSign,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"

import { useProjects } from "@/hooks/use-projects"
import { ProjectsAPI } from "@/lib/api/projects"
import { useDebounce } from "@/hooks/use-debounce"

export default function ProjectsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("updatedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)

  const debouncedSearch = useDebounce(searchQuery, 300)

  // Check if user can manage projects
  const canManageProjects = user?.position === "head-coordinator" || user?.position === "overall-cordinator"

  const { projects, loading, error, pagination, refetch, updateParams } = useProjects({
    initialParams: {
      page: currentPage,
      limit: 12,
      search: debouncedSearch || undefined,
      status: (statusFilter as "in-progress" | "completed" | "planning" | "on-hold") || undefined,
      category: (categoryFilter as "robotics" | "ai-ml" | "iot" | "automation" | "research" | "competition") || undefined,
      sortBy: sortBy as any,
      sortOrder,
    },
  })

  // Update search parameters
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value)
      setCurrentPage(1)
      updateParams({
        page: 1,
        search: value || undefined,
      })
    },
    [updateParams],
  )

  const handleFilterChange = useCallback(
    (type: string, value: string) => {
      setCurrentPage(1)
      if (type === "status") {
        setStatusFilter(value)
        updateParams({ page: 1, status: (value as "in-progress" | "completed" | "planning" | "on-hold") || undefined })
      } else if (type === "category") {
        setCategoryFilter(value)
        updateParams({ page: 1, category: (value as "robotics" | "ai-ml" | "iot" | "automation" | "research" | "competition") || undefined })
      }
    },
    [updateParams],
  )

  const handleSortChange = useCallback(
    (field: string) => {
      const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc"
      setSortBy(field)
      setSortOrder(newOrder)
      updateParams({ sortBy: field as any, sortOrder: newOrder })
    },
    [sortBy, sortOrder, updateParams],
  )

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)
      updateParams({ page })
    },
    [updateParams],
  )

  // Handle project deletion
  const handleDeleteProject = async (projectId: number) => {
    try {
      const response = await ProjectsAPI.deleteProject(projectId)

      if (response.success) {
        toast({
          title: "Success",
          description: "Project deleted successfully",
        })
        refetch()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete project",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again later.",
        variant: "destructive",
      })
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default"
      case "in-progress":
        return "secondary"
      case "planning":
        return "outline"
      case "on-hold":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  // Get unique categories and statuses for filters
  const categories = ["robotics", "ai-ml", "iot", "automation", "research", "competition"]
  const statuses = ["planning", "in-progress", "completed", "on-hold"]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage and explore all robotics club projects
              {pagination && ` (${pagination.total} total)`}
            </p>
          </div>

          {canManageProjects && (
            <Link href="/dashboard/projects/create">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Project
              </Button>
            </Link>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {(statusFilter || categoryFilter) && (
                  <Badge variant="secondary" className="ml-1">
                    {[statusFilter, categoryFilter].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleFilterChange("status", "")}>All Statuses</DropdownMenuItem>
              {statuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleFilterChange("status", status)}
                  className="capitalize"
                >
                  {status.replace(/-/g, " ")}
                  {statusFilter === status && " ✓"}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleFilterChange("category", "")}>All Categories</DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => handleFilterChange("category", category)}
                  className="capitalize"
                >
                  {category.replace(/-/g, " ")}
                  {categoryFilter === category && " ✓"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleSortChange("title")}>
                Sort by Title {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("startDate")}>
                Sort by Start Date {sortBy === "startDate" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("updatedAt")}>
                Sort by Updated {sortBy === "updatedAt" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("priority")}>
                Sort by Priority {sortBy === "priority" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("progress")}>
                Sort by Progress {sortBy === "progress" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <ExternalLink className="h-4 w-4" />
                <span>{error}</span>
              </div>
              <Button onClick={refetch} variant="outline" size="sm" className="mt-2">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
          </TabsList>

          {["all", "in-progress", "completed", "planning"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 rounded-b-none" />
                      <CardHeader className="pb-2">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Skeleton className="h-20" />
                        <div className="flex flex-wrap gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Filter className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchQuery || statusFilter || categoryFilter
                      ? "Try adjusting your search or filter criteria."
                      : "Get started by creating a new project."}
                  </p>
                  {canManageProjects && !searchQuery && !statusFilter && !categoryFilter && (
                    <Link href="/dashboard/projects/create" className="mt-6">
                      <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Create Project
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {projects
                      .filter((project) => tab === "all" || project.status === tab)
                      .map((project) => (
                        <Card key={project.id} className="overflow-hidden flex flex-col">
                          <div className="relative h-48 bg-muted">
                            {project.imageUrl ? (
                              <img
                                src={project.imageUrl || "/placeholder.svg"}
                                alt={project.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                <span className="text-2xl font-bold text-muted-foreground/40">
                                  {project.title.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="absolute top-4 left-4">
                              {project.isFeatured && (
                                <Badge variant="default" className="bg-yellow-500 text-yellow-50">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <div className="absolute top-4 right-4 flex gap-2">
                              <Badge variant={getStatusBadgeVariant(project.status)} className="capitalize">
                                {project.status.replace(/-/g, " ")}
                              </Badge>
                              <Badge
                                variant={getPriorityBadgeVariant(project.priority || "medium")}
                                className="capitalize"
                              >
                                {project.priority || "medium"}
                              </Badge>
                            </div>
                          </div>

                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                                <CardDescription className="capitalize">
                                  {project.category.replace(/-/g, " ")}
                                </CardDescription>
                              </div>

                              {canManageProjects && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                      >
                                        <circle cx="12" cy="12" r="1" />
                                        <circle cx="12" cy="5" r="1" />
                                        <circle cx="12" cy="19" r="1" />
                                      </svg>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link href={`/dashboard/projects/${project.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href={`/dashboard/projects/${project.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the project and
                                            all associated data.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteProject(project.id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="flex-1 space-y-4">
                            <p className="line-clamp-3 text-sm text-muted-foreground">{project.description}</p>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{project.progressPercentage}%</span>
                              </div>
                              <Progress value={project.progressPercentage} className="h-2" />
                            </div>

                            {/* Technologies */}
                            <div className="flex flex-wrap gap-2">
                              {project.technologies && project.technologies.slice(0, 3).map((tech, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {project.technologies && project.technologies.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.technologies.length - 3} more
                                </Badge>
                              )}
                            </div>

                            {/* Tags */}
                            {project.tags && project.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {project.tags.slice(0, 2).map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                                {project.tags.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{project.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Project Info */}
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDate(project.startDate)}
                                  {project.endDate ? ` - ${formatDate(project.endDate)}` : " - Present"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>
                                  {project.teamMembers && Array.isArray(project.teamMembers)
                                    ? `${project.teamMembers.length + 1} members`
                                    : "1 member"}
                                </span>
                              </div>

                              {project.budget && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>${Number(project.budget).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>

                          <CardFooter className="flex justify-between pt-0">
                            <Link href={`/dashboard/projects/${project.id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>

                            <div className="flex gap-2">
                              {project.githubUrl && (
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                  <Github className="h-4 w-4" />
                                  <span className="sr-only">GitHub</span>
                                </a>
                              )}

                              {project.demoUrl && (
                                <a
                                  href={project.demoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  <span className="sr-only">Demo</span>
                                </a>
                              )}

                              {project.documentationUrl && (
                                <a
                                  href={project.documentationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">Documentation</span>
                                </a>
                              )}
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                      >
                        Previous
                      </Button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const page = i + 1
                          return (
                            <Button
                              key={page}
                              variant={pagination.page === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
