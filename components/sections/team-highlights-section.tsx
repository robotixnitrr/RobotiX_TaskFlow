"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { ROUTES, POSITION_LABELS } from "@/lib/constants"
import { generateInitials } from "@/lib/utils"
import type { User } from "@/db/schema"

export function TeamHighlightsSection() {
  const [members, setMembers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/team")
        if (response.ok) {
          const data = await response.json()
          // Show only coordinators and executives as highlights
          const highlights = data.members
            .filter(
              (member: User) =>
                member.position &&
                ["overall-coordinator", "head-coordinator", "core-coordinator"].includes(member.position),
            )
            .slice(0, 3)
          setMembers(highlights)
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [])

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Meet Our Leaders</h2>
            <p className="text-xl text-muted-foreground">Loading team information...</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="text-center animate-pulse">
                <CardHeader>
                  <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3 mx-auto"></div>
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
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Meet Our Leaders</h2>
          <p className="text-xl text-muted-foreground">The passionate individuals driving innovation at RobotiX Club</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {members.map((member, index) => (
            <Card key={member.id} className="text-center group hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all">
                  <AvatarImage src={member.avatarUrl || "/placeholder.svg?height=100&width=100"} alt={member.name} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    {generateInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription className="text-primary font-medium">
                  {POSITION_LABELS[member.position || ""] || member.position}
                </CardDescription>
              </CardHeader>
              {/* <CardContent>
                {member.skills && Array.isArray(member.skills) && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {(member.skills as string[]).slice(0, 3).map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent> */}
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href={ROUTES.team}>
            <Button size="lg" variant="outline">
              Meet Full Team
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
