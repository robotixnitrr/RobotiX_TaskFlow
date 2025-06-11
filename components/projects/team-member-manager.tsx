"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2, UserPlus, Loader2, Users } from "lucide-react"
import {
  TeamMembersAPI,
  type TeamMember,
  type CreateTeamMemberInput,
  type UpdateTeamMemberInput,
} from "@/lib/api/team-members"

interface TeamMemberManagerProps {
  projectId: number
  isTeamLead: boolean
  initialMembers?: TeamMember[]
}

interface AvailableUser {
  id: number
  name: string
  email: string
  position: string
  avatarUrl?: string | null
}

export function TeamMemberManager({ projectId, isTeamLead, initialMembers = [] }: TeamMemberManagerProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [role, setRole] = useState("")
  const [contributions, setContributions] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadMembers()
  }, [projectId])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const response = await TeamMembersAPI.getTeamMembers(projectId)
      if (response.success && response.data) {
        setMembers(response.data)
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load team members",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading team members:", error)
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableUsers = async () => {
    try {
      const response = await TeamMembersAPI.getAvailableUsers(projectId)
      if (response.success && response.data) {
        setAvailableUsers(response.data)
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load available users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading available users:", error)
      toast({
        title: "Error",
        description: "Failed to load available users",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setSelectedUserId(null)
    setRole("")
    setContributions("")
    setEditingMember(null)
  }

  const openAddDialog = () => {
    resetForm()
    loadAvailableUsers()
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (member: TeamMember) => {
    setRole(member.role)
    setContributions(member.contributions || "")
    setEditingMember(member)
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId || !role.trim()) return

    setSubmitting(true)
    try {
      const createData: CreateTeamMemberInput = {
        projectId,
        userId: selectedUserId,
        role,
        contributions: contributions || undefined,
      }

      const response = await TeamMembersAPI.addTeamMember(createData)
      if (response.success && response.data) {
        setMembers((prev) => [...prev, response.data!])
        toast({
          title: "Success",
          description: "Team member added successfully",
        })
        setIsAddDialogOpen(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to add team member",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding team member:", error)
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMember || !role.trim()) return

    setSubmitting(true)
    try {
      const updateData: UpdateTeamMemberInput = {
        role,
        contributions: contributions || undefined,
      }

      const response = await TeamMembersAPI.updateTeamMember(projectId, editingMember.userId, updateData)
      if (response.success && response.data) {
        setMembers((prev) => prev.map((m) => (m.id === editingMember.id ? response.data! : m)))
        toast({
          title: "Success",
          description: "Team member updated successfully",
        })
        setEditingMember(null)
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update team member",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating team member:", error)
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveMember = async (member: TeamMember) => {
    try {
      const response = await TeamMembersAPI.removeTeamMember(projectId, member.userId)
      if (response.success) {
        setMembers((prev) => prev.filter((m) => m.id !== member.id))
        toast({
          title: "Success",
          description: "Team member removed successfully",
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to remove team member",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing team member:", error)
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Members</h3>
        {isTeamLead && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>Add a new member to the project team.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <Label htmlFor="userId">Select User</Label>
                  <Select
                    value={selectedUserId?.toString()}
                    onValueChange={(value) => setSelectedUserId(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No available users
                        </SelectItem>
                      ) : (
                        availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.position})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Member role in the project"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contributions">Contributions</Label>
                  <Textarea
                    id="contributions"
                    value={contributions}
                    onChange={(e) => setContributions(e.target.value)}
                    placeholder="Member contributions (optional)"
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting || !selectedUserId}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Member
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground col-span-2">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No team members yet</p>
            {isTeamLead && <p className="text-sm">Add team members to collaborate on this project</p>}
          </div>
        ) : (
          members.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user?.avatarUrl || ""} alt={member.user?.name || ""} />
                      <AvatarFallback>
                        {member.user?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{member.user?.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Joined {format(new Date(member.joinedAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                      {member.contributions && (
                        <p className="text-sm text-muted-foreground mt-2">{member.contributions}</p>
                      )}
                    </div>
                  </div>
                  {isTeamLead && (
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(member)}>
                            <Edit className="w-3 h-3" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Team Member</DialogTitle>
                            <DialogDescription>Update team member details.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleUpdateMember} className="space-y-4">
                            <div>
                              <Label htmlFor="edit-role">Role</Label>
                              <Input
                                id="edit-role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="Member role in the project"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-contributions">Contributions</Label>
                              <Textarea
                                id="edit-contributions"
                                value={contributions}
                                onChange={(e) => setContributions(e.target.value)}
                                placeholder="Member contributions (optional)"
                                rows={3}
                              />
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setEditingMember(null)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={submitting}>
                                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Update Member
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-3 h-3" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.user?.name} from the project? This action cannot
                              be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(member)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Remove Member
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
