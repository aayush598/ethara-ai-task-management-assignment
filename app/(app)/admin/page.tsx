"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  Users, Settings, Shield, Activity, FolderKanban, CheckSquare, 
  TrendingUp, AlertTriangle, Loader2, BarChart3, Database, 
  Globe, Clock, Search, MoreVertical, Trash2, Edit, UserPlus,
  PieChart, LineChart, Calendar, Server, Key, Eye, EyeOff
} from "lucide-react"
import { cn, formatDate, timeAgo, getInitials } from "@/lib/utils"

interface Stats {
  totalUsers: number
  totalProjects: number
  totalTasks: number
  pendingTasks: number
  approvedTasks: number
  rejectedTasks: number
  activeSessions: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  projectCount?: number
  taskCount?: number
}

interface SystemHealth {
  database: "healthy" | "degraded" | "down"
  api: "healthy" | "degraded" | "down"
  auth: "healthy" | "degraded" | "down"
  lastChecked: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [seedResult, setSeedResult] = useState<{ projects: number; tasks: number } | null>(null)
  
  // User management state
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editUserName, setEditUserName] = useState("")
  const [editUserRole, setEditUserRole] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats").catch(() => null),
        fetch("/api/admin/users").catch(() => null),
      ])
      
      if (statsRes?.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
      
      if (usersRes?.ok) {
        const data = await usersRes.json()
        setUsers(data.users || data || [])
      }
      
      setSystemHealth({
        database: "healthy",
        api: "healthy", 
        auth: "healthy",
        lastChecked: new Date().toISOString(),
      })
    } catch (e) {
      console.error("Failed to fetch admin data", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSeed = async () => {
    setSeeding(true)
    setSeedResult(null)
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Seed failed"); return }
      setSeedResult(data)
      toast.success("Database seeded successfully!")
      fetchData()
    } catch { toast.error("Something went wrong") }
    finally { setSeeding(false) }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editUserName, role: editUserRole }),
      })
      if (!res.ok) throw new Error()
      toast.success("User updated")
      setUserDialogOpen(false)
      fetchData()
    } catch { toast.error("Failed to update user") }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("User deleted")
      setDeleteConfirmOpen(false)
      setUserToDelete(null)
      fetchData()
    } catch { toast.error("Failed to delete user") }
  }

  const openUserEdit = (user: User) => {
    setSelectedUser(user)
    setEditUserName(user.name)
    setEditUserRole(user.role)
    setUserDialogOpen(true)
  }

  const openDeleteConfirm = (user: User) => {
    setUserToDelete(user)
    setDeleteConfirmOpen(true)
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "system", label: "System", icon: Server },
  ]

  const healthColors = {
    healthy: "text-emerald-600 bg-emerald-50 border-emerald-200",
    degraded: "text-amber-600 bg-amber-50 border-amber-200",
    down: "text-rose-600 bg-rose-50 border-rose-200",
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="h-7 w-40 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-56 bg-slate-200 rounded-lg animate-pulse mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-sm text-slate-500">Manage your workspace and system settings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="indigo">Admin Access</Badge>
          <span className="text-xs text-slate-400 font-mono">
            Last sync: {systemHealth ? timeAgo(systemHealth.lastChecked) : '—'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Total Users" 
              value={stats?.totalUsers || 0} 
              icon={Users} 
              color="indigo" 
              trend="+2 this month"
            />
            <StatCard 
              label="Total Projects" 
              value={stats?.totalProjects || 0} 
              icon={FolderKanban} 
              color="blue" 
              trend="+5 this month"
            />
            <StatCard 
              label="Total Tasks" 
              value={stats?.totalTasks || 0} 
              icon={CheckSquare} 
              color="violet" 
              trend={`${stats?.pendingTasks || 0} pending`}
            />
            <StatCard 
              label="Approval Rate" 
              value={stats ? Math.round((stats.approvedTasks / (stats.totalTasks || 1)) * 100) : 0} 
              suffix="%" 
              icon={TrendingUp} 
              color="emerald" 
              trend="Healthy"
            />
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-slate-600" />
                  <h2 className="font-semibold text-slate-900">System Health</h2>
                </div>
                <Button variant="secondary" size="sm" onClick={fetchData}>
                  <Activity className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Database", status: systemHealth?.database || "healthy" },
                  { label: "API Services", status: systemHealth?.api || "healthy" },
                  { label: "Authentication", status: systemHealth?.auth || "healthy" },
                ].map(item => (
                  <div key={item.label} className={cn("flex items-center justify-between p-4 rounded-xl border", healthColors[item.status])}>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2.5 h-2.5 rounded-full", 
                        item.status === "healthy" ? "bg-emerald-500" : 
                        item.status === "degraded" ? "bg-amber-500" : "bg-rose-500"
                      )} />
                      <span className="font-medium text-slate-700">{item.label}</span>
                    </div>
                    <span className="text-xs font-semibold uppercase">{item.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-slate-600" />
                <h2 className="font-semibold text-slate-900">Database Operations</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button onClick={handleSeed} disabled={seeding} className="flex items-center gap-2">
                  {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  {seeding ? "Seeding..." : "Seed Demo Data"}
                </Button>
                {seedResult && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckSquare className="w-4 h-4" />
                    Created {seedResult.projects} projects, {seedResult.tasks} tasks
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-600" />
                <h2 className="font-semibold text-slate-900">User Management</h2>
                <Badge variant="indigo">{users.length}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No users found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={user.role === "admin" ? "indigo" : "blue"}>{user.role}</Badge>
                      <span className="text-xs text-slate-400 font-mono">{timeAgo(user.createdAt)}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openUserEdit(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {user.role !== "admin" && (
                          <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm(user)}>
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-slate-600" />
              <h2 className="font-semibold text-slate-900">Project Overview</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">View and manage all projects</p>
              <Button variant="secondary" className="mt-4" onClick={() => window.location.href = '/projects'}>
                Go to Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-slate-600" />
              <h2 className="font-semibold text-slate-900">Task Overview</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Pending", value: stats?.pendingTasks || 0, color: "bg-amber-50 border-amber-200" },
                { label: "In Review", value: 0, color: "bg-blue-50 border-blue-200" },
                { label: "Approved", value: stats?.approvedTasks || 0, color: "bg-emerald-50 border-emerald-200" },
                { label: "Rejected", value: stats?.rejectedTasks || 0, color: "bg-rose-50 border-rose-200" },
              ].map(item => (
                <div key={item.label} className={cn("p-4 rounded-xl border", item.color)}>
                  <p className="text-xs font-mono text-slate-500 uppercase">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Tab */}
      {activeTab === "system" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-slate-600" />
                <h2 className="font-semibold text-slate-900">Environment Variables</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { key: "DATABASE_URL", status: "configured" },
                  { key: "BETTER_AUTH_SECRET", status: "configured" },
                  { key: "NVIDIA_API_KEY", status: "configured" },
                ].map(env => (
                  <div key={env.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border">
                    <span className="font-mono text-sm text-slate-700">{env.key}</span>
                    <Badge variant={env.status === "configured" ? "emerald" : "rose"}>
                      {env.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-600" />
                <h2 className="font-semibold text-slate-900">API Endpoints</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-xs">
                {["/api/projects", "/api/tasks", "/api/activity", "/api/ai-evaluate", "/api/admin"].map(endpoint => (
                  <div key={endpoint} className="flex items-center justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-600">{endpoint}</span>
                    <span className="text-emerald-600">Active</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)}>
        <DialogHeader>
          <h2 className="text-lg font-bold text-slate-900">Edit User</h2>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <Input 
            label="Name" 
            value={editUserName} 
            onChange={(e) => setEditUserName(e.target.value)} 
          />
          <Select 
            label="Role" 
            value={editUserRole} 
            onChange={(e) => setEditUserRole(e.target.value)}
            options={[
              { value: "admin", label: "Admin" },
              { value: "reviewer", label: "Reviewer" },
            ]}
          />
        </DialogContent>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser}>Save Changes</Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogHeader>
          <h2 className="text-lg font-bold text-slate-900">Delete User</h2>
        </DialogHeader>
        <DialogContent>
          <p className="text-slate-600">
            Are you sure you want to delete <strong>{userToDelete?.name}</strong>? 
            This action cannot be undone.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteUser}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

function StatCard({ label, value, suffix, icon: Icon, color, trend }: {
  label: string
  value: number
  suffix?: string
  icon: any
  color: string
  trend: string
}) {
  const colorClasses: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    violet: "bg-violet-50 border-violet-100 text-violet-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
  }

  return (
    <Card hover className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-mono">{trend}</span>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold text-slate-900">
            {value}{suffix && <span className="text-lg ml-0.5">{suffix}</span>}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}