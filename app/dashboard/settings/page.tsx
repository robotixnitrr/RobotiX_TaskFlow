"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/dashboard-layout"
import { DatabaseStatus } from "@/components/database-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  if (!user) return null // Ensure user is loaded before rendering
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    position: user?.position || "" as 'overall-coordinator' | 'head-coordinator' | 'core-coordinator' | 'executive' | 'members',
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskAssigned: true,
    taskUpdated: true,
    taskCompleted: true,
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target
  setProfileForm((prev) => ({ ...prev, [name]: value }))
}


  const handleNotificationChange = (key: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      // Simulate update
      await updateUser({
        ...user,
        name: profileForm.name,
        position: profileForm.position,
      })
      // await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your notification settings.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Separator />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <form onSubmit={handleProfileSubmit}>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={profileForm.name} onChange={handleProfileChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={profileForm.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    {/* <Input id="position" name="position" value={profileForm.position} onChange={handleProfileChange} /> */}
                    <Select value={profileForm.position} onValueChange={(e) => setProfileForm((prev) => ({ ...prev, position: e as 'overall-coordinator' | 'head-coordinator' | 'core-coordinator' | 'executive' | 'members' }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overall-coordinator">Overall coordinator</SelectItem>
                        <SelectItem value="head-coordinator">Head coordinator</SelectItem>
                        <SelectItem value="core-coordinator">Core coordinator</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="members">Members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      disabled
                    />
                  </div> */}
                  <div className="space-y-2">
                    <Label htmlFor="lastNotificationReadAt">Last Notification Read</Label>
                    <Input
                      id="lastNotificationReadAt"
                      value={format(user?.lastNotificationReadAt?.toLocaleString() || 0, "PPPpp")}
                      disabled
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Notifications card remains unchanged */}
            <Card>
              <form onSubmit={handleNotificationSubmit}>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure how you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email.</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => handleNotificationChange("emailNotifications")}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notification Types</h3>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="task-assigned">Task Assigned</Label>
                      <Switch
                        id="task-assigned"
                        checked={notificationSettings.taskAssigned}
                        onCheckedChange={() => handleNotificationChange("taskAssigned")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="task-updated">Task Updated</Label>
                      <Switch
                        id="task-updated"
                        checked={notificationSettings.taskUpdated}
                        onCheckedChange={() => handleNotificationChange("taskUpdated")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="task-completed">Task Completed</Label>
                      <Switch
                        id="task-completed"
                        checked={notificationSettings.taskCompleted}
                        onCheckedChange={() => handleNotificationChange("taskCompleted")}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Right column remains unchanged */}
          <div className="space-y-6">
            <DatabaseStatus />
            <Card>
              <CardHeader>
                <CardTitle>Application Info</CardTitle>
                <CardDescription>Information about this application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Framework:</span>
                  <span>Next.js 15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database:</span>
                  <span>PostgreSQL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UI Library:</span>
                  <span>shadcn/ui</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout >
  )
}
