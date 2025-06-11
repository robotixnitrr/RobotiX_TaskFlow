"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { getNotifications, markNotificationsAsRead } from "@/lib/actions"
import { Bell, ClipboardList, Home, LogOut, PlusCircle, Settings, User, Zap, Code } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, updateUser } = useAuth()
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      if (!user?.id) return

      try {
        setIsLoading(true)
        const userNotifications = await getNotifications(Number(user.id))
        setNotifications(userNotifications)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchNotifications()
    }
  }, [user?.id])

  // const markNotificationAsRead = (notificationId: string) => {
  //   setNotifications((prev) =>
  //     prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
  //   )
  // }

  if (!user || !isMounted) {
    return null
  }

  const canAssignTasks = ["overall-coordinator", "head-coordinator", "core-coordinator"].includes(user.position || "")
  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const unreadNotifications = notifications.filter((n) => !n.read)

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/dashboard/tasks") return "Tasks"
    if (pathname === "/dashboard/create-task") return "Create Task"
    if (pathname === "/dashboard/projects") return "Projects"
    if (pathname === "/dashboard/create-project") return "Create Project"
    if (pathname === "/dashboard/settings") return "Settings"
    if (pathname.match(/^\/dashboard\/tasks\/[^/]+$/)) return "Task Details"
    if (pathname.match(/^\/dashboard\/tasks\/[^/]+\/edit$/)) return "Edit Task"
    if (pathname.match(/^\/dashboard\/projects\/[^/]+$/)) return "Project Details"
    if (pathname.match(/^\/dashboard\/projects\/[^/]+\/edit$/)) return "Edit Project"
    return "Dashboard"
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full">
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="border-b border-border/50">
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => router.push("/")}>
              <div className="bg-gradient-to-br from-white to-white/40  p-2 rounded-lg">
                <Avatar>
                  <AvatarImage src="/logoBlack.png" alt="RobotiX Logo" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                    R
                  </AvatarFallback>
                </Avatar>
                {/* <Image src={"/logoBlack.png"} alt="R"/> */}
                {/* <CheckCircle className="h-6 w-6 text-white" /> */}
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                RobotiX Team Management
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4">
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard"}
                  className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-200"
                >
                  <Link href="/dashboard" className="flex items-center gap-3">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/tasks" || pathname.startsWith("/dashboard/tasks/")}
                  className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-200"
                >
                  <Link href="/dashboard/tasks" className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5" />
                    <span>Tasks</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/projects" || pathname.startsWith("/dashboard/projects/")}
                  className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-200"
                >
                  <Link href="/dashboard/projects" className="flex items-center gap-3">
                    <Code className="h-5 w-5" />
                    <span>Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {canAssignTasks && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/create-task"}
                    className="hover:bg-gradient-to-r hover:from-green-500/10 hover:to-green-500/5 transition-all duration-200"
                  >
                    <Link href="/dashboard/create-task" className="flex items-center gap-3">
                      <PlusCircle className="h-5 w-5" />
                      <span>Create Task</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/settings"}
                  className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-200"
                >
                  <Link href="/dashboard/settings" className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-border/50 p-3">
            <div className="flex items-center justify-between rounded-xl border border-border/50 p-3 bg-gradient-to-r from-card to-muted/50">
              <div className="flex items-center gap-3">
                <Avatar className="ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {user.position}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors focus-ring"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger className="focus-ring" />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-xl font-semibold hidden sm:block bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                {getPageTitle()}
              </h1>
              <div className="flex items-center gap-3">
                <ModeToggle />

                <DropdownMenu
                  onOpenChange={(open) => {
                    if (open) {
                      markNotificationsAsRead(user.id)
                      updateUser({
                        ...user,
                        lastNotificationReadAt: new Date(),
                      })
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="relative focus-ring hover:bg-primary/5 transition-colors"
                      // onClick={() => {
                      //   console.log("user", user.id)
                      //   markNotificationsAsRead(user.id)
                      // }}
                    >
                      <Bell className="h-5 w-5" />
                      {unreadNotifications.length > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white font-semibold animate-pulse">
                          {unreadNotifications.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notifications
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {isLoading ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No new notifications yet</div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`flex flex-col items-start gap-1 p-3 ${!notification.read ? "bg-muted/50" : ""}`}
                        >
                          <span className="font-medium">{notification.title}</span>
                          <span className="text-xs text-muted-foreground">{notification.message}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}

                    {notifications.length > 5 && (
                      <div className="p-2 text-center">
                        <Button variant="ghost" size="sm" className="w-full text-xs">
                          View all notifications
                        </Button>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="focus-ring hover:bg-primary/5 transition-colors">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 animate-fade-in">
            <div className="mx-auto w-full max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
