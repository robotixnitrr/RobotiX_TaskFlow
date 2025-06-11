export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
  },
  tasks: "/api/tasks",
  projects: "/api/projects",
  team: "/api/team",
  stats: "/api/stats",
  notifications: "/api/notifications",
  user: {
    update: "/api/user/update",
  },
} as const

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  projects: "/projects",
  team: "/team",
  tasks: "/dashboard/tasks",
  createTask: "/dashboard/create-task",
  settings: "/dashboard/settings",
} as const

export const positionRank = {
  "head-coordinator": 4,
  "overall-coordinator": 3,
  "core-coordinator": 2,
  coordinator: 1,
  member: 0,
} as const

export const PERMISSIONS = {
  MANAGE_PROJECTS: ["head-coordinator", "overall-coordinator"],
  MANAGE_TEAM: ["head-coordinator", "overall-coordinator"],
  CREATE_TASKS: ["head-coordinator", "overall-coordinator", "core-coordinator"],
  VIEW_DASHBOARD: ["head-coordinator", "overall-coordinator", "core-coordinator", "coordinator", "member"],
} as const

export const PROJECT_STATUSES = [
  { value: "planning", label: "Planning" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "on-hold", label: "On Hold" },
] as const

export const PROJECT_CATEGORIES = [
  { value: "robotics", label: "Robotics" },
  { value: "ai-ml", label: "AI/ML" },
  { value: "iot", label: "IoT" },
  { value: "automation", label: "Automation" },
  { value: "research", label: "Research" },
  { value: "competition", label: "Competition" },
] as const

export const TASK_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
] as const

export const TASK_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const

export const APP_CONFIG = {
  name: "RobotiX TaskFlow",
  description: "A modern task management application for teams",
  version: "1.0.0",
  author: "RobotiX Club",
} as const

export const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  planning: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  "on-hold": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
} as const

export const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
} as const

export const POSITION_LABELS: Record<string, string> = {
  "overall-coordinator": "Overall Coordinator",
  "head-coordinator": "Head Coordinator",
  "core-coordinator": "Core Coordinator",
  coordinator: "Coordinator",
  member: "Member",
} as const
