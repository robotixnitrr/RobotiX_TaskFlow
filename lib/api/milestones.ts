export interface Milestone {
  id: number
  projectId: number
  title: string
  description: string | null
  date: string
  completed: boolean
  createdBy: number | null
  createdAt: string
  updatedAt: string
  creator?: {
    id: number
    name: string
    avatarUrl?: string | null
  }
}

export interface CreateMilestoneInput {
  projectId: number
  title: string
  description?: string
  date: string
  completed?: boolean
}

export interface UpdateMilestoneInput {
  title?: string
  description?: string
  date?: string
  completed?: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
  message?: string
}

export class MilestonesAPI {
  private static baseUrl = "/api/projects"

  static async getMilestones(projectId: number): Promise<ApiResponse<Milestone[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/milestones`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log(response)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching milestones:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch milestones",
      }
    }
  }

  static async getMilestone(projectId: number, milestoneId: number): Promise<ApiResponse<Milestone>> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/milestones/${milestoneId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching milestone:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch milestone",
      }
    }
  }

  static async createMilestone(data: CreateMilestoneInput): Promise<ApiResponse<Milestone>> {
    try {
      const response = await fetch(`${this.baseUrl}/${data.projectId}/milestones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to create milestone",
          details: result.details,
        }
      }

      return result
    } catch (error) {
      console.error("Error creating milestone:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create milestone",
      }
    }
  }

  static async updateMilestone(
    projectId: number,
    milestoneId: number,
    data: UpdateMilestoneInput,
  ): Promise<ApiResponse<Milestone>> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/milestones/${milestoneId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to update milestone",
          details: result.details,
        }
      }

      return result
    } catch (error) {
      console.error("Error updating milestone:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update milestone",
      }
    }
  }

  static async deleteMilestone(projectId: number, milestoneId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/milestones/${milestoneId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to delete milestone",
          details: result.details,
        }
      }

      return result
    } catch (error) {
      console.error("Error deleting milestone:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete milestone",
      }
    }
  }
}
