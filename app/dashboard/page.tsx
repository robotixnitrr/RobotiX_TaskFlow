"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TaskCard } from "@/components/task-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { getTasks, getTaskStats } from "@/lib/actions"
import type { TaskWithTypedAssignees } from "@/db/schema"
import { ArrowRight, CheckCircle2, Clock, ClipboardList, Loader2, PlusCircle, GripVertical } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<TaskWithTypedAssignees[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        // Fetch tasks and stats in parallel
        const [fetchedTasks, taskStats] = await Promise.all([getTasks(), getTaskStats()])

        setTasks(fetchedTasks)
        setStats(taskStats)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
        setError("Failed to load dashboard data. Please try again later.")
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: error instanceof Error ? error.message : "An unknown error occurred",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, toast])

  if (!user) return null

  // Determine if user can create tasks (you may need to adjust this logic based on your business rules)
  // Since role is removed, you might use position or another field to determine permissions
  const canCreateTasks = !(user.position === "members")

  // Filter tasks for the current user
  // Tasks assigned by the user
  const assignedByUser = tasks.filter((task) => task.assignerId === Number(user.id))

  // Tasks assigned to the user (current assignee)
  const assignedToUser = tasks.filter((task) => {
    const currentAssignee = task.assignees[task.assignees.length - 1] // Get the latest assignee
    return currentAssignee && currentAssignee.id === Number(user.id)
  })

  // All tasks related to the user (either assigned by them or assigned to them)
  const userTasks = [...assignedByUser, ...assignedToUser].filter((task, index, arr) =>
    arr.findIndex(t => t.id === task.id) === index // Remove duplicates
  )

  const pendingTasks = tasks.filter((task) => task.status === "pending")
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress")
  const completedTasks = tasks.filter((task) => task.status === "completed")
  const router = useRouter()
  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user.name}</h2>
          <div className="flex gap-5">

            <Button onClick={() => {
              router.push('/dashboard/tasks/chart')
            }}
              variant="secondary"
              className="flex justify-center items-center"
            >
              <GripVertical />
              <p className="">Flow Chart</p>
            </Button>
            {canCreateTasks && (
              <>
                <Link href="/dashboard/create-task">
                  <Button className="gap-2 whitespace-nowrap">
                    <PlusCircle className="h-4 w-4" />
                    Create Task
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All tasks in the system</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Tasks waiting to be started</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground text-status-in-progress" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Tasks currently being worked on</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground text-status-completed" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Tasks that have been completed</p>
            </CardContent>
          </Card>
        </div>

        {error ? (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Error Loading Data</h3>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="my-tasks" className="space-y-4">
            <div className="overflow-x-auto pb-2">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="my-tasks" className="flex-1 sm:flex-initial">
                  My Tasks
                </TabsTrigger>
                <TabsTrigger value="assigned-by-me" className="flex-1 sm:flex-initial">
                  Assigned by Me
                </TabsTrigger>
                <TabsTrigger value="assigned-to-me" className="flex-1 sm:flex-initial">
                  Assigned to Me
                </TabsTrigger>
                <TabsTrigger value="all-tasks" className="flex-1 sm:flex-initial">
                  All Tasks
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex-1 sm:flex-initial">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="flex-1 sm:flex-initial">
                  In Progress
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="my-tasks" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userTasks.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {userTasks.slice(0, 8).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No tasks found"
                  description="You don't have any tasks assigned to you or by you yet."
                  action={
                    canCreateTasks ? (
                      <Link href="/dashboard/create-task">
                        <Button className="gap-2">
                          <PlusCircle className="h-4 w-4" />
                          Create Task
                        </Button>
                      </Link>
                    ) : null
                  }
                />
              )}
              {userTasks.length > 8 && (
                <div className="flex justify-center">
                  <Link href="/dashboard/tasks">
                    <Button variant="outline" className="gap-2">
                      View All Tasks
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="assigned-by-me" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : assignedByUser.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {assignedByUser.slice(0, 8).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No tasks assigned by you"
                  description="You haven't assigned any tasks yet."
                  action={
                    canCreateTasks ? (
                      <Link href="/dashboard/create-task">
                        <Button className="gap-2">
                          <PlusCircle className="h-4 w-4" />
                          Create Task
                        </Button>
                      </Link>
                    ) : null
                  }
                />
              )}
              {assignedByUser.length > 8 && (
                <div className="flex justify-center">
                  <Link href="/dashboard/tasks?filter=assigned-by-me">
                    <Button variant="outline" className="gap-2">
                      View All Tasks Assigned by Me
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="assigned-to-me" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : assignedToUser.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {assignedToUser.slice(0, 8).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No tasks assigned to you"
                  description="You don't have any tasks assigned to you yet."
                />
              )}
              {assignedToUser.length > 8 && (
                <div className="flex justify-center">
                  <Link href="/dashboard/tasks?filter=assigned-to-me">
                    <Button variant="outline" className="gap-2">
                      View All Tasks Assigned to Me
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all-tasks" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : tasks.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {tasks.slice(0, 8).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No tasks found"
                  description="There are no tasks in the system yet."
                  action={
                    canCreateTasks ? (
                      <Link href="/dashboard/create-task">
                        <Button className="gap-2">
                          <PlusCircle className="h-4 w-4" />
                          Create Task
                        </Button>
                      </Link>
                    ) : null
                  }
                />
              )}
              {tasks.length > 8 && (
                <div className="flex justify-center">
                  <Link href="/dashboard/tasks">
                    <Button variant="outline" className="gap-2">
                      View All Tasks
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pendingTasks.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pendingTasks.slice(0, 8).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No pending tasks" description="There are no pending tasks at the moment." />
              )}
              {pendingTasks.length > 8 && (
                <div className="flex justify-center">
                  <Link href="/dashboard/tasks?status=pending">
                    <Button variant="outline" className="gap-2">
                      View All Pending Tasks
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="in-progress" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : inProgressTasks.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {inProgressTasks.slice(0, 8).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No tasks in progress" description="There are no tasks in progress at the moment." />
              )}
              {inProgressTasks.length > 8 && (
                <div className="flex justify-center">
                  <Link href="/dashboard/tasks?status=in-progress">
                    <Button variant="outline" className="gap-2">
                      View All In-Progress Tasks
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>

  )
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <ClipboardList className="h-10 w-10 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
