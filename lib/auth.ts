import type { User } from "@/db/schema"
import { PERMISSIONS } from "./constants"

export class AuthService {
  static canManageProjects(user: User | null): boolean {
    if (!user?.position) return false
    return PERMISSIONS.MANAGE_PROJECTS.includes(user.position as any)
  }

  static canManageTeam(user: User | null): boolean {
    if (!user?.position) return false
    return PERMISSIONS.MANAGE_TEAM.includes(user.position as any)
  }

  static canCreateTasks(user: User | null): boolean {
    if (!user?.position) return false
    return PERMISSIONS.CREATE_TASKS.includes(user.position as any)
  }

  static canViewDashboard(user: User | null): boolean {
    if (!user?.position) return false
    return PERMISSIONS.VIEW_DASHBOARD.includes(user.position as any)
  }

  static hasPermission(user: User | null, permission: keyof typeof PERMISSIONS): boolean {
    if (!user?.position) return false
    return PERMISSIONS[permission].includes(user.position as any)
  }
}
