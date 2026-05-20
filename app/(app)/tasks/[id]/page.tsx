"use client"

import { use } from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { cn, formatDate, formatDateTime, timeAgo, getInitials } from "@/lib/utils"
import {
  ArrowLeft, Loader2, AlertTriangle, MessageSquare, Send, Edit3, Star, Trash2,
} from "lucide-react"

interface TaskDetail {
  id: string
  title: string
  description: string | null
  status: string
  projectId: string
  assignedToId: string | null
  createdById: string
  evaluationType: string | null
  severity: string | null
  confidenceScore: number | null
  qaStatus: string
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

interface UserInfo {
  id: string
  name: string
  email: string
  image?: string | null
  role: string
}

interface Comment {
  id: string
  content: string
  taskId: string
  userId: string
  createdAt: string
  updatedAt: string
}

const statusBadge: Record<string, "amber" | "blue" | "emerald" | "rose"> = {
  pending: "amber",
  in_review: "blue",
  approved: "emerald",
  rejected: "rose",
}

const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
}

const qaStatusLabel: Record<string, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  approved: "Approved",
  rejected: "Rejected",
}

const qaStatusBadge: Record<string, "amber" | "blue" | "emerald" | "rose"> = {
  pending: "amber",
  reviewed: "blue",
  approved: "emerald",
  rejected: "rose",
}

const severityLabel: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
}

const severityBadge: Record<string, "emerald" | "amber" | "rose" | "rose"> = {
  low: "emerald",
  medium: "amber",
  high: "rose",
  critical: "rose",
}

const typeLabel: Record<string, string> = {
  safety: "Safety",
  accuracy: "Accuracy",
  relevance: "Relevance",
  coherence: "Coherence",
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

const typeOptions = [
  { value: "safety", label: "Safety" },
  { value: "accuracy", label: "Accuracy" },
  { value: "relevance", label: "Relevance" },
  { value: "coherence", label: "Coherence" },
]

const severityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
]

const qaStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-slate-200 rounded-xl", className)} />
}

function StarRating({ score }: { score: number | null }) {
  const value = score !== null ? score / 20 : 0
  const fullStars = Math.floor(value)
  const hasHalf = value - fullStars >= 0.5
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)

  return (
    <span className="inline-flex items-center gap-0.5" title={`${score ?? "—"} / 100`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
      {hasHalf && (
        <span className="relative w-3.5 h-3.5">
          <Star className="absolute inset-0 w-3.5 h-3.5 text-amber-200" />
          <span className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </span>
        </span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-slate-200" />
      ))}
      <span className="ml-1.5 text-xs font-mono font-bold text-slate-600">
        {score ?? "—"}
      </span>
    </span>
  )
}

function UserAvatar({ name, id }: { name?: string | null; id: string }) {
  const initials = name ? getInitials(name) : getInitials(id)
  const isIdFallback = !name && id.length > 10
  return (
    <div
      className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
      title={name || id}
    >
      {isIdFallback ? initials.charAt(0) : initials}
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-b-0">
      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
        {label}
      </span>
      <div className="text-right">{children}</div>
    </div>
  )
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [task, setTask] = useState<TaskDetail | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserName, setCurrentUserName] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [users, setUsers] = useState<UserInfo[]>([])

  const [editOpen, setEditOpen] = useState(false)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [commentText, setCommentText] = useState("")
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  const fetchTask = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${id}`)
      if (res.status === 404) {
        setNotFound(true)
        return
      }
      if (!res.ok) throw new Error("Failed to load task")
      const data = await res.json()
      setTask(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }, [id])

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${id}/comments`)
      if (res.ok) {
        const data = await res.json()
        setComments(Array.isArray(data) ? data : [])
      }
    } catch {
    }
  }, [id])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(Array.isArray(data) ? data : [])
      }
    } catch {
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    setNotFound(false)

    authClient.getSession().then((res) => {
      if (res.data?.user) {
        const role = (res.data.user as any).role
        setIsAdmin(role === "admin")
        setCurrentUserName(res.data.user.name)
        setCurrentUserId(res.data.user.id)
      }
    })

    Promise.all([fetchTask(), fetchComments(), fetchUsers()]).finally(() => setLoading(false))
  }, [fetchTask, fetchComments, fetchUsers])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete task")
      router.push(`/projects/${task?.projectId || "/tasks"}`)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
      setDeleteConfirmOpen(false)
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    setCommentSubmitting(true)
    try {
      const res = await fetch(`/api/tasks/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      })
      if (!res.ok) throw new Error("Failed to add comment")
      const newComment = await res.json()
      setComments((prev) => [...prev, newComment])
      setCommentText("")
    } catch (err) {
      console.error(err)
    } finally {
      setCommentSubmitting(false)
    }
  }

  const getUserName = (userId: string) => {
    const u = users.find(u => u.id === userId)
    return u?.name || null
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Task not found</h2>
        <p className="text-sm text-slate-500 mb-6">This task doesn&apos;t exist or has been removed.</p>
        <Link href="/tasks">
          <Button variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Tasks
          </Button>
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-24" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Failed to load task</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push("/tasks")}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Tasks
          </Button>
          <Button
            onClick={() => {
              setLoading(true)
              setError(null)
              Promise.all([fetchTask(), fetchComments()]).finally(() => setLoading(false))
            }}
          >
            <Loader2 className="w-4 h-4 mr-1.5" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!task) return null

  const score = task.confidenceScore

  return (
    <div className="space-y-6 animate-[fade-up_0.3s_ease_both]">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Tasks
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="display text-xl font-bold text-slate-900 leading-snug">
                  {task.title}
                </h1>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteConfirmOpen(true)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditOpen(true)}
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusBadge[task.status] || "slate"}>
                  {statusLabel[task.status] || task.status}
                </Badge>
                {task.evaluationType && (
                  <Badge variant="indigo">{typeLabel[task.evaluationType] || task.evaluationType}</Badge>
                )}
                {task.severity && (
                  <Badge variant={severityBadge[task.severity] || "slate"}>
                    {severityLabel[task.severity] || task.severity}
                  </Badge>
                )}
                <Badge variant={qaStatusBadge[task.qaStatus] || "slate"}>
                  QA: {qaStatusLabel[task.qaStatus] || task.qaStatus}
                </Badge>
              </div>

              {task.description && (
                <p className="text-sm text-slate-600 leading-relaxed font-mono bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {task.description}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Comments
                </h2>
                <Badge variant="slate">{comments.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-xs font-semibold text-slate-500">No comments yet</p>
                    <p className="text-[10px] font-mono">Start the discussion</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <UserAvatar name={getUserName(comment.userId)} id={comment.userId} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-slate-700 font-mono">
                            {comment.userId === currentUserId
                              ? (currentUserName || "You")
                              : (getUserName(comment.userId) || getInitials(comment.userId))
                            }
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {timeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-600 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                    {currentUserName ? getInitials(currentUserName) : "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Textarea
                      id="new-comment"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[60px] text-sm resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!commentText.trim() || commentSubmitting}
                      >
                        {commentSubmitting ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5 mr-1" />
                        )}
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4">
                Details
              </h3>
              <div className="divide-y divide-slate-50">
                <DetailRow label="Status">
                  <Badge variant={statusBadge[task.status] || "slate"}>
                    {statusLabel[task.status] || task.status}
                  </Badge>
                </DetailRow>

                <DetailRow label="Evaluation Type">
                  {task.evaluationType ? (
                    <Badge variant="indigo">{typeLabel[task.evaluationType] || task.evaluationType}</Badge>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">—</span>
                  )}
                </DetailRow>

                <DetailRow label="Severity">
                  {task.severity ? (
                    <Badge variant={severityBadge[task.severity] || "slate"}>
                      {severityLabel[task.severity] || task.severity}
                    </Badge>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">—</span>
                  )}
                </DetailRow>

                <DetailRow label="Confidence Score">
                  <StarRating score={score} />
                </DetailRow>

                <DetailRow label="QA Status">
                  <Badge variant={qaStatusBadge[task.qaStatus] || "slate"}>
                    {qaStatusLabel[task.qaStatus] || task.qaStatus}
                  </Badge>
                </DetailRow>

                <DetailRow label="Assigned To">
                  {task.assignedToId ? (
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs font-mono text-slate-600 truncate max-w-[120px]">
                        {getUserName(task.assignedToId) || getInitials(task.assignedToId)}
                      </span>
                      <UserAvatar name={getUserName(task.assignedToId)} id={task.assignedToId} />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">Unassigned</span>
                  )}
                </DetailRow>

                <DetailRow label="Created By">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs font-mono text-slate-600 truncate max-w-[120px]">
                      {task.createdById === currentUserId
                        ? (currentUserName || "You")
                        : (getUserName(task.createdById) || getInitials(task.createdById))
                      }
                    </span>
                    <UserAvatar name={getUserName(task.createdById)} id={task.createdById} />
                  </div>
                </DetailRow>

                <DetailRow label="Due Date">
                  <span className="text-xs font-mono text-slate-600">
                    {formatDate(task.dueDate)}
                  </span>
                </DetailRow>

                <DetailRow label="Created">
                  <span className="text-xs font-mono text-slate-500">
                    {formatDateTime(task.createdAt)}
                  </span>
                </DetailRow>

                <DetailRow label="Updated">
                  <span className="text-xs font-mono text-slate-500">
                    {timeAgo(task.updatedAt)}
                  </span>
                </DetailRow>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="display text-base font-semibold text-slate-900">Edit Task</h2>
              <p className="text-xs text-slate-500 font-mono">Update task details</p>
            </div>
          </div>
        </DialogHeader>
        <DialogContent>
          <EditTaskForm
            task={task}
            users={users}
            onSubmit={async (data) => {
              setEditSubmitting(true)
              setEditError(null)
              try {
                const res = await fetch(`/api/tasks/${id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                })
                if (!res.ok) {
                  const err = await res.json().catch(() => null)
                  throw new Error(err?.error?.formErrors?.[0] || err?.error || "Failed to update task")
                }
                const updated = await res.json()
                setTask(updated)
                setEditOpen(false)
              } catch (err) {
                setEditError(err instanceof Error ? err.message : "An error occurred")
              } finally {
                setEditSubmitting(false)
              }
            }}
            submitting={editSubmitting}
            error={editError}
            onCancel={() => {
              setEditOpen(false)
              setEditError(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogHeader>
          <h2 className="text-lg font-bold text-slate-900">Delete Task</h2>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete Task
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

function EditTaskForm({
  task,
  users,
  onSubmit,
  submitting,
  error,
  onCancel,
}: {
  task: TaskDetail
  users: UserInfo[]
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  submitting: boolean
  error: string | null
  onCancel: () => void
}) {
  const [status, setStatus] = useState(task.status)
  const [evaluationType, setEvaluationType] = useState(task.evaluationType || "")
  const [severity, setSeverity] = useState(task.severity || "")
  const [confidenceScore, setConfidenceScore] = useState(String(task.confidenceScore ?? ""))
  const [qaStatus, setQaStatus] = useState(task.qaStatus)
  const [assignedToId, setAssignedToId] = useState(task.assignedToId || "")
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.slice(0, 16) : ""
  )

  const userOptions = [
    { value: "", label: "Unassigned" },
    ...users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` })),
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data: Record<string, unknown> = {
      status,
      evaluationType: evaluationType || null,
      severity: severity || null,
      confidenceScore: confidenceScore ? parseInt(confidenceScore, 10) : null,
      qaStatus,
      assignedToId: assignedToId || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    }
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Status"
        id="edit-status"
        options={statusOptions}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      />

      <Select
        label="Evaluation Type"
        id="edit-type"
        options={[{ value: "", label: "None" }, ...typeOptions]}
        value={evaluationType}
        onChange={(e) => setEvaluationType(e.target.value)}
      />

      <Select
        label="Severity"
        id="edit-severity"
        options={[{ value: "", label: "None" }, ...severityOptions]}
        value={severity}
        onChange={(e) => setSeverity(e.target.value)}
      />

      <Input
        label="Confidence Score (0-100)"
        id="edit-score"
        type="number"
        min={0}
        max={100}
        placeholder="0-100"
        value={confidenceScore}
        onChange={(e) => setConfidenceScore(e.target.value)}
      />

      <Select
        label="QA Status"
        id="edit-qa"
        options={qaStatusOptions}
        value={qaStatus}
        onChange={(e) => setQaStatus(e.target.value)}
      />

      <Select
        label="Assigned To"
        id="edit-assignee"
        options={userOptions}
        value={assignedToId}
        onChange={(e) => setAssignedToId(e.target.value)}
      />

      <Input
        label="Due Date"
        id="edit-due"
        type="datetime-local"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      {error && (
        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}

      <DialogFooter>
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}