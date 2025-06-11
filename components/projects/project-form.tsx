"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, X, Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

import { ProjectsAPI } from "@/lib/api/projects"
import { createProjectSchema, updateProjectSchema } from "@/lib/validations/project"
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validations/project"
import type { ProjectWithDetails } from "@/db/schema"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface ProjectFormProps {
  project?: ProjectWithDetails
  onSuccess?: (project: ProjectWithDetails) => void
  onCancel?: () => void
}

type FormData = CreateProjectInput | (UpdateProjectInput & { id: number })

export function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTechnology, setNewTechnology] = useState("")
  const [newTag, setNewTag] = useState("")

  const isEditing = !!project

  const form = useForm<FormData>({
    resolver: zodResolver(isEditing ? updateProjectSchema : createProjectSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      status: (project?.status as "in-progress" | "completed" | "planning" | "on-hold") || "planning",
      category: (project?.category as "robotics" | "ai-ml" | "iot" | "automation" | "research" | "competition") || "",
      priority: (project?.priority as "low" | "medium" | "high") || "medium",
      startDate: project?.startDate || format(new Date(), "yyyy-MM-dd"),
      endDate: project?.endDate || "",
      teamLeadId: project?.teamLeadId || user?.id || 0,
      teamLeadName: project?.teamLeadName || user?.name || "",
      technologies: project?.technologies || [],
      tags: project?.tags || [],
      budget: project?.budget ? Number(project.budget) : undefined,
      progressPercentage: project?.progressPercentage || 0,
      githubUrl: project?.githubUrl || "",
      repositoryUrl: project?.repositoryUrl || "",
      demoUrl: project?.demoUrl || "",
      documentationUrl: project?.documentationUrl || "",
      imageUrl: project?.imageUrl || "",
      isFeatured: project?.isFeatured || false,
      ...(isEditing && { id: project.id }),
    },
  })

  const watchedTechnologies = form.watch("technologies")
  const watchedTags = form.watch("tags")

  async function onSubmit(data: FormData) {
    try {
      setIsSubmitting(true)

      let response
      if (isEditing && "id" in data) {
        const { id, ...updateData } = data
        response = await ProjectsAPI.updateProject(id, updateData)
      } else {
        response = await ProjectsAPI.createProject(data as CreateProjectInput)
      }

      if (response.success && response.data) {
        toast({
          title: "Success",
          description: response.message || `Project ${isEditing ? "updated" : "created"} successfully`,
        })

        if (onSuccess) {
          onSuccess(response.data)
        } else {
          router.push("/dashboard/projects")
        }
      } else {
        toast({
          title: "Error",
          description: response.error || `Failed to ${isEditing ? "update" : "create"} project`,
          variant: "destructive",
        })

        // Handle validation errors
        if (response.details && Array.isArray(response.details)) {
          response.details.forEach((error: any) => {
            if (error.path && error.message) {
              form.setError(error.path.join(".") as any, {
                type: "manual",
                message: error.message,
              })
            }
          })
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTechnology = () => {
    if (!newTechnology.trim()) return

    const currentTechnologies = watchedTechnologies || []
    if (currentTechnologies.includes(newTechnology.trim())) {
      toast({
        title: "Duplicate technology",
        description: "This technology is already in the list.",
        variant: "destructive",
      })
      return
    }

    form.setValue("technologies", [...currentTechnologies, newTechnology.trim()])
    setNewTechnology("")
  }

  const removeTechnology = (tech: string) => {
    const currentTechnologies = watchedTechnologies || []
    form.setValue(
      "technologies",
      currentTechnologies.filter((t) => t !== tech),
    )
  }

  const addTag = () => {
    if (!newTag.trim()) return

    const currentTags = watchedTags || []
    if (currentTags.includes(newTag.trim())) {
      toast({
        title: "Duplicate tag",
        description: "This tag is already in the list.",
        variant: "destructive",
      })
      return
    }

    form.setValue("tags", [...currentTags, newTag.trim()])
    setNewTag("")
  }

  const removeTag = (tag: string) => {
    const currentTags = watchedTags || []
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag),
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              {isEditing ? "Update the basic project information" : "Enter the basic project information"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project title" {...field} />
                    </FormControl>
                    <FormDescription>A clear and descriptive name for your project</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="robotics">Robotics</SelectItem>
                        <SelectItem value="ai-ml">AI/ML</SelectItem>
                        <SelectItem value="iot">IoT</SelectItem>
                        <SelectItem value="automation">Automation</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The category that best describes your project</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your project in detail..." className="min-h-32" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a comprehensive description of the project, its goals, and significance
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Current status of the project</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Project priority level</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progressPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Project completion percentage</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline & Budget</CardTitle>
            <CardDescription>Set project timeline and budget information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>When the project starts</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Leave empty for ongoing projects</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Project budget in USD</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technologies & Tags</CardTitle>
            <CardDescription>Add technologies used and relevant tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <FormLabel>Technologies *</FormLabel>
              <div className="flex gap-2 mt-2 mb-4">
                <Input
                  placeholder="Add a technology"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTechnology())}
                  className="flex-1"
                />
                <Button type="button" onClick={addTechnology} variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {watchedTechnologies?.map((tech) => (
                  <Badge key={tech} variant="secondary" className="px-3 py-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {tech}</span>
                    </button>
                  </Badge>
                ))}
              </div>

              {form.formState.errors.technologies && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.technologies.message}</p>
              )}

              <FormDescription>List the technologies, frameworks, and tools used in this project</FormDescription>
            </div>

            <div>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2 mt-2 mb-4">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {watchedTags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="px-3 py-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {tag}</span>
                    </button>
                  </Badge>
                ))}
              </div>

              <FormDescription>Add relevant tags to help categorize and search for this project</FormDescription>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links & Resources</CardTitle>
            <CardDescription>Add relevant links and resources for the project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/..." {...field} />
                    </FormControl>
                    <FormDescription>Link to the project's GitHub repository</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="repositoryUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>Alternative repository link (GitLab, Bitbucket, etc.)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="demoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Demo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>Link to a live demo or video demonstration</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentationUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documentation URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>Link to project documentation</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>URL to an image that represents your project</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured Project</FormLabel>
                    <FormDescription>Mark this project as featured to highlight it on the homepage</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Project" : "Create Project"}
          </Button>

          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
