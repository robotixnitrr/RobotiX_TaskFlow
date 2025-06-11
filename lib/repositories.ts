import { db } from "@/db"
import {
  type CreateTaskInput,
  type CreateUserInput,
  tasks,
  type UpdateTaskInput,
  users,
  projects,
  projectMembers,
  projectUpdates,
  type CreateProjectInput,
  type UpdateProjectInput,
  type CreateProjectMemberInput,
  type CreateProjectUpdateInput,
  type ProjectWithDetails,
  milestones,
  UpdateMilestoneInput,
  CreateMilestoneInput,
} from "@/db/schema"
import { eq, and, sql, ilike, inArray, or, not, desc, asc, count } from "drizzle-orm"
import { alias, PgSelect } from "drizzle-orm/pg-core"
import { positionRank } from "./constants"

export class UserRepository {
  static async findByEmail(email: string) {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email),
    })
    return result
  }

  static async findById(id: number) {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    })
    return result
  }

  static async create(userData: CreateUserInput) {
    try {
      const [user] = await db.insert(users).values(userData).returning()
      return user
    } catch (error: any) {
      if (error.message.includes("duplicate key")) {
        throw new Error("User with this email already exists")
      }
      throw new Error("Failed to create user")
    }
  }

  static async findAssignees(currentUserId: number) {
    const currentUser = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, currentUserId),
    })

    if (!currentUser) throw new Error("Current user not found")

    type Position = keyof typeof positionRank

    const currentRank = positionRank[currentUser.position as Position]

    // Get positions with equal or lower rank
    const allowedPositions = Object.entries(positionRank)
      .filter(([_, rank]) => rank <= currentRank)
      .map(([pos]) => pos as Position)

    return db
      .select()
      .from(users)
      .where(
        and(
          inArray(users.position, allowedPositions as readonly Position[]), // Allowed positions
          not(eq(users.id, currentUserId)), // Exclude current user
        ),
      )
      .orderBy(users.name)
  }

  static async findAll() {
    return db.select().from(users).orderBy(users.createdAt)
  }

  static async update(id: number, updates: Partial<typeof users.$inferInsert>) {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return updatedUser ?? null
  }

  static async delete(id: number) {
    const result = await db.delete(users).where(eq(users.id, id))
    return result?.rowCount && result.rowCount > 0
  }
}

// Helper function to get the base query structure
const assigner = alias(users, "assigner")

export const getBaseTaskQuery = () => {
  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      assignerId: tasks.assignerId,
      assignerName: assigner.name,
      assignees: tasks.assignees,
      projectId: tasks.projectId,
    })
    .from(tasks)
    .leftJoin(assigner, eq(assigner.id, tasks.assignerId))
}

export class TaskRepository {
  static async findAll() {
    return getBaseTaskQuery()
  }

  static async findById(id: number) {
    return db.query.tasks.findFirst({ where: eq(tasks.id, id) })
  }

  static async findByAssignee(assigneeId: number) {
    return getBaseTaskQuery()
      .where(
        sql`EXISTS (
            SELECT 1 FROM jsonb_array_elements(${tasks.assignees}) AS assignee
            WHERE (assignee->>'id')::int = ${assigneeId}
          )`,
      )
      .orderBy(sql`${tasks.createdAt} DESC`)
  }

  static async findByAssigner(assignerId: number) {
    return getBaseTaskQuery().where(eq(tasks.assignerId, assignerId)).orderBy(sql`${tasks.createdAt} DESC`)
  }

  static async create(taskData: CreateTaskInput) {
    const [task] = await db.insert(tasks).values(taskData).returning()
    return task
  }

  static async update(id: number, updates: UpdateTaskInput) {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning()
    return task ?? null
  }

  static async delete(id: number) {
    const result = await db.delete(tasks).where(eq(tasks.id, id))
    return result?.rowCount && result.rowCount > 0
  }

  static async findByStatus(status: string) {
    return getBaseTaskQuery()
      .where(eq(tasks.status, status as "pending" | "in-progress" | "completed"))
      .orderBy(sql`${tasks.createdAt} DESC`)
  }

  static async findByPriority(priority: string) {
    return getBaseTaskQuery()
      .where(eq(tasks.priority, priority as "low" | "medium" | "high"))
      .orderBy(sql`${tasks.createdAt} DESC`)
  }

  static async count() {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(tasks)
    return Number(count)
  }

  static async getStats() {
    const result = await db.execute(sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
      COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority,
      COUNT(*) FILTER (WHERE priority = 'low') as low_priority
    FROM tasks
  `)

    const row = (result as any).rows?.[0]

    return {
      total: Number(row.total),
      pending: Number(row.pending),
      inProgress: Number(row.in_progress),
      completed: Number(row.completed),
      highPriority: Number(row.high_priority),
      mediumPriority: Number(row.medium_priority),
      lowPriority: Number(row.low_priority),
    }
  }

  static async search(
    query: string,
    filters?: {
      status?: string[]
      priority?: string[]
      assigneeId?: number
      assignerId?: number
    },
  ) {
    const whereConditions = [or(ilike(tasks.title, `%${query}%`), ilike(tasks.description, `%${query}%`))]

    if (filters?.status?.length) {
      whereConditions.push(inArray(tasks.status, filters.status as any))
    }

    if (filters?.priority?.length) {
      whereConditions.push(inArray(tasks.priority, filters.priority as any))
    }

    if (filters?.assigneeId) {
      whereConditions.push(
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements(${tasks.assignees}) AS assignee
          WHERE (assignee->>'id')::int = ${filters.assigneeId}
        )`,
      )
    }

    if (filters?.assignerId) {
      whereConditions.push(eq(tasks.assignerId, filters.assignerId))
    }

    return getBaseTaskQuery()
      .where(and(...whereConditions))
      .orderBy(sql`${tasks.createdAt} DESC`)
  }
}

// Enhanced Project Repository with full CRUD operations
const teamLead = alias(users, "teamLead")

export const getBaseProjectQuery = (): PgSelect => {
  return db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      status: projects.status,
      category: projects.category,
      priority: projects.priority,
      startDate: projects.startDate,
      endDate: projects.endDate,
      teamLeadId: projects.teamLeadId,
      teamLeadName: teamLead.name,
      teamMembers: projects.teamMembers,
      technologies: projects.technologies,
      tags: projects.tags,
      budget: projects.budget,
      progressPercentage: projects.progressPercentage,
      githubUrl: projects.githubUrl,
      repositoryUrl: projects.repositoryUrl,
      demoUrl: projects.demoUrl,
      documentationUrl: projects.documentationUrl,
      imageUrl: projects.imageUrl,
      isFeatured: projects.isFeatured,
      milestones: projects.milestones,
      resources: projects.resources,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .leftJoin(teamLead, eq(teamLead.id, projects.teamLeadId)) as unknown as PgSelect;
};

export class ProjectRepository {
  static async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    priority?: string;
    teamLeadId?: number;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        category,
        priority,
        teamLeadId,
        featured,
        sortBy = "updatedAt",
        sortOrder = "desc",
      } = options || {};

      const whereConditions = [];

      if (search) {
        whereConditions.push(
          or(
            ilike(projects.title, `%${search}%`),
            ilike(projects.description, `%${search}%`),
            sql`EXISTS (
            SELECT 1 FROM unnest(${projects.technologies}) AS tech
            WHERE tech ILIKE ${`%${search}%`}
          )`,
          ),
        );
      }

      if (status) {
        whereConditions.push(eq(projects.status, status));
      }

      if (category) {
        whereConditions.push(eq(projects.category, category));
      }

      if (priority) {
        whereConditions.push(eq(projects.priority, priority));
      }

      if (teamLeadId) {
        whereConditions.push(eq(projects.teamLeadId, teamLeadId));
      }

      if (featured !== undefined) {
        whereConditions.push(eq(projects.isFeatured, featured));
      }

      const sortColumn =
        {
          title: projects.title,
          startDate: projects.startDate,
          updatedAt: projects.updatedAt,
          priority: projects.priority,
          progress: projects.progressPercentage,
        }[sortBy] || projects.updatedAt;

      const query = db
        .select({
          id: projects.id,
          title: projects.title,
          description: projects.description,
          status: projects.status,
          category: projects.category,
          priority: projects.priority,
          startDate: projects.startDate,
          endDate: projects.endDate,
          teamLeadId: projects.teamLeadId,
          teamLeadName: teamLead.name,
          teamMembers: projects.teamMembers,
          technologies: projects.technologies,
          tags: projects.tags,
          budget: projects.budget,
          progressPercentage: projects.progressPercentage,
          githubUrl: projects.githubUrl,
          repositoryUrl: projects.repositoryUrl,
          demoUrl: projects.demoUrl,
          documentationUrl: projects.documentationUrl,
          imageUrl: projects.imageUrl,
          isFeatured: projects.isFeatured,
          milestones: projects.milestones,
          resources: projects.resources,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
        })
        .from(projects)
        .leftJoin(teamLead, eq(teamLead.id, projects.teamLeadId))
        .where(and(...whereConditions))
        .orderBy(sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn))
        .limit(limit)
        .offset((page - 1) * limit);

      const totalQuery = db
        .select({ count: count() })
        .from(projects)
        .where(and(...whereConditions));

      const [result, [{ count: total }]] = await Promise.all([query, totalQuery]);

      return {
        projects: result,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error in ProjectRepository.findAll:", error);
      throw new Error("Failed to fetch projects");
    }
  }

  static async findById(id: number): Promise<ProjectWithDetails | null> {
    try {
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, id),
        with: {
          teamLead: true,
          members: {
            with: {
              user: true,
            },
            where: eq(projectMembers.isActive, true),
          },
          updates: {
            with: {
              user: true,
            },
            orderBy: desc(projectUpdates.createdAt),
            limit: 10,
          },
        },
      })

      if (!project) return null

      return {
        ...project,
        teamMembers: (project.teamMembers as any) || [],
        milestones: (project.milestones as any) || [],
        resources: (project.resources as any) || [],
      }
    } catch (error) {
      console.error("Error in ProjectRepository.findById:", error)
      throw new Error("Failed to fetch project")
    }
  }

  static async findByTeamLead(teamLeadId: number) {
    return getBaseProjectQuery().where(eq(projects.teamLeadId, teamLeadId)).orderBy(sql`${projects.createdAt} DESC`)
  }

  static async create(projectData: CreateProjectInput) {
    try {
      const [project] = await db
        .insert(projects)
        .values({
          ...projectData,
          updatedAt: new Date(),
        })
        .returning()

      return project
    } catch (error) {
      console.error("Error in ProjectRepository.create:", error)
      throw new Error("Failed to create project")
    }
  }

  static async update(id: number, updates: UpdateProjectInput) {
    try {
      const [project] = await db
        .update(projects)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning()

      return project ?? null
    } catch (error) {
      console.error("Error in ProjectRepository.update:", error)
      throw new Error("Failed to update project")
    }
  }

  static async delete(id: number) {
    try {
      const result = await db.delete(projects).where(eq(projects.id, id))
      return result?.rowCount && result.rowCount > 0
    } catch (error) {
      console.error("Error in ProjectRepository.delete:", error)
      throw new Error("Failed to delete project")
    }
  }

  static async findByStatus(status: string) {
    return getBaseProjectQuery()
      .where(eq(projects.status, status as "planning" | "in-progress" | "completed" | "on-hold"))
      .orderBy(sql`${projects.createdAt} DESC`)
  }

  static async findByCategory(category: string) {
    return getBaseProjectQuery()
      .where(
        eq(projects.category, category as "robotics" | "ai-ml" | "iot" | "automation" | "research" | "competition"),
      )
      .orderBy(sql`${projects.createdAt} DESC`)
  }

  static async count() {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(projects)
    return Number(count)
  }

  static async getStats() {
    try {
      const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'planning') as planning,
        COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'on-hold') as on_hold,
        COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
        COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority,
        COUNT(*) FILTER (WHERE priority = 'low') as low_priority,
        COUNT(*) FILTER (WHERE is_featured = true) as featured,
        AVG(progress_percentage) as avg_progress,
        SUM(budget) as total_budget
      FROM projects
    `)

      const row = (result as any).rows?.[0]

      return {
        total: Number(row.total),
        planning: Number(row.planning),
        inProgress: Number(row.in_progress),
        completed: Number(row.completed),
        onHold: Number(row.on_hold),
        highPriority: Number(row.high_priority),
        mediumPriority: Number(row.medium_priority),
        lowPriority: Number(row.low_priority),
        featured: Number(row.featured),
        avgProgress: Number(row.avg_progress) || 0,
        totalBudget: Number(row.total_budget) || 0,
      }
    } catch (error) {
      console.error("Error in ProjectRepository.getStats:", error)
      return {
        total: 0,
        planning: 0,
        inProgress: 0,
        completed: 0,
        onHold: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        featured: 0,
        avgProgress: 0,
        totalBudget: 0,
      }
    }
  }

  static async search(
    query: string,
    filters?: {
      status?: string[]
      category?: string[]
      priority?: string[]
      teamLeadId?: number
    },
  ) {
    const whereConditions = [
      or(
        ilike(projects.title, `%${query}%`),
        ilike(projects.description, `%${query}%`),
        sql`EXISTS (
          SELECT 1 FROM unnest(${projects.technologies}) AS tech
          WHERE tech ILIKE ${`%${query}%`}
        )`,
      ),
    ]

    if (filters?.status?.length) {
      whereConditions.push(inArray(projects.status, filters.status as any))
    }

    if (filters?.category?.length) {
      whereConditions.push(inArray(projects.category, filters.category as any))
    }

    if (filters?.priority?.length) {
      whereConditions.push(inArray(projects.priority, filters.priority as any))
    }

    if (filters?.teamLeadId) {
      whereConditions.push(eq(projects.teamLeadId, filters.teamLeadId))
    }

    return getBaseProjectQuery()
      .where(and(...whereConditions))
      .orderBy(sql`${projects.createdAt} DESC`)
  }
}

// Milestone Repository
export class MilestoneRepository {
  static async findByProject(projectId: number) {
    try {
      return db.query.milestones.findMany({
        where: eq(milestones.projectId, projectId),
        orderBy: [asc(milestones.date), asc(milestones.createdAt)],
        with: {
          creator: true,
        },
      })
    } catch (error) {
      console.error("Error in MilestoneRepository.findByProject:", error)
      throw new Error("Failed to fetch project milestones")
    }
  }

  static async findById(id: number, projectId: number) {
    try {
      return db.query.milestones.findFirst({
        where: and(eq(milestones.id, id), eq(milestones.projectId, projectId)),
        with: {
          creator: true,
        },
      })
    } catch (error) {
      console.error("Error in MilestoneRepository.findById:", error)
      throw new Error("Failed to fetch milestone")
    }
  }

  static async create(milestoneData: CreateMilestoneInput) {
    try {
      const [milestone] = await db.insert(milestones).values(milestoneData).returning()

      return milestone
    } catch (error) {
      console.error("Error in MilestoneRepository.create:", error)
      throw new Error("Failed to create milestone")
    }
  }

  static async update(id: number, projectId: number, updates: UpdateMilestoneInput) {
    try {
      const [milestone] = await db
        .update(milestones)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(milestones.id, id), eq(milestones.projectId, projectId)))
        .returning()

      return milestone ?? null
    } catch (error) {
      console.error("Error in MilestoneRepository.update:", error)
      throw new Error("Failed to update milestone")
    }
  }

  static async delete(id: number, projectId: number) {
    try {
      const result = await db.delete(milestones).where(and(eq(milestones.id, id), eq(milestones.projectId, projectId)))

      return result?.rowCount && result.rowCount > 0
    } catch (error) {
      console.error("Error in MilestoneRepository.delete:", error)
      throw new Error("Failed to delete milestone")
    }
  }

  static async toggleCompletion(id: number, projectId: number) {
    try {
      const milestone = await this.findById(id, projectId)
      if (!milestone) return null

      const [updatedMilestone] = await db
        .update(milestones)
        .set({
          completed: !milestone.completed,
          updatedAt: new Date(),
        })
        .where(and(eq(milestones.id, id), eq(milestones.projectId, projectId)))
        .returning()

      return updatedMilestone
    } catch (error) {
      console.error("Error in MilestoneRepository.toggleCompletion:", error)
      throw new Error("Failed to toggle milestone completion")
    }
  }
}


// Project Members Repository
export class ProjectMemberRepository {
  static async findByProject(projectId: number) {
    return db.query.projectMembers.findMany({
      where: and(eq(projectMembers.projectId, projectId), eq(projectMembers.isActive, true)),
      with: {
        user: true,
      },
      orderBy: projectMembers.joinedAt,
    })
  }

  static async addMember(memberData: CreateProjectMemberInput) {
    try {
      const [member] = await db.insert(projectMembers).values(memberData).returning()
      return member
    } catch (error: any) {
      if (error.message.includes("duplicate key")) {
        throw new Error("User is already a member of this project")
      }
      throw new Error("Failed to add project member")
    }
  }

  static async removeMember(projectId: number, userId: number) {
    const [member] = await db
      .update(projectMembers)
      .set({ isActive: false, leftAt: new Date(), updatedAt: new Date() })
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
      .returning()

    return member ?? null
  }

  static async updateMember(projectId: number, userId: number, updates: Partial<CreateProjectMemberInput>) {
    const [member] = await db
      .update(projectMembers)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
      .returning()

    return member ?? null
  }
}

// Project Updates Repository
export class ProjectUpdateRepository {
  static async findByProject(projectId: number, limit = 10) {
    return db.query.projectUpdates.findMany({
      where: eq(projectUpdates.projectId, projectId),
      with: {
        user: true,
      },
      orderBy: desc(projectUpdates.createdAt),
      limit,
    })
  }

  static async create(updateData: CreateProjectUpdateInput) {
    const [update] = await db.insert(projectUpdates).values(updateData).returning()
    return update
  }

  static async delete(id: number) {
    const result = await db.delete(projectUpdates).where(eq(projectUpdates.id, id))
    return result?.rowCount && result.rowCount > 0
  }
}