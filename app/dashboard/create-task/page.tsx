"use client"

import type React from "react"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createTask, getAssignees } from "@/lib/actions"
import type { User } from "@/db/schema"
import { Loader2, AlertCircle } from "lucide-react"

// Types for form data and validation
interface FormData {
  title: string
  description: string
  priority: "low" | "medium" | "high"
  dueDate: string
  assigneeId: string
}

interface FormErrors {
  title?: string
  description?: string
  priority?: string
  dueDate?: string
  assigneeId?: string
}

interface FormState {
  data: FormData
  errors: FormErrors
  touched: Record<keyof FormData, boolean>
  isSubmitting: boolean
  isValid: boolean
}

// Validation rules
const validationRules = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 500,
  },
  priority: {
    required: true,
    validValues: ["low", "medium", "high"],
  },
  dueDate: {
    required: true,
    minDate: new Date().toISOString().split('T')[0], // Today
  },
  assigneeId: {
    required: true,
  },
}

// Validation functions
const validateField = (name: keyof FormData, value: string): string | undefined => {
  const rules = validationRules[name]

  if (rules.required && !value.trim()) {
    return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`
  }

  switch (name) {
    case 'title': {
      const minLength = (validationRules.title as { minLength: number }).minLength
      const maxLength = (validationRules.title as { maxLength: number }).maxLength
      if (value.length < minLength) {
        return `Title must be at least ${minLength} characters`
      }
      if (value.length > maxLength) {
        return `Title must not exceed ${maxLength} characters`
      }
      break
    }
    case 'description': {
      const minLength = (validationRules.description as { minLength: number }).minLength
      const maxLength = (validationRules.description as { maxLength: number }).maxLength
      if (value.length < minLength) {
        return `Description must be at least ${minLength} characters`
      }
      if (value.length > maxLength) {
        return `Description must not exceed ${maxLength} characters`
      }
      break
    }
    case 'priority': {
      const validValues = (validationRules.priority as { validValues: string[] }).validValues
      if (!validValues.includes(value)) {
        return 'Please select a valid priority'
      }
      break
    }
    case 'dueDate': {
      const minDate = (validationRules.dueDate as { minDate: string }).minDate
      if (value < minDate) {
        return 'Due date cannot be in the past'
      }
      break
    }
    case 'assigneeId':
      if (!value) {
        return 'Please select an assignee'
      }
      break
  }

  return undefined
}

const validateForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {}

  Object.keys(data).forEach((key) => {
    const fieldName = key as keyof FormData
    const error = validateField(fieldName, data[fieldName])
    if (error) {
      errors[fieldName] = error
    }
  })

  return errors
}

export default function CreateTaskPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [assignees, setAssignees] = useState<User[]>([])
  const [assigneesLoading, setAssigneesLoading] = useState(true)

  // Enhanced form state
  const [formState, setFormState] = useState<FormState>({
    data: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      assigneeId: "",
    },
    errors: {},
    touched: {
      title: false,
      description: false,
      priority: false,
      dueDate: false,
      assigneeId: false,
    },
    isSubmitting: false,
    isValid: false,
  })

  // Memoized validation check
  const isFormValid = useMemo(() => {
    const errors = validateForm(formState.data)
    return Object.keys(errors).length === 0
  }, [formState.data])

  // Update form validity when data changes
  useEffect(() => {
    setFormState(prev => ({
      ...prev,
      isValid: isFormValid,
      errors: validateForm(prev.data)
    }))
  }, [isFormValid])

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
  })

  // Load assignees
  useEffect(() => {
    async function loadAssignees() {
      try {
        setAssigneesLoading(true)
        const fetchedAssignees = await getAssignees(user?.id || 0)
        setAssignees(fetchedAssignees)
      } catch (error) {
        console.error("Failed to load assignees:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load assignees.",
        })
      } finally {
        setAssigneesLoading(false)
      }
    }

    loadAssignees()
  }, [toast])

  // Optimized field update handler
  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormState(prev => {
      const newData = { ...prev.data, [field]: value }
      const fieldError = validateField(field, value)

      return {
        ...prev,
        data: newData,
        errors: {
          ...prev.errors,
          [field]: fieldError,
        },
        touched: {
          ...prev.touched,
          [field]: true,
        },
      }
    })
  }, [])

  // Input change handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    updateField(name as keyof FormData, value)
  }, [updateField])

  const handlePriorityChange = useCallback((value: string) => {
    updateField('priority', value)
  }, [updateField])

  const handleAssigneeChange = useCallback((value: string) => {
    updateField('assigneeId', value)
  }, [updateField])

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    // Mark all fields as touched to show validation errors
    setFormState(prev => ({
      ...prev,
      touched: {
        title: true,
        description: true,
        priority: true,
        dueDate: true,
        assigneeId: true,
      },
    }))

    // Validate form
    const errors = validateForm(formState.data)
    if (Object.keys(errors).length > 0) {
      setFormState(prev => ({ ...prev, errors }))
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form.",
      })
      return
    }

    try {
      setFormState(prev => ({ ...prev, isSubmitting: true }))

      // Find the selected assignee to get their name
      const selectedAssignee = assignees.find(a => a.id?.toString() === formState.data.assigneeId)
      if (!selectedAssignee) {
        throw new Error("Selected assignee not found")
      }

      const taskData = {
        title: formState.data.title.trim(),
        description: formState.data.description.trim(),
        status: "pending" as const,
        priority: formState.data.priority,
        dueDate: new Date(formState.data.dueDate),
        assignerId: Number(user.id),
        assignerName: user.name,
        assignee:
        {
          id: Number(selectedAssignee.id),
          name: selectedAssignee.name,
          assignedAt: new Date(),
        }

      }

      console.log("Submitting task data:", taskData)
      await createTask(taskData)

      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      })

      router.push("/dashboard/tasks")
    } catch (error) {
      console.error("Task creation error:", error)

      // More detailed error logging
      if (error instanceof Error) {
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }

      toast({
        variant: "destructive",
        title: "Failed to create task",
        description: error instanceof Error ? error.message : "There was an error creating your task. Please try again.",
      })
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  // Error display component
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null
    return (
      <div className="flex items-center gap-1 text-sm text-destructive mt-1">
        <AlertCircle className="h-3 w-3" />
        <span>{error}</span>
      </div>
    )
  }
  // Authorization check
  if (!user || user.position && user.position == "members") {
    return (
      <DashboardLayout>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Unauthorized</CardTitle>
            <CardDescription>You don't have permission to create tasks.</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div>
          {/* <h2 className="text-2xl font-bold tracking-tight">Create Task</h2> */}
          <p className="text-muted-foreground">Fill in the details below to create a new task.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>Provide the information needed for this task.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter task title"
                  value={formState.data.title}
                  onChange={handleInputChange}
                  className={formState.errors.title && formState.touched.title ? "border-destructive" : ""}
                />
                {formState.touched.title && <FieldError error={formState.errors.title} />}
                <div className="text-xs text-muted-foreground">
                  {formState.data.title.length}/{validationRules.title.maxLength}
                </div>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter task description"
                  value={formState.data.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={formState.errors.description && formState.touched.description ? "border-destructive" : ""}
                />
                {formState.touched.description && <FieldError error={formState.errors.description} />}
                <div className="text-xs text-muted-foreground">
                  {formState.data.description.length}/{validationRules.description.maxLength}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Priority Field */}
                <div className="space-y-2">
                  <Label>
                    Priority <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={formState.data.priority}
                    onValueChange={handlePriorityChange}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low" className="font-normal">
                        Low
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="font-normal">
                        Medium
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high" className="font-normal">
                        High
                      </Label>
                    </div>
                  </RadioGroup>
                  {formState.touched.priority && <FieldError error={formState.errors.priority} />}
                </div>

                {/* Due Date Field */}
                <div className="space-y-2">
                  <Label htmlFor="dueDate">
                    Due Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formState.data.dueDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={formState.errors.dueDate && formState.touched.dueDate ? "border-destructive" : ""}
                  />
                  {formState.touched.dueDate && <FieldError error={formState.errors.dueDate} />}
                </div>
              </div>

              {/* Assignee Field */}
              <div className="space-y-2">
                <Label>
                  Assign To <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formState.data.assigneeId}
                  onValueChange={handleAssigneeChange}
                  disabled={assigneesLoading}
                >
                  <SelectTrigger className={formState.errors.assigneeId && formState.touched.assigneeId ? "border-destructive" : ""}>
                    <SelectValue placeholder={assigneesLoading ? "Loading assignees..." : "Select an assignee"} />
                  </SelectTrigger>
                  <SelectContent>
                    {assignees.map((assignee) => (
                      <SelectItem key={assignee.id?.toString()} value={assignee.id?.toString() || ""}>
                        {assignee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formState.touched.assigneeId && <FieldError error={formState.errors.assigneeId} />}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                disabled={formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formState.isSubmitting || !formState.isValid || assigneesLoading}
              >
                {formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Task"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
