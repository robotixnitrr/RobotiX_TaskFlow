"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { MilestoneManager } from "@/components/projects/milestone-manager"
import { TeamMemberManager } from "@/components/projects/team-member-manager"
import { useAuth } from "@/hooks/use-auth"
import { ProjectsAPI } from "@/lib/api/projects"
import { MilestonesAPI } from "@/lib/api/milestones"
import { TeamMembersAPI } from "@/lib/api/team-members"
import { Pencil, Calendar, Users, FileText, Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { ProjectWithDetails } from "@/db"

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [project, setProject] = useState<any>()
  const [milestones, setMilestones] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Check if the current user is the team lead
  const isTeamLead = user?.id === project?.teamLeadId

  // Check if the user has edit permissions (team lead or admin)
  const canEdit = isTeamLead || ["head-coordinator", "overall-coordinator"].includes(user?.position || "")

  useEffect(() => {
    if (id) {
      loadProject()
    }
  }, [id])

  const loadProject = async () => {
    setLoading(true)
    try {
      // Load project details
      const projectResponse = await ProjectsAPI.getProject(Number(id))
      if (projectResponse.success && projectResponse.data) {
        setProject(projectResponse.data)
      } else {
        toast({
          title: "Error",
          description: projectResponse.error || "Failed to load project",
          variant: "destructive",
        })
      }

      // Load milestones
      const milestonesResponse = await MilestonesAPI.getMilestones(Number(id))
      if (milestonesResponse.success && milestonesResponse.data) {
        setMilestones(milestonesResponse.data)
      }

      // Load team members
      const membersResponse = await TeamMembersAPI.getTeamMembers(Number(id))
      if (membersResponse.success && membersResponse.data) {
        setMembers(membersResponse.data)
      }
    } catch (error) {
      console.error("Error loading project:", error)
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <p className="text-muted-foreground mt-2">
          The project you are looking for does not exist or you don't have access to it.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/projects">Back to Projects</Link>
        </Button>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project?.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={project?.status === "completed" ? "default" : "secondary"}>{project?.status}</Badge>
              <Badge variant="outline">{project?.category}</Badge>
              <Badge
                variant="outline"
                className={
                  project?.priority === "high"
                    ? "border-red-500 text-red-500"
                    : project?.priority === "medium"
                      ? "border-yellow-500 text-yellow-500"
                      : "border-green-500 text-green-500"
                }
              >
                {project?.priority} priority
              </Badge>
            </div>
          </div>
          {canEdit && (
            <Button asChild>
              <Link href={`/dashboard/projects/${id}/edit`}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Project
              </Link>
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="files">Files & Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="mt-1">{project?.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                      <p className="mt-1">{format(new Date(project?.startDate), "MMMM d, yyyy")}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                      <p className="mt-1">
                        {project?.endDate ? format(new Date(project?.endDate), "MMMM d, yyyy") : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Team Lead</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={project?.teamLead?.avatarUrl || ""} alt={project?.teamLeadName} />
                          <AvatarFallback>
                            {project?.teamLeadName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{project?.teamLeadName}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
                      <p className="mt-1">{project?.budget ? `$${project?.budget.toLocaleString()}` : "Not specified"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Completion</span>
                      <span className="font-medium">{project?.progressPercentage}%</span>
                    </div>
                    <Progress value={project?.progressPercentage} className="h-2" />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Milestones</h3>
                    <div className="space-y-2">
                      {milestones.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No milestones defined</p>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Completed</span>
                            <span>
                              {milestones.filter((m) => m.completed).length} / {milestones.length}
                            </span>
                          </div>
                          <Progress
                            value={(milestones.filter((m) => m.completed).length / milestones.length) * 100}
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {project?.technologies?.map((tech: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {project?.tags && project?.tags.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {project?.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Links & Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {project?.githubUrl && (
                    <a
                      href={project?.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-md border hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>GitHub Repository</span>
                    </a>
                  )}
                  {project?.repositoryUrl && (
                    <a
                      href={project?.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-md border hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Repository</span>
                    </a>
                  )}
                  {project?.demoUrl && (
                    <a
                      href={project?.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-md border hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Live Demo</span>
                    </a>
                  )}
                  {project?.documentationUrl && (
                    <a
                      href={project?.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-md border hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Documentation</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project Timeline
                </CardTitle>
                <CardDescription>Track project milestones and progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <MilestoneManager
                  projectId={Number(id)}
                  canEdit={canEdit}
                  isTeamLead={isTeamLead}
                  initialMilestones={milestones}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
                <CardDescription>Manage project team members and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamMemberManager projectId={Number(id)} isTeamLead={isTeamLead} initialMembers={members} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Files & Resources
                </CardTitle>
                <CardDescription>Access project files, documents, and resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No files uploaded yet</p>
                  {canEdit && <p className="text-sm">Upload files to share with the team</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>

  )
}
