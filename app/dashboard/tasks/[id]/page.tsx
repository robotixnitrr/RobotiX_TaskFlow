"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/dashboard-layout"
import { PriorityBadge } from "@/components/priority-badge"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { deleteTask, getTask, updateTaskStatus } from "@/lib/actions"
import type { TaskWithTypedAssignees } from "@/db/schema"
import type { Assignee } from "@/lib/types"
import { ArrowLeft, Calendar, Edit, Loader2, Trash, User, Clock, Users } from "lucide-react"

export default function TaskDetailPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [task, setTask] = useState<TaskWithTypedAssignees | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")

  const taskId = Number.parseInt(id?.toString() || "0", 10)

  useEffect(() => {
    async function loadTask() {
      try {
        setLoading(true)
        const fetchedTask = await getTask(taskId)

        if (fetchedTask) {
          // Type cast the fetched task to include typed assignees
          const typedTask: TaskWithTypedAssignees = {
            ...fetchedTask,
            assignees: (fetchedTask.assignees as Assignee[]) || []
          }
          setTask(typedTask)
          setNewStatus(typedTask.status)
        } else {
          toast({
            variant: "destructive",
            title: "Task not found",
            description: "The requested task could not be found.",
          })
          router.push("/dashboard/tasks")
        }
      } catch (error) {
        console.error("Failed to load task:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load task details.",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTask()
  }, [taskId, router, toast])

  const handleStatusChange = async () => {
    if (!task || !user) return

    try {
      setUpdating(true)
      const updatedTask = await updateTaskStatus(task.id, newStatus as "pending" | "in-progress" | "completed")

      if (updatedTask) {
        const typedUpdatedTask: TaskWithTypedAssignees = {
          ...updatedTask,
          assignees: (updatedTask.assignees as Assignee[]) || []
        }
        setTask(typedUpdatedTask)
        toast({
          title: "Status updated",
          description: "The task status has been updated successfully.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating the task status.",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!task || !user || task.assignerId !== Number(user.id)) return

    try {
      setUpdating(true)
      await deleteTask(task.id)

      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      })

      router.push("/dashboard/tasks")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was an error deleting the task.",
      })
    } finally {
      setUpdating(false)
      setDeleteDialogOpen(false)
    }
  }

  if (!user) return null

  // Check permissions - user can edit if they are the assigner
  const canEdit = task?.assignerId === Number(user.id)
  
  // Check if user can update status - if they are currently assigned to the task
  const isCurrentlyAssigned = task?.assignees.some(assignee => assignee.id === Number(user.id))
  const canUpdateStatus = isCurrentlyAssigned

  // Get current assignee (most recent one)
  const currentAssignee = task?.assignees && task.assignees.length > 0 
    ? task.assignees[task.assignees.length - 1] 
    : null

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!task) {
    return (
      <DashboardLayout>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Task not found</CardTitle>
            <CardDescription>The requested task could not be found.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/tasks">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tasks
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/tasks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tasks
            </Link>
          </Button>
          {canEdit && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/tasks/${task.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Task</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this task? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteTask} disabled={updating}>
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-2xl break-words">{task.title}</CardTitle>
                  <CardDescription>Created on {task.createdAt?.toLocaleDateString()}</CardDescription>
                </div>
                <PriorityBadge priority={task.priority as "low" | "medium" | "high"} size="lg" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Description</h3>
                  <p className="mt-2 whitespace-pre-line text-muted-foreground">{task.description}</p>
                </div>
                <Separator />
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Due Date</p>
                        <p className="text-sm text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Currently Assigned To</p>
                        <p className="text-sm text-muted-foreground">
                          {currentAssignee ? currentAssignee.name : "No assignee"}
                        </p>
                        {currentAssignee && (
                          <p className="text-xs text-muted-foreground">
                            Assigned on {new Date(currentAssignee.assignedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Assigned By</p>
                        <p className="text-sm text-muted-foreground">{task.assignerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-sm text-muted-foreground">{task.updatedAt?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignment History */}
                {task.assignees.length > 1 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Assignment History</h3>
                      </div>
                      <div className="space-y-2">
                        {task.assignees.map((assignee, index) => (
                          <div key={`${assignee.id}-${index}`} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Badge variant={index === task.assignees.length - 1 ? "default" : "secondary"}>
                                {index === task.assignees.length - 1 ? "Current" : `Step ${index + 1}`}
                              </Badge>
                              <span className="text-sm font-medium">{assignee.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(assignee.assignedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>
                Current status: <StatusBadge status={task.status as "pending" | "in-progress" | "completed"} />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(canEdit || canUpdateStatus) && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Update Status</label>
                      <Select value={newStatus} onValueChange={setNewStatus} disabled={newStatus === "completed"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleStatusChange}
                      disabled={updating || task.status === newStatus}
                    >
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Status"
                      )}
                    </Button>
                  </>
                )}
                
                {/* Assignment Summary */}
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Assignment Summary</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Total assignments: {task.assignees.length}</p>
                    <p>Created by: {task.assignerName}</p>
                    {currentAssignee && (
                      <p>Current assignee: {currentAssignee.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <p className="text-xs text-muted-foreground">
                Last updated: {task.updatedAt?.toLocaleString()}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
