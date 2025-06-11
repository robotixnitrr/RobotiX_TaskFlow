import { z } from "zod"
import { projectStatusEnum, projectCategoryEnum, projectPriorityEnum } from "@/db/schema"

// Base project validation schema
export const projectSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters")
    .trim(),
  status: z.enum(projectStatusEnum, {
    errorMap: () => ({ message: "Invalid project status" }),
  }),
  category: z.enum(projectCategoryEnum, {
    errorMap: () => ({ message: "Invalid project category" }),
  }),
  priority: z.enum(projectPriorityEnum).default("medium"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  endDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid end date",
    })
    .optional(),
  teamLeadId: z.number().int().positive("Team lead ID must be a positive integer"),
  teamLeadName: z.string().min(1, "Team lead name is required").trim(),
  technologies: z.array(z.string().trim()).min(1, "At least one technology is required"),
  tags: z.array(z.string().trim()).default([]),
  budget: z.number().positive("Budget must be positive").max(1000000, "Budget cannot exceed $1,000,000").optional(),
  progressPercentage: z
    .number()
    .int()
    .min(0, "Progress cannot be negative")
    .max(100, "Progress cannot exceed 100%")
    .default(0),
  githubUrl: z
    .string()
    .url("Invalid GitHub URL")
    .refine((url) => url.includes("github.com"), {
      message: "Must be a valid GitHub URL",
    })
    .optional()
    .or(z.literal("")),
  repositoryUrl: z.string().url("Invalid repository URL").optional().or(z.literal("")),
  demoUrl: z.string().url("Invalid demo URL").optional().or(z.literal("")),
  documentationUrl: z.string().url("Invalid documentation URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
})

// Create project schema with additional validations
export const createProjectSchema = projectSchema.refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return new Date(data.endDate) > new Date(data.startDate)
    }
    return true
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  },
)

// Update project schema (all fields optional except id)
export const updateProjectSchema = projectSchema.partial().extend({
  id: z.number().int().positive("Project ID must be a positive integer"),
})

// Project member schema
export const projectMemberSchema = z.object({
  projectId: z.number().int().positive("Project ID must be a positive integer"),
  userId: z.number().int().positive("User ID must be a positive integer"),
  role: z.string().min(1, "Role is required").max(50, "Role must be less than 50 characters").trim(),
  contributions: z.string().max(500, "Contributions must be less than 500 characters").optional(),
})

// Project update schema
export const projectUpdateSchema = z.object({
  projectId: z.number().int().positive("Project ID must be a positive integer"),
  userId: z.number().int().positive("User ID must be a positive integer"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters")
    .trim(),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  updateType: z.enum(["general", "milestone", "issue", "achievement"]).default("general"),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
        type: z.string(),
      }),
    )
    .default([]),
})

// Milestone schema
export const milestoneSchema = z.object({
  projectId: z.number().int().positive("Project ID must be a positive integer"),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters").trim(),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid milestone date",
  }),
  completed: z.boolean().default(false),
})

// Update milestone schema (all fields optional)
export const updateMilestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters").trim().optional(),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid milestone date",
    })
    .optional(),
  completed: z.boolean().optional(),
})


// Resource schema
export const resourceSchema = z.object({
  name: z.string().min(1, "Resource name is required").trim(),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  cost: z.number().positive("Cost must be positive"),
  supplier: z.string().max(100, "Supplier name must be less than 100 characters").optional(),
})

// Query parameters schema
export const projectQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.enum(projectStatusEnum).optional(),
  category: z.enum(projectCategoryEnum).optional(),
  priority: z.enum(projectPriorityEnum).optional(),
  teamLeadId: z.coerce.number().int().positive().optional(),
  featured: z.coerce.boolean().optional(),
  sortBy: z.enum(["title", "startDate", "updatedAt", "priority", "progress"]).default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ProjectMemberInput = z.infer<typeof projectMemberSchema>
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>
export type MilestoneInput = z.infer<typeof milestoneSchema>
export type ResourceInput = z.infer<typeof resourceSchema>
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>
