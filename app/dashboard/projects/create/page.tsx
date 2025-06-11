"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import DashboardLayout from "@/components/dashboard-layout"
import { ProjectForm } from "@/components/projects/project-form"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CreateProjectPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Check if user is authorized to create projects
  const canCreateProjects = user?.position === "head-coordinator" || user?.position === "overall-cordinator"

  if (!canCreateProjects) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to create projects. Only head coordinators and overall coordinators can create
                projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/projects">
                <Button variant="outline" className="w-full">
                  Back to Projects
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Projects
          </Link>

          <h1 className="text-2xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-muted-foreground">Add a new project to the robotics club portfolio</p>
        </div>

        <ProjectForm
          onSuccess={() => router.push("/dashboard/projects")}
          onCancel={() => router.push("/dashboard/projects")}
        />
      </div>
    </DashboardLayout>
  )
}
