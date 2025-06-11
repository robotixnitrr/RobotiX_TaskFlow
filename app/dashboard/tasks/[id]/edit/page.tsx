"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { getAssignees, getTask, updateTask, addAssigneeToTask } from "@/lib/actions"
import type { TaskWithTypedAssignees, User } from "@/db/schema"
import type { Assignee } from "@/lib/types"
import { ArrowLeft, Loader2, Plus, User as UserIcon, Clock } from "lucide-react"

export default function EditTaskPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const taskId = Number(id)
  const [task, setTask] = useState<TaskWithTypedAssignees | null>(null)
  const [assignees, setAssignees] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [addingAssignee, setAddingAssignee] = useState(false)
  const [newAssigneeId, setNewAssigneeId] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  })

  useEffect(() => {
    async function loadData() {
      if (!user) return

      setLoading(true)
      try {
        // Fetch single task by ID
        const fetched = await getTask(taskId)
        if (!fetched) {
          toast({ variant: "destructive", title: "Not Found", description: "Task not found." })
          router.push("/dashboard/tasks")
          return
        }

        // Cast to TaskWithTypedAssignees for proper typing
        const typedTask: TaskWithTypedAssignees = {
          ...fetched,
          assignees: fetched.assignees as Assignee[]
        }

        // Authorization: must be assigner
        if (fetched.assignerId !== Number(user.id)) {
          toast({ variant: "destructive", title: "Unauthorized", description: "You cannot edit this task." })
          router.push(`/dashboard/tasks/${taskId}`)
          return
        }

        setTask(typedTask)

        // Populate form
        setFormData({
          title: fetched.title,
          description: fetched.description,
          priority: fetched.priority,
          dueDate: new Date(fetched.dueDate).toISOString().split('T')[0],
        })

        // Fetch assignees list
        const list = await getAssignees(user.id)
        setAssignees(list)
      } catch (err) {
        console.error(err)
        toast({ variant: "destructive", title: "Error", description: "Failed loading data." })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [taskId, user, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePriorityChange = (value: string) => {
    setFormData(prev => ({ ...prev, priority: value as "low" | "medium" | "high" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return

    setUpdating(true)
    try {
      await updateTask(taskId, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate,
      })
      toast({ title: "Updated", description: "Task updated successfully." })
      router.push(`/dashboard/tasks/${taskId}`)
    } catch (err) {
      console.error(err)
      toast({ variant: "destructive", title: "Error", description: "Failed to update task." })
    } finally {
      setUpdating(false)
    }
  }

  const handleAddAssignee = async () => {
    if (!newAssigneeId || !task) return

    const selectedUser = assignees.find(u => u.id === Number(newAssigneeId))
    if (!selectedUser) return

    // Check if user is already assigned
    const isAlreadyAssigned = task.assignees.some(a => a.id === Number(newAssigneeId))
    if (isAlreadyAssigned) {
      toast({ variant: "destructive", title: "Error", description: "User is already assigned to this task." })
      return
    }

    setAddingAssignee(true)
    try {
      const newAssignee: Assignee = {
        id: selectedUser.id,
        name: selectedUser.name,
        assignedAt: new Date()
      }

      const updatedTask = await addAssigneeToTask(taskId, newAssignee)
      if (updatedTask) {
        setTask({
          ...updatedTask,
          assignees: updatedTask.assignees as Assignee[]
        })
        setNewAssigneeId("")
        toast({ title: "Success", description: "Assignee added successfully." })
      }
    } catch (err) {
      console.error(err)
      toast({ variant: "destructive", title: "Error", description: "Failed to add assignee." })
    } finally {
      setAddingAssignee(false)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!task) {
    return null
  }

  // Get current assignee (most recent)
  const currentAssignee = task.assignees.length > 0 
    ? task.assignees.reduce((most, current) => 
        new Date(current.assignedAt) > new Date(most.assignedAt) ? current : most
      )
    : null

  // Get available users (exclude already assigned ones)
  const availableAssignees = assignees.filter(u => 
    !task.assignees.some(a => a.id === u.id)
  )

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-between">
          {/* <h2 className="text-2xl font-bold">Edit Task</h2> */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/tasks/${taskId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />Back
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Task Details</CardTitle>
                  <CardDescription>Update the task information below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Priority</Label>
                      <RadioGroup value={formData.priority} onValueChange={handlePriorityChange} className="flex space-x-4">
                        {(["low","medium","high"] as const).map(pr => (
                          <div key={pr} className="flex items-center space-x-2">
                            <RadioGroupItem value={pr} id={pr} />
                            <Label htmlFor={pr} className="font-normal capitalize">{pr}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} required />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between flex-wrap gap-2">
                  <Button variant="outline" onClick={() => router.push(`/dashboard/tasks/${taskId}`)}>Cancel</Button>
                  <Button type="submit" disabled={updating}>
                    {updating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Update Task"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>

          {/* Assignment management */}
          <div className="space-y-6">
            {/* Current Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Current Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assigned By</p>
                    <p className="font-medium">{task.assignerName}</p>
                  </div>
                  
                  {currentAssignee && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Currently Assigned To</p>
                      <p className="font-medium">{currentAssignee.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Assigned on {new Date(currentAssignee.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Add New Assignee */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {task.assignees.length > 0 ? "Reassign Assignee" : "Assign Assignee"}
                </CardTitle>
                <CardDescription>Reassign or add additional assignees to this task</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newAssignee">Select User</Label>
                  <Select value={newAssigneeId} onValueChange={setNewAssigneeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAssignees.map(u => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name}
                          {u.position && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({u.position})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleAddAssignee} 
                  disabled={!newAssigneeId || addingAssignee}
                  className="w-full"
                >
                  {addingAssignee ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Assignee
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Assignment History */}
            {task.assignees.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Assignment History
                  </CardTitle>
                  <CardDescription>Previous assignments for this task</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {task.assignees
                      .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
                      .map((assignee, index) => (
                        <div key={`${assignee.id}-${assignee.assignedAt}`} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{assignee.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(assignee.assignedAt).toLocaleDateString()}
                            </p>
                          </div>
                          {index === 0 && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
