"use client"

import { useEffect, useState } from "react"
import UnifiedFlow, { type FlowChartUser } from "@/components/task-chart"
import type { TaskWithTypedAssignees } from "@/db/schema"
import { useAuth } from "@/hooks/use-auth"
import { getTasksByUserId } from "@/lib/actions"

const FlowPage = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<TaskWithTypedAssignees[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getTasksByUserId(user.id)
        setTasks(fetchedTasks)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [user])

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">Please log in to view your task flow</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading your task flow...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <UnifiedFlow user={user as FlowChartUser} tasks={tasks} />
    </div>
  )
}

export default FlowPage
