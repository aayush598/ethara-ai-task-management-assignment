"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { cn, formatDate, getInitials } from "@/lib/utils"
import { Search, Loader2, FileText, AlertTriangle } from "lucide-react"

interface Task {
  id: string
  title: string
  status: string
  type: string
  severity: string
  score: number | null
  qaStatus: string
  assignee: string | null
  projectName: string
  dueDate: string | null
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

const severityBadge: Record<string, "emerald" | "amber" | "rose" | "rose"> = {
  low: "emerald",
  medium: "amber",
  high: "rose",
  critical: "rose",
}

const statusLabel: Record<string, string> = {
  all: "All Statuses",
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
  { value: "all", label: "All Severities" },
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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const debouncedSearch = useDebounce(searchQuery, 300)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set("search", debouncedSearch)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (severityFilter !== "all") params.set("severity", severityFilter)
      const res = await fetch(`/api/tasks?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch tasks")
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : data.tasks ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter, typeFilter, severityFilter])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-36 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-48 mb-1.5" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Failed to load tasks</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={fetchTasks}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-200 hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 active:scale-[0.97]"
        >
          <Loader2 className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Tasks
            </h1>
            <Badge variant="indigo">{tasks.length}</Badge>
          </div>
          <p className="text-sm text-slate-500 font-mono">
            Manage and review AI evaluation tasks
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-56 rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36"
          />
          <Select
            options={typeOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-36"
          />
          <Select
            options={severityOptions}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-36"
          />
        </div>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-semibold text-slate-500 mb-1">No tasks found</p>
            <p className="text-xs font-mono">Try adjusting your filters or create a new task</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="hidden lg:grid text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 px-6 py-3"
              style={{ gridTemplateColumns: "minmax(200px,2fr) 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr" }}
            >
              <span>Task</span>
              <span>Project</span>
              <span>Status</span>
              <span>Type</span>
              <span>Severity</span>
              <span>Score</span>
              <span>QA Status</span>
              <span>Assignee</span>
              <span>Due Date</span>
            </div>
            <div className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="grid items-center gap-2 px-4 lg:px-6 py-3.5 transition-colors hover:bg-slate-50/80"
                  style={{ gridTemplateColumns: "minmax(200px,2fr) 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr" }}
                >
                  <div className="min-w-0">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="text-[13px] font-semibold text-slate-800 hover:text-indigo-600 transition-colors truncate block leading-tight"
                    >
                      {task.title}
                    </Link>
                  </div>

                  <span className="text-xs text-slate-500 truncate hidden lg:block">
                    {task.projectName || "—"}
                  </span>

                  <div>
                    <Badge variant={statusBadge[task.status] || "slate"}>
                      {statusLabel[task.status] || task.status}
                    </Badge>
                  </div>

                  <div>
                    <Badge variant="indigo">{task.type || "—"}</Badge>
                  </div>

                  <div>
                    <Badge variant={severityBadge[task.severity] || "slate"}>
                      {task.severity ? task.severity.charAt(0).toUpperCase() + task.severity.slice(1) : "—"}
                    </Badge>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-600">
                    {task.score !== null && task.score !== undefined ? task.score : "—"}
                  </span>

                  <div>
                    {task.qaStatus ? (
                      <Badge variant={qaStatusBadge[task.qaStatus] || "slate"}>
                        {task.qaStatus.charAt(0).toUpperCase() + task.qaStatus.slice(1)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>

                  <div>
                    {task.assignee ? (
                      <div
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-[9px] font-bold text-white"
                        title={task.assignee}
                      >
                        {getInitials(task.assignee)}
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-400">
                        —
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-mono text-slate-500 hidden lg:block">
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
