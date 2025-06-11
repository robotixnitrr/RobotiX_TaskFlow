"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/layout/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ProtectedRoute } from "@/components/ui/protected-route"
import { Github, Linkedin, Mail, Search, Users, Calendar, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useDebounce } from "@/hooks/use-debounce"
import { AuthService } from "@/lib/auth"
import { ROUTES, POSITION_LABELS } from "@/lib/constants"
import { generateInitials, formatDate } from "@/lib/utils"
import type { User } from "@/db/schema"
import Link from "next/link"

export default function TeamPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<User[]>([])
  const [filteredMembers, setFilteredMembers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const canManageTeam = AuthService.canManageTeam(user)

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, debouncedSearchTerm, positionFilter])

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/team")

      if (!response.ok) {
        throw new Error("Failed to fetch team members")
      }

      const data = await response.json()
      setMembers(data.members)
    } catch (error) {
      console.error("Failed to fetch team members:", error)
      setError(error instanceof Error ? error.message : "Failed to load team members")
    } finally {
      setIsLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = members

    if (debouncedSearchTerm) {
      const query = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          (member.bio && member.bio.toLowerCase().includes(query))
      )
    }

    if (positionFilter !== "all") {
      filtered = filtered.filter((member) => member.position === positionFilter)
    }

    setFilteredMembers(filtered)
  }

  const getPositionOrder = (position: string) => {
    const order = {
      "overall-coordinator": 1,
      "head-coordinator": 2,
      "core-coordinator": 3,
      executive: 4,
      members: 5,
    }
    return order[position as keyof typeof order] || 6
  }

  const sortedMembers = filteredMembers.sort((a, b) => {
    const orderA = getPositionOrder(a.position || "")
    const orderB = getPositionOrder(b.position || "")
    if (orderA !== orderB) return orderA - orderB
    return a.name.localeCompare(b.name)
  })

  const getPositionColor = (position: string) => {
    const colors = {
      "overall-coordinator": "bg-gradient-to-r from-purple-500 to-purple-600",
      "head-coordinator": "bg-gradient-to-r from-blue-500 to-blue-600",
      "core-coordinator": "bg-gradient-to-r from-green-500 to-green-600",
      executive: "bg-gradient-to-r from-orange-500 to-orange-600",
      members: "bg-gradient-to-r from-gray-500 to-gray-600",
    }
    return colors[position as keyof typeof colors] || "bg-gradient-to-r from-gray-500 to-gray-600"
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-destructive">Error Loading Team</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchMembers} variant="outline">
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Our Amazing Team
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Meet the passionate individuals who drive innovation and excellence at RobotiX Club. Our diverse team
                brings together expertise in robotics, AI, IoT, and cutting-edge technology.
              </p>
            </div>

            <ProtectedRoute requireAuth={false} checkPermission={() => canManageTeam} fallback={null}>
              <Link href="/dashboard/team/add">
                <Button size="lg" className="mt-4 md:mt-0">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Member
                </Button>
              </Link>
            </ProtectedRoute>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            <Select value={positionFilter} onValueChange={setPositionFilter} disabled={isLoading}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="overall-coordinator">Overall Coordinator</SelectItem>
                <SelectItem value="head-coordinator">Head Coordinator</SelectItem>
                <SelectItem value="core-coordinator">Core Coordinator</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="members">Members</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{members.length}</div>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {members.filter((m) => m.position?.includes("coordinator")).length}
                </div>
                <p className="text-sm text-muted-foreground">Coordinators</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {members.filter((m) => m.position === "executive").length}
                </div>
                <p className="text-sm text-muted-foreground">Executives</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {members.filter((m) => m.position === "members").length}
                </div>
                <p className="text-sm text-muted-foreground">Members</p>
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
              {/* Team Members Grid */}
              {sortedMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No members found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || positionFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "No team members available at the moment."}
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedMembers.map((member) => (
                    <Card
                      key={member.id}
                      className="group hover:shadow-xl transition-all duration-300 hover:border-primary/20"
                    >
                      <CardHeader className="text-center pb-4">
                        <div className="relative">
                          <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all">
                            <AvatarImage
                              src={member.avatarUrl || "/placeholder.svg?height=100&width=100"}
                              alt={member.name}
                            />
                            <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                              {generateInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white ${getPositionColor(member.position || "")}`}
                          >
                            {POSITION_LABELS[member.position || ""] || member.position}
                          </div>
                        </div>
                        <CardTitle className="text-lg mt-4">{member.name}</CardTitle>
                        <CardDescription className="text-sm">{member.email}</CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {member.bio && <p className="text-sm text-muted-foreground line-clamp-3">{member.bio}</p>}

                        {member.createdAt && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Joined {formatDate(member.createdAt)}</span>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          {member.githubUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={member.githubUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {member.linkedinUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${member.email}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
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
                <CardTitle>Want to Join Our Team?</CardTitle>
                <CardDescription>
                  We're always looking for passionate individuals to join our community of innovators.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {user ? (
                    <Link href={ROUTES.dashboard}>
                      <Button size="lg">Go to Dashboard</Button>
                    </Link>
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
                          <Mail className="ml-2 h-5 w-5" />
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
