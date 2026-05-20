"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { authClient } from "@/lib/auth-client"
import { cn, getInitials } from "@/lib/utils"
import { Settings, Shield, Palette, Mail, User, Loader2 } from "lucide-react"

interface UserData {
  name: string
  email: string
  image?: string
  role: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then((res: any) => {
      if (res.data?.user) {
        setUser({
          name: res.data.user.name,
          email: res.data.user.email,
          image: res.data.user.image || undefined,
          role: (res.data.user as any).role || "reviewer",
        })
      }
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-1">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="h-4 w-56 mb-6" />
        <div className="grid gap-6 max-w-2xl">
          <Card><CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardContent></Card>
          <Card><CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-40" />
          </CardContent></Card>
          <Card><CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-52" />
          </CardContent></Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
          <Loader2 className="w-7 h-7 text-rose-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Could not load settings</h2>
        <p className="text-sm text-slate-500">Please try refreshing the page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
          <Settings className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 display">Settings</h1>
      </div>
      <p className="text-sm text-slate-500 font-mono">
        Manage your account and workspace preferences
      </p>

      <div className="grid gap-6 max-w-2xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Profile</h2>
                <p className="text-[10px] font-mono text-slate-400">Your personal information</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                {getInitials(user.name)}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail className="w-3 h-3" />
                  <span className="font-mono">{user.email}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <Shield className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Account</h2>
                <p className="text-[10px] font-mono text-slate-400">Role and permissions</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-900">Role</p>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Determines what you can do in the workspace
                </p>
              </div>
              <Badge variant={user.role === "admin" ? "indigo" : "blue"}>
                {user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Palette className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Theme</h2>
                <p className="text-[10px] font-mono text-slate-400">Appearance preferences</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-900">Current Theme</p>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  The application uses light mode. Dark mode is not yet supported.
                </p>
              </div>
              <Badge variant="emerald">Light</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-slate-200 rounded-xl", className)} />
}
