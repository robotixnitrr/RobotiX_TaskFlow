export interface TeamMember {
  id: number
  projectId: number
  userId: number
  role: string
  joinedAt: string
  leftAt: string | null
  isActive: boolean
  contributions: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: number
    name: string
    email: string
    position: string
    avatarUrl?: string | null
  }
}

export interface CreateTeamMemberInput {
  projectId: number
  userId: number
  role: string
  contributions?: string
}

export interface UpdateTeamMemberInput {
  role?: string
  contributions?: string
  isActive?: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
  message?: string
}

export class TeamMembersAPI {
  private static baseUrl = "/api/projects"

  static async getTeamMembers(projectId: number): Promise<ApiResponse<TeamMember[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/members`, {
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
      console.error("Error fetching team members:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch team members",
      }
    }
  }

  static async addTeamMember(data: CreateTeamMemberInput): Promise<ApiResponse<TeamMember>> {
    try {
      const response = await fetch(`${this.baseUrl}/${data.projectId}/members`, {
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
          error: result.error || "Failed to add team member",
          details: result.details,
        }
      }

      return result
    } catch (error) {
      console.error("Error adding team member:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to add team member",
      }
    }
  }

  static async updateTeamMember(
    projectId: number,
    userId: number,
    data: UpdateTeamMemberInput,
  ): Promise<ApiResponse<TeamMember>> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/members/${userId}`, {
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
          error: result.error || "Failed to update team member",
          details: result.details,
        }
      }

      return result
    } catch (error) {
      console.error("Error updating team member:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update team member",
      }
    }
  }

  static async removeTeamMember(projectId: number, userId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/members/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Failed to remove team member",
          details: result.details,
        }
      }

      return result
    } catch (error) {
      console.error("Error removing team member:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to remove team member",
      }
    }
  }

  static async getAvailableUsers(projectId: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/members/available`, {
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
      console.error("Error fetching available users:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch available users",
      }
    }
  }
}
