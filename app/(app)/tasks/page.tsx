"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { cn, formatDate, getInitials, timeAgo } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import {
  Search, Loader2, FileText, AlertTriangle, Edit3, Trash2,
  MoreVertical, ArrowUpDown, X, Save, Plus, User,
  Calendar, Clock,
} from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string | null
  status: string
  projectId: string
  evaluationType?: string | null
  severity?: string | null
  confidenceScore?: number | null
  qaStatus?: string | null
  assignedToId?: string | null
  dueDate?: string | null
  createdAt: string
  updatedAt: string
}

interface UserInfo {
  id: string
  name: string
  email: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-slate-200 rounded-xl", className)} />
}

const statusBadge: Record<string, "amber" | "blue" | "emerald" | "rose"> = {
  pending: "amber",
  in_review: "blue",
  approved: "emerald",
  rejected: "rose",
}

const qaStatusBadge: Record<string, "amber" | "blue" | "emerald" | "rose"> = {
  pending: "amber",
  reviewed: "blue",
  approved: "emerald",
  rejected: "rose",
}

const severityColors: Record<string, "emerald" | "amber" | "rose"> = {
  low: "emerald",
  medium: "amber",
  high: "rose",
  critical: "rose",
}

const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
}

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "safety", label: "Safety" },
  { value: "accuracy", label: "Accuracy" },
  { value: "relevance", label: "Relevance" },
  { value: "coherence", label: "Coherence" },
]

const severityOptions = [
  { value: "all", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
]

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

const editStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

const editTypeOptions = [
  { value: "", label: "None" },
  { value: "safety", label: "Safety" },
  { value: "accuracy", label: "Accuracy" },
  { value: "relevance", label: "Relevance" },
  { value: "coherence", label: "Coherence" },
]

const editSeverityOptions = [
  { value: "", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
]

const editQaOptions = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const debouncedSearch = useDebounce(searchQuery, 300)

  const [editTarget, setEditTarget] = useState<Task | null>(null)
  const [editData, setEditData] = useState<Record<string, string>>({})
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [sortField, setSortField] = useState<string>("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    authClient.getSession().then(res => {
      if (res.data?.user) setCurrentUserId(res.data.user.id)
    })
    fetch("/api/users").then(r => r.ok && r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set("search", debouncedSearch)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (typeFilter !== "all") params.set("evaluationType", typeFilter)
      if (severityFilter !== "all") params.set("severity", severityFilter)
      params.set("sortBy", sortField)
      params.set("sortOrder", sortDir)
      const res = await fetch(`/api/tasks?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch tasks")
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : data.tasks ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter, typeFilter, severityFilter, sortField, sortDir])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("desc") }
  }

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || null

  const openEdit = (task: Task) => {
    setEditTarget(task)
    setEditData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      evaluationType: task.evaluationType || "",
      severity: task.severity || "",
      confidenceScore: String(task.confidenceScore ?? ""),
      qaStatus: task.qaStatus || "pending",
      assignedToId: task.assignedToId || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 16) : "",
    })
  }

  const handleEditSubmit = async () => {
    if (!editTarget) return
    setEditSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        title: editData.title,
        description: editData.description || null,
        status: editData.status,
        evaluationType: editData.evaluationType || null,
        severity: editData.severity || null,
        confidenceScore: editData.confidenceScore ? parseInt(editData.confidenceScore, 10) : null,
        qaStatus: editData.qaStatus,
        assignedToId: editData.assignedToId || null,
        dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString() : null,
      }
      const res = await fetch(`/api/tasks/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      setEditTarget(null)
      fetchTasks()
    } catch {
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/tasks/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setDeleteTarget(null)
      fetchTasks()
    } catch {
    } finally {
      setDeleting(false)
    }
  }

  const userOptions = [
    { value: "", label: "Unassigned" },
    ...users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` })),
  ]

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between"><div><Skeleton className="h-8 w-36 mb-2" /><Skeleton className="h-4 w-56" /></div></div>
        <Card><CardContent className="p-0"><div className="divide-y divide-slate-100">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="flex items-center gap-4 px-6 py-4"><Skeleton className="h-4 w-48" /><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-20" /></div>))}</div></CardContent></Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border flex items-center justify-center mb-4"><AlertTriangle className="w-7 h-7 text-rose-500" /></div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Failed to load tasks</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <Button onClick={fetchTasks}><Loader2 className="w-4 h-4 mr-1.5" />Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Tasks</h1>
            <Badge variant="indigo">{tasks.length}</Badge>
          </div>
          <p className="text-sm text-slate-500 font-mono">Manage and review AI evaluation tasks</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-56 rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200" />
          </div>
          <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36" />
          <Select options={typeOptions} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-36" />
          <Select options={severityOptions} value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="w-32" />
        </div>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-semibold text-slate-500 mb-1">No tasks found</p>
            <p className="text-xs font-mono">Try adjusting your filters</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Column headers */}
            <div className="hidden lg:grid text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 px-6 py-3"
              style={{ gridTemplateColumns: "minmax(180px,2fr) 1fr 1fr 1fr 1fr 1fr 80px" }}>
              <button onClick={() => toggleSort("title")} className="flex items-center gap-1 text-left hover:text-slate-700">
                Task <ArrowUpDown className="w-3 h-3" />
              </button>
              <span>Status</span>
              <span>Type</span>
              <span>Severity</span>
              <span>Assignee</span>
              <button onClick={() => toggleSort("createdAt")} className="flex items-center gap-1 hover:text-slate-700">
                Created <ArrowUpDown className="w-3 h-3" />
              </button>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <div key={task.id}
                  className="grid items-center gap-2 px-4 lg:px-6 py-3.5 transition-colors hover:bg-slate-50/80 group"
                  style={{ gridTemplateColumns: "minmax(180px,2fr) 1fr 1fr 1fr 1fr 1fr 80px" }}>
                  
                  {/* Title */}
                  <div className="min-w-0">
                    <Link href={`/tasks/${task.id}`}
                      className="text-[13px] font-semibold text-slate-800 hover:text-indigo-600 transition-colors truncate block leading-tight">
                      {task.title}
                    </Link>
                    {task.description && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{task.description}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div><Badge variant={statusBadge[task.status] || "slate"}>{statusLabel[task.status] || task.status}</Badge></div>

                  {/* Type */}
                  <div><Badge variant="indigo">{task.evaluationType || "—"}</Badge></div>

                  {/* Severity */}
                  <div>{task.severity ? <Badge variant={severityColors[task.severity] || "slate"}>{task.severity.charAt(0).toUpperCase() + task.severity.slice(1)}</Badge> : <span className="text-xs text-slate-400">—</span>}</div>

                  {/* Assignee */}
                  <div>{task.assignedToId ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0">
                        {getInitials(getUserName(task.assignedToId) || task.assignedToId)}
                      </div>
                      <span className="text-[11px] text-slate-600 truncate max-w-[80px]">{getUserName(task.assignedToId) || "—"}</span>
                    </div>
                  ) : <span className="text-xs text-slate-400">—</span>}</div>

                  {/* Created */}
                  <div><span className="text-[11px] font-mono text-slate-500">{formatDate(task.createdAt)}</span></div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Edit Task</h2>
              <p className="text-[10px] text-slate-500 font-mono">Update task details and assignment</p>
            </div>
          </div>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <Input label="Title" id="edit-title" value={editData.title || ""}
              onChange={(e) => setEditData(d => ({ ...d, title: e.target.value }))} />
            <Textarea label="Description" id="edit-desc" value={editData.description || ""}
              onChange={(e) => setEditData(d => ({ ...d, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Status" id="edit-status" options={editStatusOptions} value={editData.status || "pending"}
                onChange={(e) => setEditData(d => ({ ...d, status: e.target.value }))} />
              <Select label="Evaluation Type" id="edit-type" options={editTypeOptions} value={editData.evaluationType || ""}
                onChange={(e) => setEditData(d => ({ ...d, evaluationType: e.target.value }))} />
              <Select label="Severity" id="edit-severity" options={editSeverityOptions} value={editData.severity || ""}
                onChange={(e) => setEditData(d => ({ ...d, severity: e.target.value }))} />
              <Select label="QA Status" id="edit-qa" options={editQaOptions} value={editData.qaStatus || "pending"}
                onChange={(e) => setEditData(d => ({ ...d, qaStatus: e.target.value }))} />
            </div>
            <Input label="Confidence Score (0-100)" id="edit-score" type="number" min={0} max={100}
              value={editData.confidenceScore || ""}
              onChange={(e) => setEditData(d => ({ ...d, confidenceScore: e.target.value }))} />
            <Select label="Assigned To" id="edit-assignee" options={userOptions} value={editData.assignedToId || ""}
              onChange={(e) => setEditData(d => ({ ...d, assignedToId: e.target.value }))} />
            <Input label="Due Date" id="edit-due" type="datetime-local" value={editData.dueDate || ""}
              onChange={(e) => setEditData(d => ({ ...d, dueDate: e.target.value }))} />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setEditTarget(null)} disabled={editSubmitting}>Cancel</Button>
          <Button onClick={handleEditSubmit} disabled={editSubmitting}>
            {editSubmitting ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-1.5" />Save Changes</>}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogHeader><h2 className="text-lg font-bold text-slate-900">Delete Task</h2></DialogHeader>
        <DialogContent>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4 mr-1.5" />Delete Task</>}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}