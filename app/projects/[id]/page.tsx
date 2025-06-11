"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Navigation } from "@/components/layout/navigation"
import { Calendar, Users, ExternalLink, Github, Globe, Clock, Target, Award, ArrowLeft, Star } from 'lucide-react'
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProjectDetail {
  id: number
  title: string
  description: string
  longDescription: string
  status: "planning" | "active" | "completed" | "on-hold"
  category: string
  startDate: string
  endDate?: string
  progress: number
  technologies: string[]
  teamMembers: Array<{
    id: number
    name: string
    role: string
    avatar?: string
  }>
  objectives: string[]
  achievements: string[]
  links: {
    github?: string
    demo?: string
    documentation?: string
  }
  images: string[]
  timeline: Array<{
    date: string
    title: string
    description: string
    completed: boolean
  }>
  stats: {
    commits: number
    contributors: number
    stars: number
    forks: number
  }
}

const mockProject: ProjectDetail = {
  id: 1,
  title: "AI-Powered Task Management System",
  description: "An intelligent task management platform with ML-driven priority suggestions and automated workflow optimization.",
  longDescription: "This comprehensive task management system leverages artificial intelligence to revolutionize how teams organize and prioritize their work. The platform uses machine learning algorithms to analyze task patterns, predict completion times, and suggest optimal resource allocation. Built with modern web technologies, it features real-time collaboration, intelligent notifications, and advanced analytics to boost team productivity.",
  status: "active",
  category: "Web Development",
  startDate: "2024-01-15",
  endDate: "2024-06-30",
  progress: 75,
  technologies: ["React", "Next.js", "TypeScript", "Python", "TensorFlow", "PostgreSQL", "Docker"],
  teamMembers: [
    { id: 1, name: "Alex Chen", role: "Project Lead", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 2, name: "Sarah Johnson", role: "Frontend Developer", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 3, name: "Mike Rodriguez", role: "ML Engineer", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 4, name: "Emily Davis", role: "Backend Developer", avatar: "/placeholder.svg?height=40&width=40" }
  ],
  objectives: [
    "Develop intelligent task prioritization algorithms",
    "Create intuitive user interface for task management",
    "Implement real-time collaboration features",
    "Build comprehensive analytics dashboard",
    "Deploy scalable cloud infrastructure"
  ],
  achievements: [
    "Successfully implemented ML-based priority prediction with 85% accuracy",
    "Achieved sub-200ms response times for all API endpoints",
    "Integrated with 5+ popular productivity tools",
    "Processed over 10,000 tasks in beta testing"
  ],
  links: {
    github: "https://github.com/club/ai-task-manager",
    demo: "https://demo.aitaskmanager.com",
    documentation: "https://docs.aitaskmanager.com"
  },
  images: [
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600"
  ],
  timeline: [
    { date: "2024-01-15", title: "Project Kickoff", description: "Initial planning and team formation", completed: true },
    { date: "2024-02-01", title: "UI/UX Design", description: "Complete interface design and user flow", completed: true },
    { date: "2024-02-15", title: "Backend Development", description: "Core API and database implementation", completed: true },
    { date: "2024-03-01", title: "ML Model Training", description: "Develop and train priority prediction models", completed: true },
    { date: "2024-04-01", title: "Frontend Integration", description: "Connect UI with backend services", completed: false },
    { date: "2024-05-01", title: "Beta Testing", description: "Internal testing and bug fixes", completed: false },
    { date: "2024-06-01", title: "Production Deployment", description: "Final deployment and launch", completed: false }
  ],
  stats: {
    commits: 342,
    contributors: 4,
    stars: 28,
    forks: 7
  }
}

const statusColors = {
  planning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "on-hold": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
}

export default function ProjectDetailPage() {
  const params = useParams()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProject(mockProject)
      setLoading(false)
    }, 1000)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <Link href="/projects">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/projects">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <Badge className={cn("capitalize", statusColors[project.status])}>
                  {project.status.replace("-", " ")}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground mb-4">{project.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Started {new Date(project.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {project.teamMembers.length} team members
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {project.category}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {project.links.demo && (
                <Button asChild>
                  <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
              {project.links.github && (
                <Button variant="outline" asChild>
                  <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4 mr-2" />
                    View Code
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Images */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <img
                    src={project.images[selectedImage] || "/placeholder.svg"}
                    alt={`${project.title} screenshot ${selectedImage + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="flex gap-2 overflow-x-auto">
                    {project.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors",
                          selectedImage === index 
                            ? "border-primary" 
                            : "border-transparent hover:border-muted-foreground"
                        )}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Project</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {project.longDescription}
                </p>
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card>
              <CardHeader>
                <CardTitle>Technologies Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Objectives & Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {project.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {project.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.timeline.map((milestone, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-3 h-3 rounded-full border-2",
                          milestone.completed 
                            ? "bg-green-500 border-green-500" 
                            : "bg-background border-muted-foreground"
                        )} />
                        {index < project.timeline.length - 1 && (
                          <div className="w-px h-8 bg-muted-foreground/30 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(milestone.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  {project.endDate && (
                    <p className="text-xs text-muted-foreground">
                      Expected completion: {new Date(project.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{project.stats.commits}</div>
                    <div className="text-xs text-muted-foreground">Commits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{project.stats.contributors}</div>
                    <div className="text-xs text-muted-foreground">Contributors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold flex items-center justify-center gap-1">
                      <Star className="w-4 h-4" />
                      {project.stats.stars}
                    </div>
                    <div className="text-xs text-muted-foreground">Stars</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{project.stats.forks}</div>
                    <div className="text-xs text-muted-foreground">Forks</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle>Project Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.links.github && (
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        Source Code
                      </a>
                    </Button>
                  )}
                  {project.links.demo && (
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                  {project.links.documentation && (
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <a href={project.links.documentation} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Documentation
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
