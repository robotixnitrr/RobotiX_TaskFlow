"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink, Github, Calendar, Users2, Zap } from "lucide-react"
import { ROUTES } from "@/lib/constants"
import type { ProjectWithTypedMembers } from "@/db/schema"

export function FeaturedProjectsSection() {
  const [projects, setProjects] = useState<ProjectWithTypedMembers[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects?.slice(0, 3))
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const getStatusConfig = (status: string) => {
    const configs = {
      planning: {
        color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        icon: "🎯",
        glow: "shadow-blue-500/20"
      },
      "in-progress": {
        color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        icon: "⚡",
        glow: "shadow-amber-500/20"
      },
      completed: {
        color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        icon: "✅",
        glow: "shadow-emerald-500/20"
      },
      "on-hold": {
        color: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        icon: "⏸️",
        glow: "shadow-slate-500/20"
      },
    }
    return configs[status as keyof typeof configs] || configs.planning
  }

  const formatStatus = (status: string) => {
    return status
      ?.split("-")
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      ?.join(" ")
  }

  if (isLoading) {
    return (
      <section className="py-32 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
              <div className="w-5 h-5 bg-primary/20 rounded animate-pulse" />
              <div className="w-32 h-4 bg-primary/20 rounded animate-pulse" />
            </div>
            <div className="w-96 h-12 bg-muted rounded-lg mx-auto mb-6 animate-pulse" />
            <div className="w-full max-w-2xl h-6 bg-muted rounded mx-auto animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-64 bg-muted" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-6 w-16 bg-muted rounded-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-32 px-4 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.15),transparent_70%)]" />
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary mb-8">
            <Zap className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wide uppercase">Innovation Showcase</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Featured Projects
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            Discover our most <span className="text-primary font-semibold">groundbreaking innovations</span> and
            cutting-edge solutions that are shaping the future
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {projects?.map((project, index) => {
            const statusConfig = getStatusConfig(project.status)
            return (
              <Card
                key={project.id}
                className="group relative overflow-hidden border-0 bg-gradient-to-br from-background/80 to-muted/30 backdrop-blur-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-4"
                onMouseEnter={() => setHoveredProject(project.id.toString())}
                onMouseLeave={() => setHoveredProject(null)}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-xl blur opacity-0 group-hover:opacity-30 transition-all duration-500`} />

                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <Image
                    src={project.imageUrl || "/placeholder.svg?height=300&width=400"}
                    alt={project.title}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`${statusConfig.color} border ${statusConfig.glow} shadow-lg backdrop-blur-sm`}>
                      <span className="mr-2">{statusConfig.icon}</span>
                      {formatStatus(project.status)}
                    </Badge>
                  </div>

                  {/* Quick Actions */}
                  <div className={`absolute top-4 left-4 flex gap-2 transition-all duration-300 ${hoveredProject === project.id.toString() ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                    }`}>
                    <Button size="sm" variant="secondary" className="backdrop-blur-md bg-white/20 hover:bg-white/30 border-0">
                      <Github className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="backdrop-blur-md bg-white/20 hover:bg-white/30 border-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Project Stats */}
                  <div className="absolute bottom-4 left-4 flex gap-4 text-white/80">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>2024</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Users2 className="h-4 w-4" />
                      <span>{Math.floor(Math.random() * 8) + 3}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <CardHeader className="relative z-10 pb-3">
                  <CardTitle className="text-2xl font-bold line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-base leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies?.slice(0, 3)?.map((tech, techIndex) => (
                      <Badge
                        key={techIndex}
                        variant="outline"
                        className="text-xs font-medium bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies?.length && project.technologies?.length > 3 && (
                      <Badge variant="outline" className="text-xs bg-muted">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Category & Progress */}
                  <div className="flex items-center justify-between">
                    <Badge className="capitalize bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                      {project.category}
                    </Badge>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                          style={{
                            width: project.status === 'completed' ? '100%' :
                              project.status === 'in-progress' ? '65%' : '25%'
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {project.status === 'completed' ? '100%' :
                          project.status === 'in-progress' ? '65%' : '25%'}
                      </span>
                    </div>
                  </div>
                </CardContent>

                {/* Hover Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent transition-opacity duration-300 ${hoveredProject === project.id.toString() ? 'opacity-100' : 'opacity-0'
                  }`} />
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="inline-flex flex-col items-center gap-6">
            <div className="text-sm text-muted-foreground font-medium">
              Explore our complete portfolio of innovations
            </div>
            <Link href={ROUTES.projects}>
              <Button
                size="lg"
                className="text-lg px-10 py-6 rounded-full bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:to-primary transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                View All Projects
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}