"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Plus, Edit, Trash2, Calendar, CheckCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  MilestonesAPI,
  type Milestone,
  type CreateMilestoneInput,
  type UpdateMilestoneInput,
} from "@/lib/api/milestones"

interface MilestoneManagerProps {
  projectId: number
  canEdit: boolean
  isTeamLead: boolean
  initialMilestones?: Milestone[]
}

interface MilestoneFormData {
  title: string
  description: string
  date: string
  completed: boolean
}

export function MilestoneManager({ projectId, canEdit, isTeamLead, initialMilestones = [] }: MilestoneManagerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones)
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [formData, setFormData] = useState<MilestoneFormData>({
    title: "",
    description: "",
    date: "",
    completed: false,
  })
  const [submitting, setSubmitting] = useState(false)

  // Only team leads or admins can edit milestones
  const hasEditPermission = canEdit || isTeamLead

  useEffect(() => {
    loadMilestones()
  }, [projectId])

  const loadMilestones = async () => {
    setLoading(true)
    try {
      const response = await MilestonesAPI.getMilestones(projectId)
      if (response.success && response.data) {
        setMilestones(response.data)
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load milestones",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading milestones:", error)
      toast({
        title: "Error",
        description: "Failed to load milestones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      completed: false,
    })
    setEditingMilestone(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (milestone: Milestone) => {
    setFormData({
      title: milestone.title,
      description: milestone.description || "",
      date: milestone.date,
      completed: milestone.completed,
    })
    setEditingMilestone(milestone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.date) return

    setSubmitting(true)
    try {
      if (editingMilestone) {
        // Update existing milestone
        const updateData: UpdateMilestoneInput = {
          title: formData.title,
          description: formData.description || undefined,
          date: formData.date,
          completed: formData.completed,
        }

        const response = await MilestonesAPI.updateMilestone(projectId, editingMilestone.id, updateData)
        if (response.success && response.data) {
          setMilestones((prev) => prev.map((m) => (m.id === editingMilestone.id ? response.data! : m)))
          toast({
            title: "Success",
            description: "Milestone updated successfully",
          })
          setEditingMilestone(null)
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to update milestone",
            variant: "destructive",
          })
        }
      } else {
        // Create new milestone
        const createData: CreateMilestoneInput = {
          projectId,
          title: formData.title,
          description: formData.description || undefined,
          date: formData.date,
          completed: formData.completed,
        }

        const response = await MilestonesAPI.createMilestone(createData)
        if (response.success && response.data) {
          setMilestones((prev) =>
            [...prev, response.data!].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          )
          toast({
            title: "Success",
            description: "Milestone created successfully",
          })
          setIsCreateDialogOpen(false)
          resetForm()
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to create milestone",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error submitting milestone:", error)
      toast({
        title: "Error",
        description: "Failed to save milestone",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (milestone: Milestone) => {
    try {
      const response = await MilestonesAPI.deleteMilestone(projectId, milestone.id)
      if (response.success) {
        setMilestones((prev) => prev.filter((m) => m.id !== milestone.id))
        toast({
          title: "Success",
          description: "Milestone deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete milestone",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting milestone:", error)
      toast({
        title: "Error",
        description: "Failed to delete milestone",
        variant: "destructive",
      })
    }
  }

  const toggleMilestoneCompletion = async (milestone: Milestone) => {
    if (!hasEditPermission) return

    try {
      const response = await MilestonesAPI.updateMilestone(projectId, milestone.id, {
        completed: !milestone.completed,
      })

      if (response.success && response.data) {
        setMilestones((prev) => prev.map((m) => (m.id === milestone.id ? response.data! : m)))
        toast({
          title: "Success",
          description: `Milestone marked as ${!milestone.completed ? "completed" : "incomplete"}`,
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update milestone",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling milestone:", error)
      toast({
        title: "Error",
        description: "Failed to update milestone",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Timeline</h3>
        {hasEditPermission && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Milestone</DialogTitle>
                <DialogDescription>Add a new milestone to track project progress.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Milestone title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Milestone description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Target Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completed"
                    checked={formData.completed}
                    onCheckedChange={(checked) => setFormData({ ...formData, completed: !!checked })}
                  />
                  <Label htmlFor="completed">Mark as completed</Label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Milestone
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {milestones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No milestones yet</p>
            {hasEditPermission && <p className="text-sm">Add your first milestone to track progress</p>}
          </div>
        ) : (
          milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => toggleMilestoneCompletion(milestone)}
                  disabled={!hasEditPermission}
                  className={cn(
                    "w-4 h-4 rounded-full border-2 transition-colors",
                    milestone.completed
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-background border-muted-foreground hover:border-primary",
                    hasEditPermission && "cursor-pointer",
                    !hasEditPermission && "cursor-default",
                  )}
                  aria-label={milestone.completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  {milestone.completed && <CheckCircle className="w-3 h-3" />}
                </button>
                {index < milestones.length - 1 && <div className="w-px h-8 bg-muted-foreground/30 mt-2" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <Badge variant={milestone.completed ? "default" : "secondary"} className="text-xs">
                        {format(new Date(milestone.date), "MMM dd, yyyy")}
                      </Badge>
                      {milestone.completed && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          Completed
                        </Badge>
                      )}
                    </div>
                    {milestone.description && <p className="text-sm text-muted-foreground">{milestone.description}</p>}
                    {milestone.creator && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Added by {milestone.creator.name} • {format(new Date(milestone.createdAt), "MMM dd, yyyy")}
                      </p>
                    )}
                  </div>
                  {hasEditPermission && (
                    <div className="flex gap-1 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(milestone)}>
                            <Edit className="w-3 h-3" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Milestone</DialogTitle>
                            <DialogDescription>Update milestone details and progress.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                              <Label htmlFor="edit-title">Title</Label>
                              <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Milestone title"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Milestone description"
                                rows={3}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-date">Target Date</Label>
                              <Input
                                id="edit-date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="edit-completed"
                                checked={formData.completed}
                                onCheckedChange={(checked) => setFormData({ ...formData, completed: !!checked })}
                              />
                              <Label htmlFor="edit-completed">Mark as completed</Label>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setEditingMilestone(null)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={submitting}>
                                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Update Milestone
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-3 h-3" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{milestone.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(milestone)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete Milestone
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
