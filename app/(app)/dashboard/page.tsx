"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts"
import {
  LayoutDashboard, Search, Filter, ArrowUp, ArrowDown, Activity,
  CheckCircle, Clock, AlertTriangle, Users, BarChart3, PieChart as PieChartIcon,
  List, Brain, FileText, Loader2, ChevronDown,
} from "lucide-react"

/* ── Types ── */
interface Project {
  id: string
  name: string
  status: string
  taskCount?: number
}

interface Task {
  id: string
  title: string
  status: string
  type: string
  score?: number | null
  assignee?: string
  projectId?: string
  createdAt?: string
  dueDate?: string
}

interface ActivityItem {
  id: string
  user: string
  action: string
  target: string
  type: string
  timestamp: string
}

interface DashboardData {
  projects: Project[]
  tasks: Task[]
  activity: ActivityItem[]
}

/* ── Debounce hook ── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/* ── Skeleton ── */
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-slate-200 rounded-xl", className)} />
}

/* ── Chart colors ── */
const CHART_COLORS = {
  indigo: "#6366f1",
  blue: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  violet: "#8b5cf6",
}

const PIE_COLORS = [CHART_COLORS.rose, CHART_COLORS.emerald, CHART_COLORS.indigo, CHART_COLORS.violet]

/* ── Mock chart data ── */
const weeklyData = [
  { day: "Mon", evaluations: 24 },
  { day: "Tue", evaluations: 38 },
  { day: "Wed", evaluations: 32 },
  { day: "Thu", evaluations: 45 },
  { day: "Fri", evaluations: 41 },
  { day: "Sat", evaluations: 18 },
  { day: "Sun", evaluations: 12 },
]

const distributionData = [
  { name: "Safety", value: 35 },
  { name: "Accuracy", value: 28 },
  { name: "Relevance", value: 22 },
  { name: "Coherence", value: 15 },
]

const statusBreakdownData = [
  { status: "Approved", count: 31, color: "emerald" },
  { status: "In Review", count: 8, color: "blue" },
  { status: "Pending", count: 12, color: "amber" },
  { status: "Rejected", count: 5, color: "rose" },
]

const statusStyle: Record<string, string> = {
  Approved: "text-emerald-700 bg-emerald-50 border-emerald-200",
  "In Review": "text-blue-700 bg-blue-50 border-blue-200",
  Pending: "text-amber-700 bg-amber-50 border-amber-200",
  Rejected: "text-rose-700 bg-rose-50 border-rose-200",
}

/* ── Main Dashboard ── */
export default function DashboardPage() {
  /* Data state */
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData>({ projects: [], tasks: [], activity: [] })

  /* Filter state */
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [projectFilter, setProjectFilter] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)

  /* Fetch data */
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [projectsRes, tasksRes, activityRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/tasks"),
        fetch("/api/activity"),
      ])
      if (!projectsRes.ok || !tasksRes.ok || !activityRes.ok) {
        throw new Error("Failed to fetch dashboard data")
      }
      const [projects, tasks, activityData] = await Promise.all([
        projectsRes.json(),
        tasksRes.json(),
        activityRes.json(),
      ])
      const activity = activityData.data || activityData
      setData({ projects, tasks, activity })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* Derived KPIs */
  const { tasks, projects, activity } = data
  const totalTasks = tasks.length
  const approved = tasks.filter((t) => t.status === "approved").length
  const pendingReview = tasks.filter((t) => t.status === "pending" || t.status === "in_review").length
  const approvalRate = totalTasks > 0 ? Math.round((approved / totalTasks) * 100) : 0
  const overdue = tasks.filter((t) => {
    if (!t.dueDate) return false
    return new Date(t.dueDate) < new Date() && t.status !== "approved"
  }).length
  const activeProjects = projects.filter((p) => p.status === "active").length

  const kpiCards = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: <FileText className="w-4 h-4" />,
      color: "indigo",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
    },
    {
      title: "Approved",
      value: approved,
      icon: <CheckCircle className="w-4 h-4" />,
      color: "emerald",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
    },
    {
      title: "Pending Review",
      value: pendingReview,
      icon: <Clock className="w-4 h-4" />,
      color: "amber",
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
    },
    {
      title: "Approval Rate",
      value: `${approvalRate}%`,
      icon: <Brain className="w-4 h-4" />,
      color: "blue",
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
    },
    {
      title: "Overdue",
      value: overdue,
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "rose",
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
    },
    {
      title: "Active Projects",
      value: activeProjects,
      icon: <LayoutDashboard className="w-4 h-4" />,
      color: "violet",
      bg: "bg-violet-50",
      text: "text-violet-600",
      border: "border-violet-100",
    },
  ]

  const recentActivity = activity.slice(0, 5)

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardContent className="p-6"><Skeleton className="h-56 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-56 w-full" /></CardContent></Card>
        </div>
      </div>
    )
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Failed to load dashboard</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-200 hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 active:scale-[0.97]"
        >
          <Loader2 className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  /* ── Main Content ── */
  return (
    <div className="space-y-6">

      {/* ════════════ HEADER ════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Dashboard
            </h1>
            <Badge variant="indigo">Live</Badge>
          </div>
          <p className="text-sm text-slate-500 font-mono">
            Overview of your AI evaluation workflows
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
            />
          </div>
          <Select
            options={[
              { value: "all", label: "All Statuses" },
              { value: "approved", label: "Approved" },
              { value: "pending", label: "Pending" },
              { value: "in_review", label: "In Review" },
              { value: "rejected", label: "Rejected" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36"
          />
          <Select
            options={[
              { value: "all", label: "All Projects" },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* ════════════ KPI CARDS ════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} hover>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", kpi.bg, kpi.text)}>
                  {kpi.icon}
                </div>
              </div>
              <p className={cn("text-2xl font-bold font-mono", kpi.text)}>
                {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", kpi.bg.replace("50", "400"))} />
                <span className="text-[10px] font-mono text-slate-400">
                  {kpi.title === "Approval Rate" ? "avg this period" : "current period"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ════════════ CHARTS ROW ════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar Chart - Weekly Evaluations */}
        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Weekly Evaluations</h3>
                  <p className="text-[10px] font-mono text-slate-400">Last 7 days</p>
                </div>
              </div>
              <Badge variant="indigo">Recharts</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fill: "#94a3b8" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      background: "white",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                    cursor={{ fill: "rgba(99,102,241,0.06)" }}
                  />
                  <Bar
                    dataKey="evaluations"
                    radius={[6, 6, 0, 0]}
                    fill="url(#barGradient)"
                    maxBarSize={48}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Evaluation Distribution */}
        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                  <PieChartIcon className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Evaluation Distribution</h3>
                  <p className="text-[10px] font-mono text-slate-400">By evaluation type</p>
                </div>
              </div>
              <Badge variant="violet">Breakdown</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      background: "white",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="hidden sm:flex flex-col gap-2.5 ml-2">
                {distributionData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-[11px] font-mono text-slate-600">{d.name}</span>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ════════════ BOTTOM ROW ════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Activity */}
        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
                  <p className="text-[10px] font-mono text-slate-400">Latest 5 events</p>
                </div>
              </div>
              <Badge variant="emerald">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Activity className="w-6 h-6 mb-2 opacity-50" />
                  <p className="text-xs font-mono">No recent activity</p>
                </div>
              ) : (
                recentActivity.map((item, i) => {
                  const typeColor: Record<string, string> = {
                    approved: "bg-emerald-500",
                    submitted: "bg-violet-500",
                    flagged: "bg-rose-500",
                    created: "bg-indigo-500",
                    commented: "bg-blue-500",
                    rejected: "bg-amber-500",
                  }
                  const bgColor = typeColor[item.type] || "bg-slate-400"
                  const initials = item.user === "System AI"
                    ? "AI"
                    : item.user.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 px-6 py-3.5 transition-colors hover:bg-slate-50/80"
                    >
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5", bgColor)}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 leading-relaxed">
                          <span className="font-semibold">{item.user}</span>
                          <span className="text-slate-500"> {item.action} </span>
                          <span className="font-semibold text-indigo-600">{item.target}</span>
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {formatTimestamp(item.timestamp)}
                        </p>
                      </div>
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0", bgColor)} />
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Status */}
        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <List className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Tasks by Status</h3>
                  <p className="text-[10px] font-mono text-slate-400">Current breakdown</p>
                </div>
              </div>
              <Badge variant="blue">{totalTasks} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                {statusBreakdownData.map((s) => {
                  const pct = totalTasks > 0 ? (s.count / totalTasks) * 100 : 0
                  const colorMap: Record<string, string> = {
                    emerald: "bg-emerald-500",
                    blue: "bg-blue-500",
                    amber: "bg-amber-500",
                    rose: "bg-rose-500",
                  }
                  return (
                    <div
                      key={s.status}
                      className={cn("h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full", colorMap[s.color])}
                      style={{ width: `${pct}%` }}
                    />
                  )
                })}
              </div>
              {/* Status list */}
              <div className="space-y-2.5">
                {statusBreakdownData.map((s) => {
                  const pct = totalTasks > 0 ? Math.round((s.count / totalTasks) * 100) : 0
                  return (
                    <div key={s.status} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-2 h-2 rounded-full", {
                          "bg-emerald-500": s.color === "emerald",
                          "bg-blue-500": s.color === "blue",
                          "bg-amber-500": s.color === "amber",
                          "bg-rose-500": s.color === "rose",
                        })} />
                        <span className={cn("text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border", statusStyle[s.status])}>
                          {s.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold font-mono text-slate-800">{s.count}</span>
                        <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

/* ── Helpers ── */
function formatTimestamp(timestamp: string): string {
  if (!timestamp) return "—"
  const now = new Date()
  const d = new Date(timestamp)
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
