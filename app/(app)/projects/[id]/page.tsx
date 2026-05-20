"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { cn, formatDate, getInitials, timeAgo } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

const statusColors: Record<string, "amber" | "blue" | "emerald" | "rose"> = {
  pending: "amber",
  in_review: "blue",
  approved: "emerald",
  rejected: "rose",
}

const typeColors: Record<string, "rose" | "emerald" | "blue" | "violet"> = {
  safety: "rose",
  accuracy: "emerald",
  relevance: "blue",
  coherence: "violet",
}

interface Member {
  id: string
  projectId: string
  userId: string
  role: string
  joinedAt: string
  userName: string | null
  userEmail: string | null
  userImage: string | null
}

interface UserInfo {
  id: string
  name: string
  email: string
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showTask, setShowTask] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDesc, setTaskDesc] = useState("")
  const [taskType, setTaskType] = useState("")
  const [taskSeverity, setTaskSeverity] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [allUsers, setAllUsers] = useState<UserInfo[]>([])
  const [newMemberUserId, setNewMemberUserId] = useState("")
  const [addingMember, setAddingMember] = useState(false)

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`)
      if (!res.ok) throw new Error("Project not found")
      const data = await res.json()
      setProject(data)
      setEditName(data.name)
      setEditDesc(data.description || "")
    } catch {
      setError("Project not found")
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}/tasks`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch { /* ignore */ }
    finally { setTasksLoading(false) }
  }, [id])

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}/members`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch { /* ignore */ }
  }, [id])

  const fetchAllUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        setAllUsers(Array.isArray(data) ? data : [])
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchProject()
    fetchTasks()
    fetchMembers()
    fetchAllUsers()
  }, [fetchProject, fetchTasks, fetchMembers, fetchAllUsers])

  useEffect(() => {
    authClient.getSession().then(res => setUser(res.data?.user))
  }, [])

  const handleEdit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDesc }),
      })
      if (!res.ok) { toast.error("Failed to update"); return }
      const updated = await res.json()
      setProject(updated)
      setShowEdit(false)
      toast.success("Project updated")
    } catch { toast.error("Something went wrong") }
    finally { setSubmitting(false) }
  }

  const handleCreateTask = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          projectId: id,
          evaluationType: taskType || undefined,
          severity: taskSeverity || undefined,
        }),
      })
      if (!res.ok) { toast.error("Failed to create task"); return }
      setShowTask(false)
      setTaskTitle(""); setTaskDesc(""); setTaskType(""); setTaskSeverity("")
      toast.success("Task created")
      fetchTasks()
    } catch { toast.error("Something went wrong") }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this project? This cannot be undone.")) return
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Failed to delete"); return }
      toast.success("Project deleted")
      router.push("/projects")
    } catch { toast.error("Something went wrong") }
  }

  const handleAddMember = async () => {
    if (!newMemberUserId) return
    setAddingMember(true)
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: newMemberUserId }),
      })
      if (!res.ok) { toast.error("Failed to add member"); return }
      setShowAddMember(false)
      setNewMemberUserId("")
      toast.success("Member added")
      fetchMembers()
    } catch { toast.error("Something went wrong") }
    finally { setAddingMember(false) }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member from the project?")) return
    try {
      const res = await fetch(`/api/projects/${id}/members?memberId=${memberId}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Failed to remove member"); return }
      toast.success("Member removed")
      fetchMembers()
    } catch { toast.error("Something went wrong") }
  }

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
      <div className="h-4 w-72 bg-slate-200 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Project not found</h3>
      <p className="text-sm text-slate-500 mb-4">This project doesn&apos;t exist or has been deleted.</p>
      <Link href="/projects"><Button variant="secondary">Back to Projects</Button></Link>
    </div>
  )

  const userRole = (user as any)?.role
  const isProjectCreator = project?.createdById === (user as any)?.id
  const canManage = userRole === "admin" || isProjectCreator
  const statusCounts = { pending: 0, in_review: 0, approved: 0, rejected: 0 }
  tasks.forEach(t => { if (t.status in statusCounts) statusCounts[t.status as keyof typeof statusCounts]++ })

  const nonMemberUsers = allUsers.filter(u => !members.some(m => m.userId === u.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project?.name}</h1>
            {project?.description && <p className="text-sm text-slate-500 mt-1">{project.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowTask(true)}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>Edit</Button>
          {canManage && (
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: tasks.length, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
          { label: "Pending", value: statusCounts.pending, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          { label: "In Review", value: statusCounts.in_review, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
          { label: "Completed", value: statusCounts.approved, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
        ].map((k, i) => (
          <div key={i} className={`rounded-xl border ${k.bg} p-4`}>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1">{k.label}</p>
            <p className={`font-mono text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tasks list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Tasks</h2>
            <span className="font-mono text-xs text-slate-400">{tasks.length} total</span>
          </div>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700">No tasks yet</p>
              <p className="text-xs text-slate-400 mt-1">Create the first task for this project.</p>
              <Button size="sm" className="mt-4" onClick={() => setShowTask(true)}>Create Task</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200 group"
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-slate-300 group-hover:bg-indigo-500 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    {task.description && <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>}
                  </div>
                  {task.status && <Badge variant={statusColors[task.status] || "slate"}>{task.status.replace("_", " ")}</Badge>}
                  {task.evaluationType && <Badge variant={typeColors[task.evaluationType] || "slate"}>{task.evaluationType}</Badge>}
                  {task.assignedToId && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">
                      U
                    </div>
                  )}
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Team Members</h2>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">{members.length} member{members.length !== 1 ? "s" : ""}</span>
              <Button size="sm" variant="secondary" onClick={() => setShowAddMember(true)}>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Member
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm font-medium text-slate-500">No team members yet</p>
              <p className="text-xs mt-1">Add members to collaborate on this project.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                      {member.userName ? getInitials(member.userName) : "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{member.userName || "Unknown User"}</p>
                      <p className="text-xs text-slate-400">{member.userEmail || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="slate">{member.role}</Badge>
                    <span className="text-[10px] text-slate-400 font-mono">{timeAgo(member.joinedAt)}</span>
                    {member.userId !== (user as any)?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onClose={() => setShowEdit(false)}>
        <DialogHeader><h2 className="text-lg font-bold text-slate-900">Edit Project</h2></DialogHeader>
        <DialogContent className="space-y-4">
          <Input id="edit-name" label="Project Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
          <Textarea id="edit-desc" label="Description" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
        </DialogContent>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button onClick={handleEdit} disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
        </DialogFooter>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={showTask} onClose={() => setShowTask(false)}>
        <DialogHeader><h2 className="text-lg font-bold text-slate-900">Create Task</h2></DialogHeader>
        <DialogContent className="space-y-4">
          <Input id="task-title" label="Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
          <Textarea id="task-desc" label="Description" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
          <Select id="task-type" label="Evaluation Type" placeholder="Select type" value={taskType} onChange={(e) => setTaskType(e.target.value)}
            options={[
              { value: "safety", label: "Safety" },
              { value: "accuracy", label: "Accuracy" },
              { value: "relevance", label: "Relevance" },
              { value: "coherence", label: "Coherence" },
            ]}
          />
          <Select id="task-severity" label="Severity" placeholder="Select severity" value={taskSeverity} onChange={(e) => setTaskSeverity(e.target.value)}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ]}
          />
        </DialogContent>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setShowTask(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} disabled={submitting || !taskTitle}>{submitting ? "Creating..." : "Create Task"}</Button>
        </DialogFooter>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onClose={() => setShowAddMember(false)}>
        <DialogHeader><h2 className="text-lg font-bold text-slate-900">Add Team Member</h2></DialogHeader>
        <DialogContent className="space-y-4">
          <Select
            label="Select User"
            id="new-member"
            placeholder="Choose a user to add"
            value={newMemberUserId}
            onChange={(e) => setNewMemberUserId(e.target.value)}
            options={nonMemberUsers.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))}
          />
        </DialogContent>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setShowAddMember(false)}>Cancel</Button>
          <Button onClick={handleAddMember} disabled={addingMember || !newMemberUserId}>
            {addingMember ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}