"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/dashboard-layout"
import { PriorityBadge } from "@/components/priority-badge"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getTasks, getAssignees } from "@/lib/actions"
import type { TaskWithTypedAssignees, User } from "@/db/schema"
import { ClipboardList, Loader2, MoreHorizontal, PlusCircle, Search, AlertCircle, History, User as UserIcon, GripVertical } from "lucide-react"

export default function TasksPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [tasks, setTasks] = useState<TaskWithTypedAssignees[]>([])
  const [assignees, setAssignees] = useState<User[]>([])
  const [filteredTasks, setFilteredTasks] = useState<TaskWithTypedAssignees[]>([])
  const [loading, setLoading] = useState(true)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [assigneesLoading, setAssigneesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [assignerFilter, setAssignerFilter] = useState("all")
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      if (!user) return

      try {
        setLoading(true)
        setError(null)
        setTasksLoading(true)
        setAssigneesLoading(true)

        // Show loading toast for better UX
        const loadingToast = toast({
          title: "Loading tasks...",
          description: "Please wait while we fetch your data.",
        })

        // Fetch tasks and assignees in parallel
        const [fetchedTasks, fetchedAssignees] = await Promise.all([
          getTasks().finally(() => setTasksLoading(false)),
          getAssignees(user.id).finally(() => setAssigneesLoading(false))
        ])

        setTasks(fetchedTasks)
        setFilteredTasks(fetchedTasks)
        setAssignees(fetchedAssignees)

        // Dismiss loading toast and show success
        loadingToast.dismiss?.()

        toast({
          title: "Tasks loaded successfully",
          description: `Found ${fetchedTasks.length} task${fetchedTasks.length !== 1 ? 's' : ''}`,
        })

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        console.error("Failed to load tasks:", error)
        setError(errorMessage)

        toast({
          variant: "destructive",
          title: "Failed to load tasks",
          description: errorMessage,
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData()}
            >
              Retry
            </Button>
          ),
        })
      } finally {
        setLoading(false)
        setTasksLoading(false)
        setAssigneesLoading(false)
      }
    }

    loadData()
  }, [user, toast])

  useEffect(() => {
    let result = [...tasks]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (task) => task.title.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter)
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter)
    }

    // Apply assignee filter
    if (assigneeFilter !== "all") {
      result = result.filter((task) =>
        task.assignees.some(assignee => assignee.id === Number(assigneeFilter))
      )
    }

    // Apply assigner filter
    if (assignerFilter !== "all") {
      result = result.filter((task) => task.assignerId === Number(assignerFilter))
    }

    setFilteredTasks(result)
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, assignerFilter])

  // Get unique assigners for filter dropdown
  const uniqueAssigners = Array.from(
    new Set(tasks.map((task) => ({ id: task.assignerId, name: task.assignerName }))),
  ).filter((assigner, index, self) => self.findIndex((a) => a.id === assigner.id) === index)

  // Helper function to get current assignee
  const getCurrentAssignee = (assignees: any[]) => {
    if (!assignees || assignees.length === 0) return null
    return assignees[assignees.length - 1] // Latest assignee
  }

  // Helper function to check if task was reassigned
  const wasReassigned = (assignees: any[]) => {
    return assignees && assignees.length > 1
  }

  // Helper function to get assignment history
  const getAssignmentHistory = (assignees: any[]) => {
    if (!assignees || assignees.length <= 1) return []
    return assignees.slice(0, -1) // All except current assignee
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setAssigneeFilter("all")
    setAssignerFilter("all")

    toast({
      title: "Filters reset",
      description: "All filters have been cleared.",
    })
  }

  if (!user) return null

  // Check if user can perform actions (removed role-based check since role is removed)
  const canCreateTasks = true // You may want to add different logic here
  const canEditTask = (task: TaskWithTypedAssignees) => task.assignerId === Number(user.id)
  const canUpdateStatus = (task: TaskWithTypedAssignees) => {
    const currentAssignee = getCurrentAssignee(task.assignees)
    return currentAssignee && currentAssignee.id === Number(user.id)
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1 max-w-sm" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Error state component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <h3 className="mt-4 text-lg font-semibold">Failed to load tasks</h3>
      <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      <Button
        className="mt-4"
        onClick={() => window.location.reload()}
        variant="outline"
      >
        Try Again
      </Button>
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSkeleton />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6 w-full">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <ErrorState />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          {canCreateTasks && (
            <div className="flex gap-10">
              <Button onClick={() => {
                router.push('tasks/chart')
              }}
                variant="secondary"
                className="flex justify-center items-center"
              >
                <GripVertical />
                <p className="">Flow Chart</p>
              </Button>
              <Link href="/dashboard/create-task">
                <Button className="gap-2 whitespace-nowrap">
                  <PlusCircle className="h-4 w-4" />
                  Create Task
                </Button>
              </Link>

            </div>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex flex-1 items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                    disabled={tasksLoading}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    disabled={tasksLoading || assigneesLoading}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  disabled={tasksLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                  disabled={tasksLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={assigneeFilter}
                  onValueChange={setAssigneeFilter}
                  disabled={assigneesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by assignee" />
                    {assigneesLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    {assignees.map((assignee) => (
                      <SelectItem key={assignee.id} value={assignee.id.toString()}>
                        {assignee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={assignerFilter}
                  onValueChange={setAssignerFilter}
                  disabled={tasksLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by assigner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assigners</SelectItem>
                    {uniqueAssigners.map((assigner) => (
                      <SelectItem key={assigner.id} value={assigner.id?.toString() as string}>
                        {assigner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(tasksLoading || assigneesLoading) ? (
              <div className="flex justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-muted-foreground">
                    {tasksLoading && assigneesLoading
                      ? "Loading tasks and assignees..."
                      : tasksLoading
                        ? "Loading tasks..."
                        : "Loading assignees..."}
                  </span>
                </div>
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="mt-6 overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Title</TableHead>
                          <TableHead className="whitespace-nowrap">Priority</TableHead>
                          <TableHead className="whitespace-nowrap">Status</TableHead>
                          <TableHead className="whitespace-nowrap">Due Date</TableHead>
                          <TableHead className="whitespace-nowrap">Assigned To</TableHead>
                          <TableHead className="whitespace-nowrap">Assigned By</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTasks.map((task) => {
                          const currentAssignee = getCurrentAssignee(task.assignees)
                          const isReassigned = wasReassigned(task.assignees)
                          const history = getAssignmentHistory(task.assignees)

                          return (
                            <TableRow key={task.id}>
                              <TableCell className="font-medium max-w-[200px] truncate">{task.title}</TableCell>
                              <TableCell>
                                <PriorityBadge priority={task.priority as "low" | "medium" | "high"} />
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={task.status as "pending" | "in-progress" | "completed"} />
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {new Date(task.dueDate || '').toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <UserIcon className="h-3 w-3 text-muted-foreground" />
                                    <span className="max-w-[120px] truncate">
                                      {currentAssignee?.name || 'Unassigned'}
                                    </span>
                                  </div>
                                  {isReassigned && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge variant="secondary" className="gap-1 text-xs">
                                            <History className="h-3 w-3" />
                                            {history.length}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs">
                                          <div className="space-y-1">
                                            <p className="font-medium">Assignment History:</p>
                                            {history.map((assignee, index) => (
                                              <div key={index} className="text-xs">
                                                {assignee.name} - {new Date(assignee.assignedAt).toLocaleDateString()}
                                              </div>
                                            ))}
                                            <div className="text-xs border-t pt-1 font-medium">
                                              Current: {currentAssignee?.name} - {new Date(currentAssignee?.assignedAt || '').toLocaleDateString()}
                                            </div>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">{task.assignerName}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                      <Link href={`/dashboard/tasks/${task.id}`}>View Details</Link>
                                    </DropdownMenuItem>
                                    {canEditTask(task) && (
                                      <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/tasks/${task.id}/edit`}>Edit Task</Link>
                                      </DropdownMenuItem>
                                    )}
                                    {canUpdateStatus(task) && (
                                      <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/tasks/${task.id}`}>Update Status</Link>
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center mt-6">
                <ClipboardList className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery ||
                    statusFilter !== "all" ||
                    priorityFilter !== "all" ||
                    assigneeFilter !== "all" ||
                    assignerFilter !== "all"
                    ? "Try adjusting your filters to find what you're looking for."
                    : canCreateTasks
                      ? "You haven't assigned any tasks yet. Create your first task to get started."
                      : "You don't have any tasks assigned to you yet."}
                </p>
                {canCreateTasks && (
                  <div className="mt-6">
                    <Link href="/dashboard/create-task">
                      <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Create Task
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
