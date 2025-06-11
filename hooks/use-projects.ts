"use client"

import { useState, useEffect, useCallback } from "react"
import { ProjectsAPI } from "@/lib/api/projects"
import type { ProjectWithDetails } from "@/db/schema"
import type { ProjectQueryInput } from "@/lib/validations/project"
import { toast } from "@/components/ui/use-toast"

export interface UseProjectsOptions {
  initialParams?: Partial<ProjectQueryInput>
  autoFetch?: boolean
}

export interface UseProjectsReturn {
  projects: ProjectWithDetails[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  refetch: () => Promise<void>
  updateParams: (params: Partial<ProjectQueryInput>) => void
  currentParams: Partial<ProjectQueryInput>
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const { initialParams = {}, autoFetch = true } = options

  const [projects, setProjects] = useState<ProjectWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)
  const [currentParams, setCurrentParams] = useState<Partial<ProjectQueryInput>>(initialParams)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await ProjectsAPI.getProjects(currentParams)

      if (response.success && response.data) {
        console.log(response)
        setProjects(response.data.projects)
        setPagination(response.pagination || null)
      } else {
        setError(response.error || "Failed to fetch projects")
        toast({
          title: "Error",
          description: response.error || "Failed to fetch projects",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentParams])

  const updateParams = useCallback((newParams: Partial<ProjectQueryInput>) => {
    setCurrentParams((prev) => ({ ...prev, ...newParams }))
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchProjects()
    }
  }, [fetchProjects, autoFetch])

  return {
    projects,
    loading,
    error,
    pagination,
    refetch: fetchProjects,
    updateParams,
    currentParams,
  }
}

export interface UseProjectReturn {
  project: ProjectWithDetails | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProject(id: number | null): UseProjectReturn {
  const [project, setProject] = useState<ProjectWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      const response = await ProjectsAPI.getProject(id)

      if (response.success && response.data) {
        setProject(response.data)
      } else {
        setError(response.error || "Failed to fetch project")
        toast({
          title: "Error",
          description: response.error || "Failed to fetch project",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  return {
    project,
    loading,
    error,
    refetch: fetchProject,
  }
}
