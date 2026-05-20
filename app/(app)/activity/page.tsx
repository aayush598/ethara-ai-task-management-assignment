"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, timeAgo, getInitials } from "@/lib/utils"
import {
  Activity, Loader2, AlertTriangle, ChevronDown, ChevronUp, Code,
} from "lucide-react"

/* ── Types ── */

interface ActivityLog {
  id: string
  actionType: string
  performedById: string
  performerName: string | null
  performerImage: string | null
  targetEntity: string | null
  targetId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ActivityResponse {
  data: ActivityLog[]
  pagination: Pagination
}

/* ── Action helpers ── */

const actionLabels: Record<string, string> = {
  project_created: "created project",
  project_updated: "updated project",
  project_deleted: "deleted project",
  task_created: "created task",
  task_updated: "updated task",
  task_deleted: "deleted task",
  task_assigned: "assigned task to",
  task_status_changed: "changed status of",
  evaluation_submitted: "submitted evaluation for",
  comment_added: "commented on",
  member_added: "added member",
  member_removed: "removed member",
}

const actionBadgeVariants: Record<string, string> = {
  project_created: "indigo",
  task_created: "blue",
  task_assigned: "violet",
  task_status_changed: "amber",
  evaluation_submitted: "emerald",
  comment_added: "slate",
}

function badgeVariant(actionType: string) {
  return (actionBadgeVariants[actionType] || "slate") as "indigo" | "blue" | "violet" | "amber" | "emerald" | "slate"
}

function actionLabel(actionType: string) {
  return actionLabels[actionType] || actionType.replace(/_/g, " ")
}

/* ── Skeleton ── */

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-slate-200 rounded-xl", className)} />
}

/* ── Event dot color map ── */

const dotColors: Record<string, string> = {
  indigo: "bg-indigo-500",
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  slate: "bg-slate-400",
}

/* ── Main Component ── */

export default function ActivityPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/activity?page=${page}&limit=20`)
      if (!res.ok) throw new Error("Failed to fetch activity logs")
      const json: ActivityResponse = await res.json()
      setLogs(json.data)
      setPagination(json.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const toggleMetadata = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-start gap-4 p-5">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Failed to load activity</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={fetchLogs}
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 display">Activity Logs</h1>
        <Badge variant="indigo">Live</Badge>
      </div>
      <p className="text-sm text-slate-500 font-mono">
        Track all changes and events across your workspace
      </p>

      {/* Empty state */}
      {logs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">No activity yet</h3>
            <p className="text-xs text-slate-500 font-mono">Events will appear here as they happen</p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {logs.length > 0 && (
        <div className="relative">
          <div className="absolute left-[26px] top-0 bottom-0 w-px bg-slate-200" />
          <div className="space-y-2">
            {logs.map((log, idx) => {
              const variant = badgeVariant(log.actionType)
              const initials = log.performerName ? getInitials(log.performerName) : getInitials(log.performedById)
              const isExpanded = expandedIds.has(log.id)
              const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0

              return (
                <Card key={log.id} hover>
                  <CardContent className="flex items-start gap-4 p-5">
                    {/* Timeline dot */}
                    <div className="relative z-10 mt-1">
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm",
                        dotColors[variant] || "bg-slate-400"
                      )}>
                        {initials}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-sm font-semibold text-slate-900 truncate max-w-[160px]">
                            {log.performerName || log.performedById}
                          </span>
                          <span className="text-sm text-slate-500 whitespace-nowrap">
                            {actionLabel(log.actionType)}
                          </span>
                          {log.targetEntity && (
                            <span className="text-sm font-semibold text-indigo-600 truncate max-w-[200px]">
                              {log.targetEntity}
                            </span>
                          )}
                        </div>
                        <Badge variant={variant} className="shrink-0">
                          {log.actionType.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[11px] font-mono text-slate-400">
                          {timeAgo(log.createdAt)}
                        </span>
                        {hasMetadata && (
                          <button
                            onClick={() => toggleMetadata(log.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <Code className="w-3 h-3" />
                            {isExpanded ? "Hide" : "Details"}
                            {isExpanded
                              ? <ChevronUp className="w-3 h-3" />
                              : <ChevronDown className="w-3 h-3" />
                            }
                          </button>
                        )}
                      </div>

                      {hasMetadata && isExpanded && (
                        <pre className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] font-mono text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
            <span className="mx-1.5">&middot;</span>
            {pagination.total} total
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Sub-components ── */

function HeaderSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3 mb-1">
        <Skeleton className="w-8 h-8 rounded-xl" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-4 w-72 mb-6" />
    </>
  )
}
