import { pgTable, serial, text, timestamp, integer, date, jsonb, index, decimal, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
// import { Assignee } from "@/lib/types"

// Users table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    password: text("password").notNull(),
    position: text("position").default("member"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    githubUrl: text("github_url"),
    linkedinUrl: text("linkedin_url"),
    lastNotificationReadAt: timestamp("last_notification_read_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
  }),
)

// Projects table
export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: text("status").notNull().default("planning"),
    category: text("category").notNull(),
    priority: text("priority").default("medium"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    teamLeadId: integer("team_lead_id").references(() => users.id),
    teamLeadName: text("team_lead_name").notNull(),
    teamMembers: jsonb("team_members").default([]),
    technologies: text("technologies").array().default([]),
    tags: text("tags").array().default([]),
    budget: decimal("budget", { precision: 10, scale: 2 }),
    progressPercentage: integer("progress_percentage").default(0),
    githubUrl: text("github_url"),
    repositoryUrl: text("repository_url"),
    demoUrl: text("demo_url"),
    documentationUrl: text("documentation_url"),
    imageUrl: text("image_url"),
    isFeatured: boolean("is_featured").default(false),
    milestones: jsonb("milestones").default([]),
    resources: jsonb("resources").default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    statusIdx: index("idx_projects_status").on(table.status),
    categoryIdx: index("idx_projects_category").on(table.category),
    priorityIdx: index("idx_projects_priority").on(table.priority),
    teamLeadIdx: index("idx_projects_team_lead").on(table.teamLeadId),
    featuredIdx: index("idx_projects_featured").on(table.isFeatured),
    tagsIdx: index("idx_projects_tags").on(table.tags),
  }),
)

// Project Members table
export const projectMembers = pgTable(
  "project_members",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
    leftAt: timestamp("left_at", { withTimezone: true }),
    isActive: boolean("is_active").default(true),
    contributions: text("contributions"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    projectIdx: index("idx_project_members_project").on(table.projectId),
    userIdx: index("idx_project_members_user").on(table.userId),
    uniqueProjectUser: index("idx_project_members_unique").on(table.projectId, table.userId),
  }),
)

// Project Updates table
export const projectUpdates = pgTable(
  "project_updates",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    description: text("description"),
    updateType: text("update_type").default("general"),
    attachments: jsonb("attachments").default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    projectIdx: index("idx_project_updates_project").on(table.projectId),
    typeIdx: index("idx_project_updates_type").on(table.updateType),
  }),
)


// Milestones table
export const milestones = pgTable(
  "milestones",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    date: date("date").notNull(),
    completed: boolean("completed").default(false),
    createdBy: integer("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    projectIdx: index("idx_milestones_project").on(table.projectId),
    dateIdx: index("idx_milestones_date").on(table.date),
  }),
)

// Tasks table
export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().default("pending"),
    priority: text("priority").notNull().default("medium"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    assignerId: integer("assigner_id").references(() => users.id),
    assignerName: text("assigner_name").notNull(),
    assignees: jsonb("assignees").default([]),
    projectId: integer("project_id").references(() => projects.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    statusIdx: index("idx_tasks_status").on(table.status),
    priorityIdx: index("idx_tasks_priority").on(table.priority),
    assignerIdx: index("idx_tasks_assigner").on(table.assignerId),
    projectIdx: index("idx_tasks_project").on(table.projectId),
  }),
)

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedTasks: many(tasks),
  ledProjects: many(projects),
  projectMemberships: many(projectMembers),
  projectUpdates: many(projectUpdates),
  createdMilestones: many(milestones),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  teamLead: one(users, {
    fields: [projects.teamLeadId],
    references: [users.id],
  }),
  members: many(projectMembers),
  updates: many(projectUpdates),
  tasks: many(tasks),
  milestones: many(milestones),
}))

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}))

export const projectUpdatesRelations = relations(projectUpdates, ({ one }) => ({
  project: one(projects, {
    fields: [projectUpdates.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectUpdates.userId],
    references: [users.id],
  }),
}))

export const milestonesRelations = relations(milestones, ({ one }) => ({
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [milestones.createdBy],
    references: [users.id],
  }),
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
  assigner: one(users, {
    fields: [tasks.assignerId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
}))

// Types
export type User = typeof users.$inferSelect
export type CreateUserInput = typeof users.$inferInsert
export type UpdateUserInput = Partial<CreateUserInput>

export type Project = typeof projects.$inferSelect
export type CreateProjectInput = typeof projects.$inferInsert
export type UpdateProjectInput = Partial<CreateProjectInput>

export type ProjectMember = typeof projectMembers.$inferSelect
export type CreateProjectMemberInput = typeof projectMembers.$inferInsert
export type UpdateProjectMemberInput = Partial<CreateProjectMemberInput>

export type ProjectUpdate = typeof projectUpdates.$inferSelect
export type CreateProjectUpdateInput = typeof projectUpdates.$inferInsert
export type UpdateProjectUpdateInput = Partial<CreateProjectUpdateInput>

export type Milestone = typeof milestones.$inferSelect
export type CreateMilestoneInput = typeof milestones.$inferInsert
export type UpdateMilestoneInput = Partial<CreateMilestoneInput>

export type Task = typeof tasks.$inferSelect
export type CreateTaskInput = typeof tasks.$inferInsert
export type UpdateTaskInput = Partial<CreateTaskInput>

// Extended types with typed JSON fields
export interface TeamMember {
  id: number
  name: string
  role: string
  joinedAt?: string
}

// export interface Assignee {
//   id: number
//   name: string
//   assignedAt: string
// }
export interface Assignee {
  id: number;
  name: string;
  assignedAt: Date;
}


export interface ProjectWithTypedMembers extends Omit<Project, "teamMembers"> {
  teamMembers: TeamMember[]
}

export interface MilestoneJson {
  title: string
  completed: boolean
  date: string
  description?: string
}

export interface Resource {
  name: string
  quantity: number
  cost: number
  supplier?: string
}

export interface ProjectWithDetails extends Omit<Project, "teamMembers" | "milestones" | "resources"> {
  teamMembers: TeamMember[]
  milestones: MilestoneJson[]
  resources: Resource[]
  members?: ProjectMember[]
  updates?: ProjectUpdate[]
}

export interface TaskWithTypedAssignees extends Omit<Task, "assignees"> {
  assignees: Assignee[]
}


// Validation schemas
export const projectStatusEnum = ["planning", "in-progress", "completed", "on-hold"] as const
export const projectCategoryEnum = ["robotics", "ai-ml", "iot", "automation", "research", "competition"] as const
export const projectPriorityEnum = ["low", "medium", "high"] as const
export const updateTypeEnum = ["general", "milestone", "issue", "achievement"] as const

export type ProjectStatus = (typeof projectStatusEnum)[number]
export type ProjectCategory = (typeof projectCategoryEnum)[number]
export type ProjectPriority = (typeof projectPriorityEnum)[number]
export type UpdateType = (typeof updateTypeEnum)[number]

