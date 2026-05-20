"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { cn, formatDate, getInitials } from "@/lib/utils"
import {
  Columns3, Loader2, AlertTriangle, Plus, User,
  Calendar, ArrowRight, GripVertical, Edit3, Save, Trash2,
} from "lucide-react"
import { toast } from "sonner"

interface Task {
  id: string
  title: string
  description?: string | null
  status: string
  projectId: string
  evaluationType?: string | null
  severity?: string | null
  confidenceScore?: number | null
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

const COLUMNS = [
  { key: "pending", label: "Pending", color: "amber" },
  { key: "in_review", label: "In Review", color: "blue" },
  { key: "approved", label: "Approved", color: "emerald" },
  { key: "rejected", label: "Rejected", color: "rose" },
] as const

const severityColors: Record<string, string> = {
  low: "emerald",
  medium: "amber",
  high: "rose",
  critical: "rose",
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-slate-200 rounded-xl", className)} />
}

function TaskCard({ task, users, onDragStart, onClick }: {
  task: Task
  users: UserInfo[]
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onClick: (task: Task) => void
}) {
  const userName = users.find(u => u.id === task.assignedToId)?.name || null
  const severityColor = severityColors[task.severity || ""] || "slate"

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onClick(task)}
      className="group cursor-pointer bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 space-y-3"
    >
      {/* Drag handle indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {task.evaluationType && (
            <Badge variant="indigo" className="text-[9px] px-1.5 py-0.5 uppercase tracking-wider">
              {task.evaluationType}
            </Badge>
          )}
          {task.severity && (
            <Badge variant={severityColor as any} className="text-[9px] px-1.5 py-0.5 uppercase tracking-wider">
              {task.severity}
            </Badge>
          )}
        </div>
        <span className="text-slate-300 group-hover:text-slate-400 transition-colors flex-shrink-0">
          <GripVertical className="w-4 h-4" />
        </span>
      </div>

      {/* Title */}
      <Link
        href={`/tasks/${task.id}`}
        className="block text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors leading-snug"
        onClick={(e) => e.stopPropagation()}
      >
        {task.title}
      </Link>

      {/* Description preview */}
      {task.description && (
        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Confidence score */}
      {task.confidenceScore !== null && task.confidenceScore !== undefined && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                task.confidenceScore >= 80 ? "bg-emerald-500" :
                task.confidenceScore >= 60 ? "bg-amber-500" : "bg-rose-500"
              )}
              style={{ width: `${task.confidenceScore}%` }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500">{task.confidenceScore}</span>
        </div>
      )}

      {/* Footer: assignee + due date */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {userName ? (
            <div className="flex items-center gap-1.5" title={userName}>
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-[6px] font-bold text-white">
                {getInitials(userName)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono truncate max-w-[80px]">{userName}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <User className="w-3 h-3" />
              Unassigned
            </span>
          )}
        </div>
        {task.dueDate && (
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  )
}

type ColumnDef = { key: string; label: string; color: string }

function Column({ column, tasks, users, onDragStart, onDragOver, onDrop, onDragLeave, isOver, onTaskClick }: {
  column: ColumnDef
  tasks: Task[]
  users: UserInfo[]
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: string) => void
  onDragLeave: (e: React.DragEvent) => void
  isOver: boolean
  onTaskClick: (task: Task) => void
}) {
  const columnColors: Record<string, string> = {
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
  }

  const dotColors: Record<string, string> = {
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
  }

  const headerBg: Record<string, string> = {
    amber: "bg-amber-500/10",
    blue: "bg-blue-500/10",
    emerald: "bg-emerald-500/10",
    rose: "bg-rose-500/10",
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border-2 transition-all duration-200 min-h-[400px]",
        isOver ? "border-indigo-400 bg-indigo-50/30" : "border-slate-200 bg-slate-50/50",
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.key)}
      onDragLeave={onDragLeave}
    >
      {/* Column header */}
      <div className={cn("flex items-center justify-between px-5 py-4 rounded-t-2xl", headerBg[column.color])}>
        <div className="flex items-center gap-2.5">
          <div className={cn("w-2.5 h-2.5 rounded-full", dotColors[column.color])} />
          <h3 className="text-sm font-bold text-slate-800">{column.label}</h3>
        </div>
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
          columnColors[column.color]
        )}>
          {tasks.length}
        </div>
      </div>

      {/* Cards container */}
      <div className={cn(
        "flex-1 p-3 space-y-3 overflow-y-auto transition-colors rounded-b-2xl min-h-[300px]",
        isOver && "bg-indigo-50/50"
      )}>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", columnColors[column.color].split(" ")[0])}>
              <Plus className="w-4 h-4 opacity-50" />
            </div>
            <p className="text-xs font-medium text-slate-500">No tasks</p>
            <p className="text-[10px] text-slate-400 font-mono">Drop tasks here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              users={users}
              onDragStart={onDragStart}
              onClick={onTaskClick}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projectFilter, setProjectFilter] = useState("all")
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const [editTarget, setEditTarget] = useState<Task | null>(null)
  const [editData, setEditData] = useState<Record<string, string>>({})
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (projectFilter !== "all") params.set("projectId", projectFilter)

      const [tasksRes, usersRes, projectsRes] = await Promise.all([
        fetch(`/api/tasks?${params.toString()}`),
        fetch("/api/users"),
        fetch("/api/projects"),
      ])

      if (!tasksRes.ok) throw new Error("Failed to fetch tasks")

      const tasksData = await tasksRes.json()
      setTasks(Array.isArray(tasksData) ? tasksData : tasksData.tasks ?? [])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(Array.isArray(usersData) ? usersData : [])
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(Array.isArray(projectsData) ? projectsData : [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [projectFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const grouped = COLUMNS.map(col => ({
    ...col,
    tasks: tasks.filter(t => t.status === col.key),
  }))

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragLeave = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault()
    setDragOverColumn(prev => prev === columnKey ? null : prev)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    setDragOverColumn(null)

    const taskId = e.dataTransfer.getData("text/plain")
    if (!taskId) return

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistic update
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    )

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Moved to ${COLUMNS.find(c => c.key === newStatus)?.label || newStatus}`)
    } catch {
      // Revert on failure
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: task.status } : t)
      )
      toast.error("Failed to update task status")
    }

    setDraggedTaskId(null)
  }

  const openEdit = (task: Task) => {
    setEditTarget(task)
    setEditData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      evaluationType: task.evaluationType || "",
      severity: task.severity || "",
      confidenceScore: String(task.confidenceScore ?? ""),
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
      fetchData()
      toast.success("Task updated successfully")
    } catch {
      toast.error("Failed to update task")
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
      fetchData()
      toast.success("Task deleted successfully")
    } catch {
      toast.error("Failed to delete task")
    } finally {
      setDeleting(false)
    }
  }

  const userOptions = [
    { value: "", label: "Unassigned" },
    ...users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` })),
  ]

  const projectOptions = [
    { value: "all", label: "All Projects" },
    ...projects.map(p => ({ value: p.id, label: p.name })),
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><Skeleton className="h-8 w-32 mb-2" /><Skeleton className="h-4 w-56" /></div>
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 p-4 space-y-3">
              <Skeleton className="h-6 w-24" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-28 w-full" />
              ))}
            </div>
          ))}
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
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Failed to load board</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <Button onClick={fetchData}><Loader2 className="w-4 h-4 mr-1.5" />Retry</Button>
      </div>
    )
  }

  const totalTasks = tasks.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200">
              <Columns3 className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Board</h1>
            <Badge variant="violet">{totalTasks}</Badge>
          </div>
          <p className="text-sm text-slate-500 font-mono">Drag and drop tasks to manage workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={projectOptions}
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-48"
          />
          <Link href="/tasks">
            <Button variant="secondary" size="sm">
              <ArrowRight className="w-4 h-4 mr-1" />
              List View
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const count = grouped.find(g => g.key === col.key)?.tasks.length || 0
          const colorMap: Record<string, string> = {
            amber: "text-amber-600 bg-amber-50 border-amber-200",
            blue: "text-blue-600 bg-blue-50 border-blue-200",
            emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
            rose: "text-rose-600 bg-rose-50 border-rose-200",
          }
          return (
            <div key={col.key} className={cn("rounded-xl border p-3", colorMap[col.color])}>
              <p className="text-[10px] font-mono uppercase tracking-wider opacity-70">{col.label}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Board columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {grouped.map(({ key, label, color, tasks: columnTasks }) => (
          <Column
            key={key}
            column={{ key, label, color }}
            tasks={columnTasks}
            users={users}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={(e) => handleDragLeave(e, key)}
            onDrop={handleDrop}
            isOver={dragOverColumn === key}
            onTaskClick={openEdit}
          />
        ))}
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Columns3 className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-semibold text-slate-500 mb-1">No tasks on the board</p>
          <p className="text-xs font-mono">Create tasks from a project to see them here</p>
        </div>
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
              <Select label="Status" id="edit-status" options={[
                { value: "pending", label: "Pending" },
                { value: "in_review", label: "In Review" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]} value={editData.status || "pending"}
                onChange={(e) => setEditData(d => ({ ...d, status: e.target.value }))} />
              <Select label="Evaluation Type" id="edit-type" options={[
                { value: "", label: "None" },
                { value: "safety", label: "Safety" },
                { value: "accuracy", label: "Accuracy" },
                { value: "relevance", label: "Relevance" },
                { value: "coherence", label: "Coherence" },
              ]} value={editData.evaluationType || ""}
                onChange={(e) => setEditData(d => ({ ...d, evaluationType: e.target.value }))} />
              <Select label="Severity" id="edit-severity" options={[
                { value: "", label: "None" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]} value={editData.severity || ""}
                onChange={(e) => setEditData(d => ({ ...d, severity: e.target.value }))} />
              <Select label="Assigned To" id="edit-assignee" options={userOptions} value={editData.assignedToId || ""}
                onChange={(e) => setEditData(d => ({ ...d, assignedToId: e.target.value }))} />
            </div>
            <Input label="Confidence Score (0-100)" id="edit-score" type="number" min={0} max={100}
              value={editData.confidenceScore || ""}
              onChange={(e) => setEditData(d => ({ ...d, confidenceScore: e.target.value }))} />
            <Input label="Due Date" id="edit-due" type="datetime-local" value={editData.dueDate || ""}
              onChange={(e) => setEditData(d => ({ ...d, dueDate: e.target.value }))} />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setEditTarget(null)} disabled={editSubmitting}>Cancel</Button>
          <Button variant="danger" onClick={() => setDeleteTarget(editTarget)} disabled={editSubmitting}>
            <Trash2 className="w-4 h-4 mr-1.5" />Delete
          </Button>
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